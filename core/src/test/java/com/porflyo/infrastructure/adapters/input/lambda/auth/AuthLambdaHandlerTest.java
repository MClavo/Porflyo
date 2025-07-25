package com.porflyo.infrastructure.adapters.input.lambda.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
import com.porflyo.domain.model.GithubUser;
import com.porflyo.domain.model.UserSession;
import com.porflyo.testing.data.LambdaTestData;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.ports.MockConfigurationPort;
import com.porflyo.testing.mocks.ports.MockJwtPort;
import com.porflyo.testing.mocks.useCase.MockAuthUseCase;

@DisplayName("AuthLambdaHandler Tests")
class AuthLambdaHandlerTest {

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
        input = LambdaTestData.createBasicApiGatewayEvent();
        authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);
    }

    @Nested
    @DisplayName("OAuth Login Tests")
    class OAuthLoginTests {

        @Test
        @DisplayName("Should redirect to OAuth login URL successfully")
        void shouldRedirectToOAuthLoginUrlSuccessfully() {
            // Given
            String expectedLoginUrl = TestData.DEFAULT_LOGIN_URL;

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOauthLogin(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(expectedLoginUrl, response.getHeaders().get("Location"));
        }

        @Test
        @DisplayName("Should handle custom OAuth login URL")
        void shouldHandleCustomOAuthLoginUrl() {
            // Given
            String customLoginUrl = "https://github.com/login/oauth/authorize?client_id=custom&redirect_uri=custom";
            authUseCase = MockAuthUseCase.builder()
                .buildOAuthLoginUrl(customLoginUrl)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOauthLogin(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(customLoginUrl, response.getHeaders().get("Location"));
        }

        @Test
        @DisplayName("Should return error response when OAuth login URL building fails")
        void shouldReturnErrorWhenOAuthLoginUrlBuildingFails() {
            // Given
            RuntimeException exception = new RuntimeException("OAuth configuration error");
            authUseCase = MockAuthUseCase.builder()
                .buildOAuthLoginUrlThrows(exception)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOauthLogin(input);

            // Then
            assertNotNull(response);
            assertEquals(500, response.getStatusCode());
            assertTrue(response.getBody().contains("error"));
            assertTrue(response.getBody().contains("OAuth configuration error"));
        }
    }

    @Nested
    @DisplayName("Token Validation Tests")
    class TokenValidationTests {
        @Test
        @DisplayName("Should validate JWT token successfully")
        void shouldValidateJwtTokenSuccessfully() {
            // Given
            String validToken = TestData.DEFAULT_JWT_TOKEN;
            APIGatewayV2HTTPEvent input = LambdaTestData.createEventWithSessionCookie(validToken);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleTokenValidation(input);

            // Then
            assertNotNull(response);
            assertEquals(200, response.getStatusCode());
            assertTrue(response.getBody().contains("Token is valid"));
        }

        @Test
        @DisplayName("Should return error when jwt Token is missing")
        void shouldReturnErrorWhenJwtTokenIsMissing() {
            // Given
            String token = "";
            APIGatewayV2HTTPEvent input = LambdaTestData.createEventWithSessionCookie(token);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleTokenValidation(input);

            // Then
            assertNotNull(response);
            assertEquals(401, response.getStatusCode());
        }

    }

    @Nested
    @DisplayName("OAuth Callback Tests")
    class OAuthCallbackTests {

        @Test
        @DisplayName("Should handle OAuth callback successfully with valid code")
        void shouldHandleOAuthCallbackSuccessfully() {
            // Given
            String code = TestData.DEFAULT_CODE;
            APIGatewayV2HTTPEvent input = LambdaTestData.createOAuthCallbackEvent(code);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(TestData.DEFAULT_FRONTEND_URL, response.getHeaders().get("Location"));
            
            // Verify cookie is set
            String setCookieHeader = response.getHeaders().get("Set-Cookie");
            assertNotNull(setCookieHeader);
            assertTrue(setCookieHeader.contains("session=" + TestData.DEFAULT_JWT_TOKEN));
            assertTrue(setCookieHeader.contains("HttpOnly"));
            assertTrue(setCookieHeader.contains("Max-Age=" + TestData.DEFAULT_JWT_EXPIRATION));
        }

        @Test
        @DisplayName("Should handle OAuth callback with custom user session")
        void shouldHandleOAuthCallbackWithCustomUserSession() {
            // Given
            String customCode = "custom-auth-code";
            String customJwtToken = "custom.jwt.token";
            String customAccessToken = "custom_access_token";
            GithubUser customUser = new GithubUser(
                "customuser", 
                "696969", 
                "Custom Test User", 
                "custom@test.com", 
                "https://avatar.custom.com"
            );
            UserSession customSession = new UserSession(customJwtToken, customAccessToken, customUser);
            
            authUseCase = MockAuthUseCase.builder()
                .handleOAuthCallback(customSession)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            APIGatewayV2HTTPEvent input = LambdaTestData.createOAuthCallbackEvent(customCode);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(TestData.DEFAULT_FRONTEND_URL, response.getHeaders().get("Location"));
            
            String setCookieHeader = response.getHeaders().get("Set-Cookie");
            assertTrue(setCookieHeader.contains("session=" + customJwtToken));
        }

        @Test
        @DisplayName("Should handle OAuth callback with custom configuration")
        void shouldHandleOAuthCallbackWithCustomConfiguration() {
            // Given
            String customFrontendUrl = "https://custom.frontend.com";
            long customExpiration = 7200L;
            
            configurationPort = MockConfigurationPort.builder()
                .frontendUrl(customFrontendUrl)
                .jwtExpirationSeconds(customExpiration)
                .build();
            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            APIGatewayV2HTTPEvent input = LambdaTestData.createOAuthCallbackEvent(TestData.DEFAULT_CODE);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(customFrontendUrl, response.getHeaders().get("Location"));
            
            String setCookieHeader = response.getHeaders().get("Set-Cookie");
            assertTrue(setCookieHeader.contains("Max-Age=" + customExpiration));
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {" ", "\t", "\n"})
        @DisplayName("Should return error when authorization code is missing or invalid")
        void shouldReturnErrorWhenCodeIsMissingOrInvalid(String invalidCode) {
            // Given
            if (invalidCode != null) {
                input = LambdaTestData.createOAuthCallbackEvent(invalidCode);
            }
            
            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(400, response.getStatusCode());
            assertEquals(TestData.DEFAULT_FRONTEND_URL, response.getHeaders().get("Location"));
            assertTrue(response.getBody().contains("error"));
            assertTrue(response.getBody().contains("Missing authorization code"));
        }

        @Test
        @DisplayName("Should handle missing query parameters gracefully")
        void shouldHandleMissingQueryParametersGracefully() {
            // Given
            input.setQueryStringParameters(null); // Explicitly set to null
            
            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(400, response.getStatusCode());
            assertEquals(TestData.DEFAULT_FRONTEND_URL, response.getHeaders().get("Location"));
            assertTrue(response.getBody().contains("Missing authorization code"));
        }

        @Test
        @DisplayName("Should return error response when OAuth callback handling fails")
        void shouldReturnErrorWhenOAuthCallbackHandlingFails() {
            // Given
            RuntimeException exception = new RuntimeException("GitHub API error");
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
            assertTrue(response.getBody().contains("GitHub API error"));
        }

        @Test
        @DisplayName("Should handle OAuth callback with additional query parameters")
        void shouldHandleOAuthCallbackWithAdditionalQueryParameters() {
            // Given
            Map<String, String> queryParams = Map.of(
                "code", TestData.DEFAULT_CODE,
                "state", "random-state-value",
                "scope", "user:email"
            );
            APIGatewayV2HTTPEvent input = LambdaTestData.createApiGatewayEventWithQuery(queryParams);

            // When
            APIGatewayV2HTTPResponse response = authLambdaHandler.handleOAuthCallback(input);

            // Then
            assertNotNull(response);
            assertEquals(302, response.getStatusCode());
            assertEquals(TestData.DEFAULT_FRONTEND_URL, response.getHeaders().get("Location"));
        }
    }

    @Nested
    @DisplayName("Integration Tests")
    class IntegrationTests {

        @Test
        @DisplayName("Should complete full OAuth flow from login to callback and finally validate token")
        void shouldCompleteFullOAuthFlow() {
            // Given - Custom configuration and user session
            String customClientId = "integration-client-id";
            String customJwtToken = "integration.jwt.token";
            String customFrontendUrl = "https://integration.test.com";
            long customExpiration = 1800L;
            
            GithubUser integrationUser = new GithubUser(
                "integrationuser", 
                "11111", 
                "Integration Test User", 
                "integration@test.com", 
                "https://avatar.integration.com"
            );
            UserSession integrationSession = new UserSession(
                customJwtToken, 
                "integration_access_token", 
                integrationUser
            );
            
            configurationPort = MockConfigurationPort.builder()
                .frontendUrl(customFrontendUrl)
                .jwtExpirationSeconds(customExpiration)
                .build();
            
            authUseCase = MockAuthUseCase.builder()
                .buildOAuthLoginUrl("https://github.com/login/oauth/authorize?client_id=" + customClientId)
                .handleOAuthCallback(integrationSession)
                .build();

            authLambdaHandler = new AuthLambdaHandler(authUseCase, configurationPort, jwtPort);

            // When - Step 1: Get OAuth login URL
            APIGatewayV2HTTPEvent loginInput = LambdaTestData.createBasicApiGatewayEvent();
            APIGatewayV2HTTPResponse loginResponse = authLambdaHandler.handleOauthLogin(loginInput);
            
            // Then - Verify login redirect
            assertEquals(302, loginResponse.getStatusCode());
            assertTrue(loginResponse.getHeaders().get("Location").contains(customClientId));
            
            // When - Step 2: Handle OAuth callback
            APIGatewayV2HTTPEvent callbackInput = LambdaTestData.createOAuthCallbackEvent("integration-auth-code");
            APIGatewayV2HTTPResponse callbackResponse = authLambdaHandler.handleOAuthCallback(callbackInput);
            
            // Then - Verify callback redirect with session cookie
            assertEquals(302, callbackResponse.getStatusCode());
            assertEquals(customFrontendUrl, callbackResponse.getHeaders().get("Location"));
            
            String setCookieHeader = callbackResponse.getHeaders().get("Set-Cookie");
            assertTrue(setCookieHeader.contains("session=" + customJwtToken));
            assertTrue(setCookieHeader.contains("Max-Age=" + customExpiration));

            // When - Step 3: Validate the JWT token
            APIGatewayV2HTTPEvent validationInput = LambdaTestData.createEventWithSessionCookie(customJwtToken);
            APIGatewayV2HTTPResponse validationResponse = authLambdaHandler.handleTokenValidation(validationInput);

            // Then - Verify token validation response
            assertEquals(200, validationResponse.getStatusCode());
        }
    }
}
