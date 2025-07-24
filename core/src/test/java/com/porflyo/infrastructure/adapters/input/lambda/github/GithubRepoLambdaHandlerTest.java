package com.porflyo.infrastructure.adapters.input.lambda.github;

import static org.junit.jupiter.api.Assertions.*;

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

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.domain.model.GithubRepo;
import com.porflyo.testing.data.LambdaTestData;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.ports.MockJwtPort;
import com.porflyo.testing.mocks.useCase.MockRepoUseCase;

@DisplayName("GithubRepoLambdaHandler Tests")
class GithubRepoLambdaHandlerTest {

    private MockRepoUseCase repoUseCase;
    private MockJwtPort jwtPort;
    private GithubRepoLambdaHandler githubRepoLambdaHandler;

    @BeforeEach
    void setUp() {
        repoUseCase = MockRepoUseCase.withDefaults();
        jwtPort = MockJwtPort.withDefaults();
        githubRepoLambdaHandler = new GithubRepoLambdaHandler(repoUseCase, jwtPort);
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

    private List<GithubRepo> createTestRepos(String... repoNames) {
        return List.of(repoNames).stream()
            .map(name -> new GithubRepo(name, "Description for " + name, "https://github.com/user/" + name))
            .toList();
    }

    private GithubLoginClaims createTestClaims(String userId, String accessToken) {
        return new GithubLoginClaims(userId, Instant.now(), Instant.now().plusSeconds(3600), accessToken);
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
            List<GithubRepo> customRepos = createTestRepos("custom-repo-1", "custom-repo-2", "custom-repo-3");
            GithubLoginClaims claims = createTestClaims("customuser", accessToken);
            
            jwtPort = MockJwtPort.builder().extractedClaims(claims).build();
            repoUseCase = MockRepoUseCase.builder()
                .getUserReposFunction(token -> {
                    assertEquals(accessToken, token);
                    return customRepos;
                })
                .build();
            githubRepoLambdaHandler = new GithubRepoLambdaHandler(repoUseCase, jwtPort);
            
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
            List<GithubRepo> emptyRepos = List.of();
            repoUseCase = MockRepoUseCase.builder().getUserRepos(emptyRepos).build();
            githubRepoLambdaHandler = new GithubRepoLambdaHandler(repoUseCase, jwtPort);
            
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
            List<GithubRepo> specialRepos = List.of(
                new GithubRepo("repo-with-dashes", "Description with émojis 🚀", "https://github.com/user/repo-with-dashes"),
                new GithubRepo("repo_with_underscores", "Descripción con caracteres especiales", "https://github.com/user/repo_with_underscores")
            );
            repoUseCase = MockRepoUseCase.builder().getUserRepos(specialRepos).build();
            githubRepoLambdaHandler = new GithubRepoLambdaHandler(repoUseCase, jwtPort);
            
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
            githubRepoLambdaHandler = new GithubRepoLambdaHandler(repoUseCase, jwtPort);
            
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
            githubRepoLambdaHandler = new GithubRepoLambdaHandler(repoUseCase, jwtPort);
            
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
            githubRepoLambdaHandler = new GithubRepoLambdaHandler(repoUseCase, jwtPort);
            
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
            githubRepoLambdaHandler = new GithubRepoLambdaHandler(repoUseCase, jwtPort);
            
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
            List<GithubRepo> integrationRepos = createTestRepos("integration-repo-1", "integration-repo-2");
            GithubLoginClaims integrationClaims = createTestClaims("integrationuser", integrationAccessToken);
            
            jwtPort = MockJwtPort.builder().extractedClaims(integrationClaims).build();
            repoUseCase = MockRepoUseCase.builder()
                .getUserReposFunction(accessToken -> {
                    assertEquals(integrationAccessToken, accessToken);
                    return integrationRepos;
                })
                .build();
            githubRepoLambdaHandler = new GithubRepoLambdaHandler(repoUseCase, jwtPort);
            
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
            List<GithubRepo> manyRepos = List.of(
                "repo1", "repo2", "repo3", "repo4", "repo5", "repo6", "repo7", "repo8", "repo9", "repo10"
            ).stream()
                .map(name -> new GithubRepo(name, "Description", "https://github.com/user/" + name))
                .toList();
            
            repoUseCase = MockRepoUseCase.builder().getUserRepos(manyRepos).build();
            githubRepoLambdaHandler = new GithubRepoLambdaHandler(repoUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubRepoLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertSuccessResponse(response, "repo1", "repo5", "repo10");
            assertEquals(200, response.getStatusCode());
        }
    }
}
