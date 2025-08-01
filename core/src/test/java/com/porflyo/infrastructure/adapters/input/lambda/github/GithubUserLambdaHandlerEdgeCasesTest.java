package com.porflyo.infrastructure.adapters.input.lambda.github;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.domain.model.GithubUser;
import com.porflyo.testing.data.LambdaTestData;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.input.MockUserUseCase;
import com.porflyo.testing.mocks.ports.MockJwtPort;

import io.micronaut.json.JsonMapper;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;

@MicronautTest
@DisplayName("GithubUserLambdaHandler Edge Cases and Error Scenarios")
class GithubUserLambdaHandlerEdgeCasesTest {

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

    // Helper methods
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

    private GithubUserLambdaHandler createHandlerWithMockError(String errorMessage) {
        jwtPort = MockJwtPort.builder().throwOnExtract(new RuntimeException(errorMessage)).build();
        return createHandler(userUseCase, jwtPort);
    }

    @Nested
    @DisplayName("Input Validation & JWT Edge Cases")
    class InputValidationAndJwtEdgeCases {

        @Test
        @DisplayName("Should handle null and empty input events")
        void shouldHandleNullAndEmptyInputEvents() {
            // Given
            githubUserLambdaHandler = createHandlerWithMockError("No session cookie");

            // When - null input
            APIGatewayV2HTTPResponse nullResponse = githubUserLambdaHandler.handleUserRequest(null);
            
            // When - empty input
            APIGatewayV2HTTPResponse emptyResponse = githubUserLambdaHandler.handleUserRequest(new APIGatewayV2HTTPEvent());

            // Then
            assertErrorResponse(nullResponse, null);
            assertErrorResponse(emptyResponse, "No session cookie");
        }

        @Test
        @DisplayName("Should handle various JWT token formats")
        void shouldHandleVariousJwtTokenFormats() {
            // Given - very long token
            String veryLongToken = "a".repeat(1000);
            APIGatewayV2HTTPResponse longResponse = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithSessionCookie(veryLongToken));

            // Given - special characters token
            String specialToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.特殊字符.ñáéíóú";
            APIGatewayV2HTTPResponse specialResponse = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithSessionCookie(specialToken));

            // Given - encoded token
            String encodedToken = "session=value;with=special&chars%20encoded";
            APIGatewayV2HTTPResponse encodedResponse = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithSessionCookie(encodedToken));

            // Then
            assertSuccessResponse(longResponse);
            assertSuccessResponse(specialResponse);
            assertSuccessResponse(encodedResponse);
        }

        @Test
        @DisplayName("Should handle claims with problematic access tokens")
        void shouldHandleClaimsWithProblematicAccessTokens() {
            // Given - null access token
            GithubLoginClaims nullTokenClaims = new GithubLoginClaims("user", Instant.now(), 
                Instant.now().plusSeconds(3600), null);
            jwtPort = MockJwtPort.builder().extractedClaims(nullTokenClaims).build();
            userUseCase = MockUserUseCase.builder().onFind(id -> { throw new RuntimeException("Access token is null"); }).build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);

            // When
            APIGatewayV2HTTPResponse nullTokenResponse = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Given - empty access token
            GithubLoginClaims emptyTokenClaims = new GithubLoginClaims("user", Instant.now(), 
                Instant.now().plusSeconds(3600), "");
            jwtPort = MockJwtPort.builder().extractedClaims(emptyTokenClaims).build();
            githubUserLambdaHandler = createHandler(MockUserUseCase.withDefaults(), jwtPort);

            // When
            APIGatewayV2HTTPResponse emptyTokenResponse = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertErrorResponse(nullTokenResponse, "Access token is null");
            assertSuccessResponse(emptyTokenResponse);
        }

        @Test
        @DisplayName("Should handle very long access token and expired claims")
        void shouldHandleVeryLongAccessTokenAndExpiredClaims() {
            // Given - very long access token
            String longToken = "ghp_" + "a".repeat(1000);
            GithubLoginClaims longTokenClaims = new GithubLoginClaims("user", Instant.now(), 
                Instant.now().plusSeconds(3600), longToken);
            
            jwtPort = MockJwtPort.builder().extractedClaims(longTokenClaims).build();
            userUseCase = MockUserUseCase.builder()
                .onFind(id -> {
                    assertEquals(longToken, id);
                    return Optional.of(TestData.DEFAULT_USER);
                })
                .build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);

            // When
            APIGatewayV2HTTPResponse longTokenResponse = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Given - expired claims (should still work as expiry is not enforced in handler)
            GithubLoginClaims expiredClaims = new GithubLoginClaims("user", 
                Instant.now().minusSeconds(3600), Instant.now().minusSeconds(1800), TestData.DEFAULT_ACCESS_TOKEN);
            jwtPort = MockJwtPort.builder().extractedClaims(expiredClaims).build();
            githubUserLambdaHandler = createHandler(MockUserUseCase.withDefaults(), jwtPort);

            // When
            APIGatewayV2HTTPResponse expiredResponse = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertSuccessResponse(longTokenResponse);
            assertSuccessResponse(expiredResponse);
        }
    }

    @Nested
    @DisplayName("User Data & Cookie Edge Cases")
    class UserDataAndCookieEdgeCases {

        @Test
        @DisplayName("Should handle user data with null and extreme values")
        void shouldHandleUserDataWithNullAndExtremeValues() {
            // Given - user with null values
            GithubUser userWithNulls = new GithubUser(null, "12345", null, null, null);
            userUseCase = MockUserUseCase.builder().onFind(id -> Optional.of(userWithNulls)).build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);

            // When
            APIGatewayV2HTTPResponse nullResponse = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Given - user with very long values
            String longName = "a".repeat(1000);
            String longEmail = "user@" + "a".repeat(1000) + ".com";
            GithubUser userWithLongValues = new GithubUser("shortuser", "12345", longName, longEmail, 
                "https://avatar.example.com");
            userUseCase = MockUserUseCase.builder().onFind(id -> Optional.of(userWithLongValues)).build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);

            // When
            APIGatewayV2HTTPResponse longResponse = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertSuccessResponse(nullResponse);
            assertTrue(nullResponse.getBody().contains("12345"));
            assertSuccessResponse(longResponse);
            assertTrue(longResponse.getBody().contains("shortuser"));
        }

        @Test
        @DisplayName("Should handle unicode characters in user data")
        void shouldHandleUnicodeCharactersInUserData() {
            // Given
            GithubUser unicodeUser = new GithubUser("用户名", "12345", "测试用户 🚀", "用户@测试.com", 
                "https://avatar.example.com/测试");
            userUseCase = MockUserUseCase.builder().onFind(id -> Optional.of(unicodeUser)).build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);

            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertSuccessResponse(response);
            assertTrue(response.getBody().contains("用户名"));
        }

        @Test
        @DisplayName("Should handle problematic cookie scenarios")
        void shouldHandleProblematicCookieScenarios() {
            // Given - handler with cookie error
            githubUserLambdaHandler = createHandlerWithMockError("No session cookie");

            // When - malformed cookie header
            APIGatewayV2HTTPEvent malformedEvent = LambdaTestData.createBasicApiGatewayEvent();
            malformedEvent.setHeaders(Map.of("Cookie", "malformed=cookie=header=value"));
            APIGatewayV2HTTPResponse malformedResponse = githubUserLambdaHandler.handleUserRequest(malformedEvent);

            // When - empty cookie header
            APIGatewayV2HTTPEvent emptyEvent = LambdaTestData.createBasicApiGatewayEvent();
            emptyEvent.setHeaders(Map.of("Cookie", ""));
            APIGatewayV2HTTPResponse emptyResponse = githubUserLambdaHandler.handleUserRequest(emptyEvent);

            // When - no session cookie
            Map<String, String> nonSessionCookies = Map.of("preferences", "dark-mode", "language", "en-US");
            APIGatewayV2HTTPResponse noSessionResponse = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithCookies(nonSessionCookies));

            // Then
            assertErrorResponse(malformedResponse, "No session cookie");
            assertErrorResponse(emptyResponse, "No session cookie");
            assertErrorResponse(noSessionResponse, "No session cookie");
        }
    }

    @Nested
    @DisplayName("Error Recovery & Exception Handling")
    class ErrorRecoveryAndExceptionHandling {

        @ParameterizedTest
        @ValueSource(strings = {
            "JWT processing failed",
            "Invalid state", 
            "Request timeout",
            "Concurrent access error"
        })
        @DisplayName("Should handle various exception types consistently")
        void shouldHandleVariousExceptionTypesConsistently(String errorMessage) {
            // Given
            RuntimeException exception = errorMessage.contains("Invalid state") ? 
                new IllegalStateException(errorMessage) : new RuntimeException(errorMessage);

            userUseCase = MockUserUseCase.builder().onFind(id -> { throw exception; }).build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);

            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then
            assertErrorResponse(response, errorMessage);
        }

        @Test
        @DisplayName("Should handle concurrent exceptions gracefully")
        void shouldHandleConcurrentExceptionsGracefully() {
            // Given - both JWT and user service failing
            jwtPort = MockJwtPort.builder().throwOnExtract(new RuntimeException("JWT processing failed")).build();
            userUseCase = MockUserUseCase.builder().onFind(id -> { throw new RuntimeException("User service failed"); }).build();
            githubUserLambdaHandler = createHandler(userUseCase, jwtPort);

            // When
            APIGatewayV2HTTPResponse response = githubUserLambdaHandler.handleUserRequest(
                LambdaTestData.createEventWithDefaultSessionCookie());

            // Then - JWT error should be caught first
            assertErrorResponse(response, "JWT processing failed");
        }
    }
}
