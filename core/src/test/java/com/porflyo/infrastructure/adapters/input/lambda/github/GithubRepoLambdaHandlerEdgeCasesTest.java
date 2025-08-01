package com.porflyo.infrastructure.adapters.input.lambda.github;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.domain.model.GithubRepo;
import com.porflyo.testing.data.LambdaTestData;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.ports.MockJwtPort;
import com.porflyo.testing.mocks.useCase.MockRepoUseCase;

import io.micronaut.json.JsonMapper;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;

@MicronautTest
@DisplayName("GithubRepoLambdaHandler Edge Cases and Error Scenarios")
class GithubRepoLambdaHandlerEdgeCasesTest {

    private MockRepoUseCase repoUseCase;
    private MockJwtPort jwtPort;
    private JsonMapper jsonMapper;
    private GithubRepoLambdaHandler githubRepoLambdaHandler;

    @BeforeEach
    void setUp() {
        repoUseCase = MockRepoUseCase.withDefaults();
        jwtPort = MockJwtPort.withDefaults();
        jsonMapper = createMockJsonMapper();
        githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
    }

    // Helper methods
    private JsonMapper createMockJsonMapper() {
        JsonMapper mockMapper = mock(JsonMapper.class);
        try {
            when(mockMapper.writeValueAsString(any())).thenAnswer(invocation -> {
                Object arg = invocation.getArgument(0);
                if (arg instanceof List<?> list) {
                    if (list.isEmpty()) {
                        return "[]";
                    }
                    // Simple JSON serialization for test repos
                    StringBuilder sb = new StringBuilder("[");
                    for (int i = 0; i < list.size(); i++) {
                        if (i > 0) sb.append(",");
                        if (list.get(i) instanceof GithubRepo repo) {
                            sb.append(String.format(
                                "{\"name\":\"%s\",\"description\":\"%s\",\"html_url\":\"%s\"}",
                                repo.name(), repo.description(), repo.html_url()
                            ));
                        }
                    }
                    sb.append("]");
                    return sb.toString();
                }
                return "{}";
            });
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return mockMapper;
    }

    private GithubRepoLambdaHandler createHandler(MockRepoUseCase repoUseCase, MockJwtPort jwtPort) {
        return new GithubRepoLambdaHandler(repoUseCase, jwtPort, jsonMapper);
    }

    private void assertErrorResponse(APIGatewayV2HTTPResponse response, String expectedErrorMessage) {
        assertNotNull(response);
        assertEquals(500, response.getStatusCode());
        assertTrue(response.getBody().contains("error"));
        if (expectedErrorMessage != null) {
            assertTrue(response.getBody().contains(expectedErrorMessage));
        }
    }

    private void assertSuccessResponse(APIGatewayV2HTTPResponse response) {
        assertNotNull(response);
        assertEquals(200, response.getStatusCode());
    }

    private GithubRepoLambdaHandler createHandlerWithError(String errorMessage) {
        jwtPort = MockJwtPort.builder().throwOnExtract(new RuntimeException(errorMessage)).build();
        return createHandler(repoUseCase, jwtPort);
    }

    private GithubLoginClaims createClaimsWithToken(String token) {
        return new GithubLoginClaims("user", Instant.now(), Instant.now().plusSeconds(3600), token);
    }

    @Nested
    @DisplayName("Input Validation & JWT Edge Cases")
    class InputValidationAndJwtEdgeCases {

        @ParameterizedTest
        @ValueSource(strings = {"jwt_error", "special_chars", "encoded_token", "very_long"})
        @DisplayName("Should handle various input scenarios")
        void shouldHandleVariousInputScenarios(String scenario) {
            switch (scenario) {
                case "jwt_error" -> {
                    // Given - null/empty inputs
                    githubRepoLambdaHandler = createHandlerWithError("No session cookie");
                    APIGatewayV2HTTPResponse nullResponse = githubRepoLambdaHandler.handleUserRequest(null);
                    APIGatewayV2HTTPResponse emptyResponse = githubRepoLambdaHandler.handleUserRequest(new APIGatewayV2HTTPEvent());
                    // Then
                    assertErrorResponse(nullResponse, null);
                    assertErrorResponse(emptyResponse, "No session cookie");
                }
                case "special_chars" -> {
                    // Given - special characters token
                    String specialToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.特殊字符.ñáéíóú";
                    APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                        LambdaTestData.createEventWithSessionCookie(specialToken));
                    // Then
                    assertSuccessResponse(response);
                }
                case "encoded_token" -> {
                    // Given - encoded token
                    String encodedToken = "session=value;with=special&chars%20encoded";
                    APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                        LambdaTestData.createEventWithSessionCookie(encodedToken));
                    // Then
                    assertSuccessResponse(response);
                }
                case "very_long" -> {
                    // Given - very long token
                    String longToken = "a".repeat(1000);
                    APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                        LambdaTestData.createEventWithSessionCookie(longToken));
                    // Then
                    assertSuccessResponse(response);
                }
            }
        }

        @Test
        @DisplayName("Should handle problematic access tokens and expired claims")
        void shouldHandleProblematicTokensAndClaims() {
            // Given - null access token
            jwtPort = MockJwtPort.builder().extractedClaims(createClaimsWithToken(null)).build();
            repoUseCase = MockRepoUseCase.builder().getUserReposThrows(new RuntimeException("Access token is null")).build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            APIGatewayV2HTTPResponse nullTokenResponse = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Given - very long access token  
            String longToken = "ghp_" + "a".repeat(500);
            jwtPort = MockJwtPort.builder().extractedClaims(createClaimsWithToken(longToken)).build();
            repoUseCase = MockRepoUseCase.builder().getUserReposFunction(token -> {
                assertEquals(longToken, token);
                return TestData.DEFAULT_REPOS;
            }).build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            APIGatewayV2HTTPResponse longTokenResponse = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertErrorResponse(nullTokenResponse, "Access token is null");
            assertSuccessResponse(longTokenResponse);
        }
    }

    @Nested
    @DisplayName("Repository Data & Cookie Edge Cases")
    class RepositoryDataAndCookieEdgeCases {

        @ParameterizedTest
        @ValueSource(strings = {"null_values", "long_values", "unicode", "massive_list"})
        @DisplayName("Should handle various repository data scenarios")
        void shouldHandleVariousRepositoryDataScenarios(String scenario) {
            switch (scenario) {
                case "null_values" -> {
                    // Given - repos with null values
                    List<GithubRepo> reposWithNulls = List.of(
                        new GithubRepo(null, null, "https://github.com/user/repo1"),
                        new GithubRepo("valid-repo", "Valid description", null)
                    );
                    repoUseCase = MockRepoUseCase.builder().getUserRepos(reposWithNulls).build();
                    githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
                    APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                        LambdaTestData.createEventWithDefaultSessionCookie());
                    assertSuccessResponse(response);
                    assertTrue(response.getBody().contains("valid-repo"));
                }
                case "long_values" -> {
                    // Given - repos with very long values
                    String longName = "a".repeat(500);
                    String longDescription = "Description: " + "b".repeat(1000);
                    List<GithubRepo> reposWithLongValues = List.of(
                        new GithubRepo(longName, longDescription, "https://github.com/user/long-repo")
                    );
                    repoUseCase = MockRepoUseCase.builder().getUserRepos(reposWithLongValues).build();
                    githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
                    APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                        LambdaTestData.createEventWithDefaultSessionCookie());
                    assertSuccessResponse(response);
                    assertTrue(response.getBody().contains("aaa")); // Part of long name
                }
                case "unicode" -> {
                    // Given - unicode characters
                    List<GithubRepo> unicodeRepos = List.of(
                        new GithubRepo("项目-α", "项目描述 with émojis 🚀", "https://github.com/用户/项目-α"),
                        new GithubRepo("проект-β", "Описание проекта", "https://github.com/пользователь/проект-β")
                    );
                    repoUseCase = MockRepoUseCase.builder().getUserRepos(unicodeRepos).build();
                    githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
                    APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                        LambdaTestData.createEventWithDefaultSessionCookie());
                    assertSuccessResponse(response);
                    assertTrue(response.getBody().contains("项目-α"));
                }
                case "massive_list" -> {
                    // Given - very large repository list
                    List<GithubRepo> massiveRepos = java.util.stream.IntStream.rangeClosed(1, 500)
                        .mapToObj(i -> new GithubRepo("repo-" + i, "Description " + i, "https://github.com/user/repo-" + i))
                        .toList();
                    repoUseCase = MockRepoUseCase.builder().getUserRepos(massiveRepos).build();
                    githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
                    APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                        LambdaTestData.createEventWithDefaultSessionCookie());
                    assertSuccessResponse(response);
                    assertTrue(response.getBody().contains("repo-1"));
                    assertTrue(response.getBody().contains("repo-500"));
                }
            }
        }

        @ParameterizedTest
        @ValueSource(strings = {"malformed", "empty", "no_session"})
        @DisplayName("Should handle problematic cookie scenarios")
        void shouldHandleProblematicCookieScenarios(String cookieType) {
            // Given - handler with cookie error
            githubRepoLambdaHandler = createHandlerWithError("No session cookie");

            APIGatewayV2HTTPResponse response = switch (cookieType) {
                case "malformed" -> {
                    APIGatewayV2HTTPEvent event = LambdaTestData.createBasicApiGatewayEvent();
                    event.setHeaders(Map.of("Cookie", "malformed=cookie=header=value"));
                    yield githubRepoLambdaHandler.handleUserRequest(event);
                }
                case "empty" -> {
                    APIGatewayV2HTTPEvent event = LambdaTestData.createBasicApiGatewayEvent();
                    event.setHeaders(Map.of("Cookie", ""));
                    yield githubRepoLambdaHandler.handleUserRequest(event);
                }
                case "no_session" -> {
                    Map<String, String> nonSessionCookies = Map.of("theme", "light", "timezone", "UTC");
                    yield githubRepoLambdaHandler.handleUserRequest(
                        LambdaTestData.createEventWithCookies(nonSessionCookies));
                }
                default -> throw new IllegalArgumentException("Unknown cookie type: " + cookieType);
            };

            // Then
            assertErrorResponse(response, "No session cookie");
        }
    }

    @Nested
    @DisplayName("Error Recovery & Exception Handling")
    class ErrorRecoveryAndExceptionHandling {

        @ParameterizedTest
        @ValueSource(strings = {
            "JWT processing failed",
            "Repository access forbidden", 
            "Network timeout",
            "Service unavailable",
            "Repository fetch timeout after 30 seconds",
            "Failed to serialize repository data"
        })
        @DisplayName("Should handle various exception types consistently")
        void shouldHandleVariousExceptionTypesConsistently(String errorMessage) {
            // Given
            RuntimeException exception = errorMessage.contains("Repository access forbidden") ? 
                new IllegalStateException(errorMessage) : new RuntimeException(errorMessage);
            
            repoUseCase = MockRepoUseCase.builder().getUserReposThrows(exception).build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);

            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            String expectedMessage = errorMessage.contains("Repository fetch timeout") ? "Repository fetch timeout" : errorMessage;
            assertErrorResponse(response, expectedMessage);
        }

        @Test
        @DisplayName("Should handle concurrent exceptions gracefully")
        void shouldHandleConcurrentExceptionsGracefully() {
            // Given - both JWT and repo service failing
            jwtPort = MockJwtPort.builder().throwOnExtract(new RuntimeException("JWT processing failed")).build();
            repoUseCase = MockRepoUseCase.builder().getUserReposThrows(new RuntimeException("Repo service failed")).build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);

            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then - JWT error should be caught first
            assertErrorResponse(response, "JWT processing failed");
        }
    }
}
