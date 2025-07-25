package com.porflyo.infrastructure.adapters.input.lambda.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.testing.data.LambdaTestData;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.ports.MockConfigurationPort;
import com.porflyo.testing.mocks.ports.MockJwtPort;
import com.porflyo.testing.mocks.useCase.MockAuthUseCase;

@DisplayName("AuthLambdaHandler Edge Cases and Error Scenarios")
class AuthLambdaHandlerEdgeCasesTest {

    private MockAuthUseCase authUseCase;
    private MockConfigurationPort configurationPort;
    private MockJwtPort jwtPort;
    private AuthLambdaHandler authLambdaHandler;
    private APIGatewayV2HTTPEvent input;

    @BeforeEach
    void setUp() {
        authUseCase = MockAuthUseCase.withDefaults();
        configurationPort = MockConfigurationPort.withDefaults();
        jwtPort = MockJwtPort.withDefaults();
        authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);
        input = LambdaTestData.createBasicApiGatewayEvent();
    }

    @Nested
    @DisplayName("OAuth Login Edge Cases")
    class OAuthLoginEdgeCases {

        @Test
        @DisplayName("Should handle null input event")
        void shouldHandleNullInputEvent() {
            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOauthLogin(null);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(TestData.DEFAULT_LOGIN_URL, response.getHeaders().get("Location"));
        }

        @Test
        @DisplayName("Should handle empty input event")
        void shouldHandleEmptyInputEvent() {
            // Given
            APIGatewayV2HTTPEvent input = new APIGatewayV2HTTPEvent();

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOauthLogin(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(TestData.DEFAULT_LOGIN_URL, response.getHeaders().get("Location"));
        }

        @Test
        @DisplayName("Should handle very long OAuth URL")
        void shouldHandleVeryLongOAuthUrl() {
            // Given
            String longUrl = "https://github.com/login/oauth/authorize?" + 
                "client_id=" + "a".repeat(1000) + 
                "&redirect_uri=" + "b".repeat(1000) +
                "&scope=" + "c".repeat(1000);
            
            authUseCase = MockAuthUseCase.builder()
                .buildOAuthLoginUrl(longUrl)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOauthLogin(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(longUrl, response.getHeaders().get("Location"));
        }

        @Test
        @DisplayName("Should handle OAuth URL with special characters")
        void shouldHandleOAuthUrlWithSpecialCharacters() {
            // Given
            String specialUrl = "https://github.com/login/oauth/authorize?client_id=test%20id&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback%3Fstate%3Dtest";
            
            authUseCase = MockAuthUseCase.builder()
                .buildOAuthLoginUrl(specialUrl)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOauthLogin(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(specialUrl, response.getHeaders().get("Location"));
        }
    }

    @Nested
    @DisplayName("OAuth Callback Edge Cases")
    class OAuthCallbackEdgeCases {

        @Test
        @DisplayName("Should handle null input event")
        void shouldHandleNullInputEvent() {
            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(null);

            // Then
            assertNotNull(response);
            assertEquals(500, response.getStatusCode());
            assertTrue(response.getBody().contains("error"));
        }

        @Test
        @DisplayName("Should handle empty input event")
        void shouldHandleEmptyInputEvent() {
            // Given
            APIGatewayV2HTTPEvent input = new APIGatewayV2HTTPEvent();

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(400, response.getStatusCode());
            assertEquals(TestData.DEFAULT_FRONTEND_URL, response.getHeaders().get("Location"));
            assertTrue(response.getBody().contains("Missing authorization code"));
        }

        @Test
        @DisplayName("Should handle very long authorization code")
        void shouldHandleVeryLongAuthorizationCode() {
            // Given
            String longCode = "a".repeat(10000);
            APIGatewayV2HTTPEvent input = LambdaTestData.createOAuthCallbackEvent(longCode);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(TestData.DEFAULT_FRONTEND_URL, response.getHeaders().get("Location"));
        }

        @Test
        @DisplayName("Should handle authorization code with special characters")
        void shouldHandleAuthorizationCodeWithSpecialCharacters() {
            // Given
            String specialCode = "abc123-_+/=!@#$%^&*()";
            APIGatewayV2HTTPEvent input = LambdaTestData.createOAuthCallbackEvent(specialCode);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(TestData.DEFAULT_FRONTEND_URL, response.getHeaders().get("Location"));
        }

        @Test
        @DisplayName("Should handle query parameters with null values")
        void shouldHandleQueryParametersWithNullValues() {
            // Given
            Map<String, String> queryParams = Map.of("state", "test-state"); // No code parameter
            input.setQueryStringParameters(queryParams);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(400, response.getStatusCode());
            assertEquals(TestData.DEFAULT_FRONTEND_URL, response.getHeaders().get("Location"));
            assertTrue(response.getBody().contains("Missing authorization code"));
        }

        @Test
        @DisplayName("Should handle configuration with null or empty values")
        void shouldHandleConfigurationWithNullOrEmptyValues() {
            // Given
            configurationPort = MockConfigurationPort.builder()
                .frontendUrl("")
                .jwtExpirationSeconds(0L)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            APIGatewayV2HTTPEvent input = LambdaTestData.createOAuthCallbackEvent(TestData.DEFAULT_CODE);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals("", response.getHeaders().get("Location"));
            
            String setCookieHeader = response.getHeaders().get("Set-Cookie");
            assertTrue(setCookieHeader.contains("Max-Age=0"));
        }

        @Test
        @DisplayName("Should handle very large JWT expiration time")
        void shouldHandleVeryLargeJwtExpirationTime() {
            // Given
            long veryLargeExpiration = Long.MAX_VALUE;
            configurationPort = MockConfigurationPort.builder()
                .jwtExpirationSeconds(veryLargeExpiration)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            APIGatewayV2HTTPEvent input = LambdaTestData.createOAuthCallbackEvent(TestData.DEFAULT_CODE);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            
            String setCookieHeader = response.getHeaders().get("Set-Cookie");
            assertTrue(setCookieHeader.contains("Max-Age=" + veryLargeExpiration));
        }

        @Test
        @DisplayName("Should handle different types of runtime exceptions")
        void shouldHandleDifferentTypesOfRuntimeExceptions() {
            // Given
            IllegalArgumentException exception = new IllegalArgumentException("Invalid argument provided");
            authUseCase = MockAuthUseCase.builder()
                .handleOAuthCallbackThrows(exception)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            APIGatewayV2HTTPEvent input = LambdaTestData.createOAuthCallbackEvent(TestData.DEFAULT_CODE);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(500, response.getStatusCode());
            assertTrue(response.getBody().contains("error"));
            assertTrue(response.getBody().contains("Invalid argument provided"));
        }

        @Test
        @DisplayName("Should handle null pointer exception gracefully")
        void shouldHandleNullPointerExceptionGracefully() {
            // Given
            NullPointerException exception = new NullPointerException("Null value encountered");
            authUseCase = MockAuthUseCase.builder()
                .handleOAuthCallbackThrows(exception)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            APIGatewayV2HTTPEvent input = LambdaTestData.createOAuthCallbackEvent(TestData.DEFAULT_CODE);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(500, response.getStatusCode());
            assertTrue(response.getBody().contains("error"));
            assertTrue(response.getBody().contains("Null value encountered"));
        }
    }

    @Nested
    @DisplayName("Response Format Tests")
    class ResponseFormatTests {

        @Test
        @DisplayName("Should return properly formatted redirect response")
        void shouldReturnProperlyFormattedRedirectResponse() {
            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOauthLogin(input);

            // Then
            assertNotNull(response);
            assertNotNull(response.getStatusCode());
            assertNotNull(response.getHeaders());
            assertTrue(response.getHeaders().containsKey("Location"));
        }

        @Test
        @DisplayName("Should return properly formatted error response")
        void shouldReturnProperlyFormattedErrorResponse() {
            // Given
            RuntimeException exception = new RuntimeException("Test error");
            authUseCase = MockAuthUseCase.builder()
                .buildOAuthLoginUrlThrows(exception)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOauthLogin(input);

            // Then
            assertNotNull(response);
            assertNotNull(response.getStatusCode());
            assertNotNull(response.getHeaders());
            assertNotNull(response.getBody());
            assertTrue(response.getBody().startsWith("{"));
            assertTrue(response.getBody().endsWith("}"));
        }

        @Test
        @DisplayName("Should return properly formatted cookie response")
        void shouldReturnProperlyFormattedCookieResponse() {
            // Given
            APIGatewayV2HTTPEvent input = LambdaTestData.createOAuthCallbackEvent(TestData.DEFAULT_CODE);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertNotNull(response.getHeaders());
            assertTrue(response.getHeaders().containsKey("Location"));
            assertTrue(response.getHeaders().containsKey("Set-Cookie"));
            
            String setCookieHeader = response.getHeaders().get("Set-Cookie");
            assertTrue(setCookieHeader.contains("session="));
            assertTrue(setCookieHeader.contains("HttpOnly"));
            assertTrue(setCookieHeader.contains("Max-Age="));
        }
    }
}
