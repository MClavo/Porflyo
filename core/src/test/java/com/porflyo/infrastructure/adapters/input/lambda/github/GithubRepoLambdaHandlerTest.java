package com.porflyo.infrastructure.adapters.input.lambda.github;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.domain.model.provider.ProviderRepo;
import com.porflyo.domain.model.user.UserClaims;
import com.porflyo.infrastructure.adapters.input.lambda.api.ProviderRepoLambdaHandler;
import com.porflyo.testing.data.LambdaTestData;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.input.MockRepoUseCase;
import com.porflyo.testing.mocks.ports.MockJwtPort;

import io.micronaut.json.JsonMapper;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;

@MicronautTest()
@DisplayName("GithubRepoLambdaHandler Tests")
class GithubRepoLambdaHandlerTest {

    private MockRepoUseCase repoUseCase;
    private MockJwtPort jwtPort;
    private ProviderRepoLambdaHandler githubRepoLambdaHandler;

    // Helper method to create a mock JsonMapper
    private JsonMapper createMockJsonMapper() {
        JsonMapper mockMapper = Mockito.mock(JsonMapper.class);
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
                        if (list.get(i) instanceof ProviderRepo repo) {
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

    // Helper method to create handler with mocked JsonMapper
    private ProviderRepoLambdaHandler createHandler(MockRepoUseCase repoUseCase, MockJwtPort jwtPort) {
        return new ProviderRepoLambdaHandler(repoUseCase, jwtPort, createMockJsonMapper());
    }

    @BeforeEach
    void setUp() {
        repoUseCase = MockRepoUseCase.withDefaults();
        jwtPort = MockJwtPort.withDefaults();
        githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
    }

    // Helper methods for common assertions
    private void assertSuccessResponse(APIGatewayV2HTTPResponse response, String... expectedRepoNames) {
        assertNotNull(response);
        assertEquals(200, response.getStatusCode());
        for (String repoName : expectedRepoNames) {
            assertTrue(response.getBody().contains(repoName));
        }
        assertEquals("application/json", response.getHeaders().get("Content-Type"));
    }

    private void assertErrorResponse(APIGatewayV2HTTPResponse response, String expectedErrorMessage) {
        assertNotNull(response);
        assertEquals(500, response.getStatusCode());
        assertTrue(response.getBody().contains("error"));
        if (expectedErrorMessage != null) {
            assertTrue(response.getBody().contains(expectedErrorMessage));
        }
    }

    private List<ProviderRepo> createTestRepos(String... repoNames) {
        return List.of(repoNames).stream()
            .map(name -> new ProviderRepo(name, "Description for " + name, "https://github.com/user/" + name))
            .toList();
    }

    private UserClaims createTestClaims(String userId, String accessToken) {
        return new UserClaims(userId, Instant.now(), Instant.now().plusSeconds(3600));
    }

    @Nested
    @DisplayName("Success Scenarios")
    class SuccessScenarios {

        @Test
        @DisplayName("Should return repositories with default session cookie")
        void shouldReturnRepositoriesWithDefaultSessionCookie() {
            // Given
            APIGatewayV2HTTPEvent input = LambdaTestData.createEventWithDefaultSessionCookie();
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(input);

            // Then
            assertSuccessResponse(response, TestData.REPO_1.name(), TestData.REPO_2.name());
        }

        @Test
        @DisplayName("Should handle custom repositories and verify access token flow")
        void shouldHandleCustomRepositoriesAndVerifyAccessTokenFlow() {
            // Given
            String accessToken = "custom_token_456";
            List<ProviderRepo> customRepos = createTestRepos("custom-repo-1", "custom-repo-2", "custom-repo-3");
            UserClaims claims = createTestClaims("customuser", accessToken);
            
            jwtPort = MockJwtPort.builder().extractedClaims(claims).build();
            repoUseCase = MockRepoUseCase.builder()
                .getUserRepos(customRepos)
                .build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithSessionCookie("custom.jwt.token"));

            // Then
            assertSuccessResponse(response, "custom-repo-1", "custom-repo-2", "custom-repo-3");
        }

        @Test
        @DisplayName("Should handle empty repository list")
        void shouldHandleEmptyRepositoryList() {
            // Given
            List<ProviderRepo> emptyRepos = List.of();
            repoUseCase = MockRepoUseCase.builder().getUserRepos(emptyRepos).build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertNotNull(response);
            assertEquals(200, response.getStatusCode());
            assertTrue(response.getBody().contains("[]") || response.getBody().isEmpty());
        }

        @Test
        @DisplayName("Should handle repositories with special characters")
        void shouldHandleRepositoriesWithSpecialCharacters() {
            // Given
            List<ProviderRepo> specialRepos = List.of(
                new ProviderRepo("repo-with-dashes", "Description with émojis 🚀", "https://github.com/user/repo-with-dashes"),
                new ProviderRepo("repo_with_underscores", "Descripción con caracteres especiales", "https://github.com/user/repo_with_underscores")
            );
            repoUseCase = MockRepoUseCase.builder().getUserRepos(specialRepos).build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertSuccessResponse(response, "repo-with-dashes", "repo_with_underscores");
        }
    }

    @Nested
    @DisplayName("Authentication & Error Handling")
    class AuthenticationAndErrorHandling {

        @Test
        @DisplayName("Should handle multiple cookies correctly")
        void shouldHandleMultipleCookiesCorrectly() {
            // Given
            Map<String, String> cookies = Map.of(
                "session", TestData.DEFAULT_JWT_TOKEN,
                "theme", "dark",
                "lang", "es-ES"
            );
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithCookies(cookies));

            // Then
            assertSuccessResponse(response, TestData.REPO_1.name(), TestData.REPO_2.name());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {" ", "\t", "invalid-jwt-token"})
        @DisplayName("Should return error for invalid session cookies")
        void shouldReturnErrorForInvalidSessionCookies(String invalidToken) {
            // Given
            jwtPort = MockJwtPort.builder()
                .throwOnExtract(new RuntimeException("Invalid JWT token"))
                .build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            
            APIGatewayV2HTTPEvent input = invalidToken == null ? 
                LambdaTestData.createEventWithNoCookies() :
                LambdaTestData.createEventWithSessionCookie(invalidToken);
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(input);

            // Then
            assertErrorResponse(response, "Invalid JWT token");
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "GitHub API error",
            "Invalid access token", 
            "API rate limit exceeded",
            "Repository access denied"
        })
        @DisplayName("Should handle repository service errors")
        void shouldHandleRepositoryServiceErrors(String errorMessage) {
            // Given
            repoUseCase = MockRepoUseCase.builder()
                .getUserReposThrows(new RuntimeException(errorMessage))
                .build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertErrorResponse(response, errorMessage);
        }

        @Test
        @DisplayName("Should handle null pointer exceptions gracefully")
        void shouldHandleNullPointerExceptionsGracefully() {
            // Given
            repoUseCase = MockRepoUseCase.builder()
                .getUserReposThrows(new NullPointerException("Null value encountered"))
                .build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertErrorResponse(response, "Null value encountered");
        }
    }

    @Nested
    @DisplayName("Response Format & Integration")
    class ResponseFormatAndIntegration {

        @Test
        @DisplayName("Should return properly formatted success response with CORS headers")
        void shouldReturnProperlyFormattedSuccessResponseWithCorsHeaders() {
            // Given
            APIGatewayV2HTTPEvent input = LambdaTestData.createEventWithDefaultSessionCookie();
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(input);

            // Then
            assertNotNull(response);
            assertEquals(200, response.getStatusCode());
            assertEquals("application/json", response.getHeaders().get("Content-Type"));
            
            // Verify CORS headers are present
            assertTrue(response.getHeaders().containsKey("Access-Control-Allow-Origin"));
            assertTrue(response.getHeaders().containsKey("Access-Control-Allow-Headers"));
            assertTrue(response.getHeaders().containsKey("Access-Control-Allow-Methods"));
        }

        @Test
        @DisplayName("Should return properly formatted error response")
        void shouldReturnProperlyFormattedErrorResponse() {
            // Given
            repoUseCase = MockRepoUseCase.builder()
                .getUserReposThrows(new RuntimeException("Test error"))
                .build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertEquals(500, response.getStatusCode());
            assertTrue(response.getBody().startsWith("{"));
            assertTrue(response.getBody().endsWith("}"));
            assertTrue(response.getBody().contains("error"));
        }

        @Test
        @DisplayName("Should complete full end-to-end repository retrieval flow")
        void shouldCompleteFullEndToEndRepositoryRetrievalFlow() {
            // Given
            String integrationAccessToken = "integration_access_token_repos";
            List<ProviderRepo> integrationRepos = createTestRepos("integration-repo-1", "integration-repo-2");
            UserClaims integrationClaims = createTestClaims("integrationuser", integrationAccessToken);
            
            jwtPort = MockJwtPort.builder().extractedClaims(integrationClaims).build();
            repoUseCase = MockRepoUseCase.builder()
                .getUserRepos(integrationRepos)
                .build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithSessionCookie("integration.jwt.token"));

            // Then
            assertSuccessResponse(response, "integration-repo-1", "integration-repo-2");
            assertTrue(response.getBody().contains("Description for integration-repo-1"));
        }

        @Test
        @DisplayName("Should handle large number of repositories")
        void shouldHandleLargeNumberOfRepositories() {
            // Given
            List<ProviderRepo> manyRepos = List.of(
                "repo1", "repo2", "repo3", "repo4", "repo5", "repo6", "repo7", "repo8", "repo9", "repo10"
            ).stream()
                .map(name -> new ProviderRepo(name, "Description", "https://github.com/user/" + name))
                .toList();
            
            repoUseCase = MockRepoUseCase.builder().getUserRepos(manyRepos).build();
            githubRepoLambdaHandler = createHandler(repoUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertSuccessResponse(response, "repo1", "repo5", "repo10");
            assertEquals(200, response.getStatusCode());
        }
    }
}
