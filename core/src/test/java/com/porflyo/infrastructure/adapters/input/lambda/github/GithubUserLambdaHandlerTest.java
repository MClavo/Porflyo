package com.porflyo.infrastructure.adapters.input.lambda.github;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
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
import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.domain.model.GithubUser;
import com.porflyo.testing.data.LambdaTestData;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.ports.MockJwtPort;
import com.porflyo.testing.mocks.useCase.MockUserUseCase;

import io.micronaut.json.JsonMapper;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;

@MicronautTest
@DisplayName("GithubUserLambdaHandler Tests")
class GithubUserLambdaHandlerTest {

    private MockUserUseCase userUseCase;
    private MockJwtPort jwtPort;
    private GithubUserLambdaHandler githubUserLambdaHandler;

    // Helper method to create a mock JsonMapper
    private JsonMapper createMockJsonMapper() {
        JsonMapper mockMapper = Mockito.mock(JsonMapper.class);
        try {
            when(mockMapper.writeValueAsString(any())).thenAnswer(invocation -> {
                Object arg = invocation.getArgument(0);
                if (arg instanceof GithubUser user) {
                    return String.format(
                        "{\"login\":\"%s\",\"id\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"avatar_url\":\"%s\"}",
                        user.login(), user.id(), user.name(), user.email(), user.avatar_url()
                    );
                }
                return "{}";
            });
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return mockMapper;
    }

    // Helper method to create handler with mocked JsonMapper
    private GithubUserLambdaHandler createHandler(MockUserUseCase userUseCase, MockJwtPort jwtPort) {
        return new GithubUserLambdaHandler(createMockJsonMapper(), userUseCase, jwtPort);
    }

    @BeforeEach
    void setUp() {
        userUseCase = MockUserUseCase.withDefaults();
        jwtPort = MockJwtPort.withDefaults();
        githubUserLambdaHandler = createHandler(userUseCase, jwtPort);
    }

    // Helper methods for common assertions
    private void assertSuccessResponse(APIGatewayV2HTTPResponse response, String expectedLogin, String expectedEmail) {
        assertNotNull(response);
        assertEquals(200, response.getStatusCode());
        assertTrue(response.getBody().contains(expectedLogin));
        assertTrue(response.getBody().contains(expectedEmail));
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

    private GithubUser createTestUser(String login, String id, String name, String email) {
        return new GithubUser(login, id, name, email, "https://avatar.test.com");
    }

    private GithubLoginClaims createTestClaims(String userId, String accessToken) {
        return new GithubLoginClaims(userId, Instant.now(), Instant.now().plusSeconds(3600), accessToken);
    }

    @Nested
    @DisplayName("Success Scenarios")
    class SuccessScenarios {

        @Test
        @DisplayName("Should return user data with default session cookie")
        void shouldReturnUserDataWithDefaultSessionCookie() {
            // Given
            APIGatewayV2HTTPEvent input = LambdaTestData.createEventWithDefaultSessionCookie();
            
            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(input);

            // Then
            assertSuccessResponse(response, TestData.DEFAULT_USER.login(), TestData.DEFAULT_USER.email());
        }

        @Test
        @DisplayName("Should handle custom user data and verify access token flow")
        void shouldHandleCustomUserDataAndVerifyAccessTokenFlow() {
            // Given
            String accessToken = "test_token_123";
            GithubUser customUser = createTestUser("testUser", "696969", "test user", "user@test.com");
            GithubLoginClaims claims = createTestClaims("696969", accessToken);
            
            jwtPort = MockJwtPort.builder().extractedClaims(claims).build();
            userUseCase = MockUserUseCase.builder()
                .getUserDataFunction(token -> {
                    assertEquals(accessToken, token);
                    return customUser;
                })
                .build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithSessionCookie("test_token_123"));

            // Then
            assertSuccessResponse(response, "testUser", "user@test.com");
        }

        @Test
        @DisplayName("Should handle special characters in user data")
        void shouldHandleSpecialCharactersInUserData() {
            // Given
            GithubUser specialUser = createTestUser("user-with.special_chars", "99999", 
                "山田 太郎", "yamada.taro@example.com");
            userUseCase = MockUserUseCase.builder().getUserData(specialUser).build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertSuccessResponse(response, "user-with.special_chars", "yamada.taro@example.com");
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
                "preferences", "dark-mode",
                "language", "en-US"
            );
            
            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithCookies(cookies));

            // Then
            assertSuccessResponse(response, TestData.DEFAULT_USER.login(), TestData.DEFAULT_USER.email());
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
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);
            
            APIGatewayV2HTTPEvent input = invalidToken == null ? 
                LambdaTestData.createEventWithNoCookies() :
                LambdaTestData.createEventWithSessionCookie(invalidToken);
            
            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(input);

            // Then
            assertErrorResponse(response, "Invalid JWT token");
        }

        @ParameterizedTest
        @ValueSource(strings = {
            "GitHub API error",
            "Invalid access token", 
            "API rate limit exceeded"
        })
        @DisplayName("Should handle user service errors")
        void shouldHandleUserServiceErrors(String errorMessage) {
            // Given
            userUseCase = MockUserUseCase.builder()
                .getUserDataThrows(new RuntimeException(errorMessage))
                .build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertErrorResponse(response, errorMessage);
        }

        @Test
        @DisplayName("Should handle null pointer exceptions gracefully")
        void shouldHandleNullPointerExceptionsGracefully() {
            // Given
            userUseCase = MockUserUseCase.builder()
                .getUserDataThrows(new NullPointerException("Null value encountered"))
                .build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(
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
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(input);

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
            userUseCase = MockUserUseCase.builder()
                .getUserDataThrows(new RuntimeException("Test error"))
                .build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertEquals(500, response.getStatusCode());
            assertTrue(response.getBody().startsWith("{"));
            assertTrue(response.getBody().endsWith("}"));
            assertTrue(response.getBody().contains("error"));
        }

        @Test
        @DisplayName("Should complete full end-to-end user data retrieval flow")
        void shouldCompleteFullEndToEndUserDataRetrievalFlow() {
            // Given
            String integrationAccessToken = "integration_access_token";
            GithubUser integrationUser = createTestUser("integrationuser", "88888", 
                "Integration Test User", "integration@test.com");
            GithubLoginClaims integrationClaims = createTestClaims("88888", integrationAccessToken);
            
            jwtPort = MockJwtPort.builder().extractedClaims(integrationClaims).build();
            userUseCase = MockUserUseCase.builder()
                .getUserDataFunction(accessToken -> {
                    assertEquals(integrationAccessToken, accessToken);
                    return integrationUser;
                })
                .build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);
            
            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithSessionCookie("integration.jwt.token"));

            // Then
            assertSuccessResponse(response, "integrationuser", "integration@test.com");
            assertTrue(response.getBody().contains("88888"));
        }
    }
}
