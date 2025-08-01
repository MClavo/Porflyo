package com.porflyo.application.services;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import com.porflyo.domain.model.GithubUser;
import com.porflyo.domain.model.UserSession;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.ports.MockConfigurationPort;
import com.porflyo.testing.mocks.ports.MockGithubPort;
import com.porflyo.testing.mocks.ports.MockJwtPort;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;

@MicronautTest
@DisplayName("AuthService Tests")
class AuthServiceTest {

    private MockConfigurationPort configPort;
    private MockGithubPort githubPort;
    private MockJwtPort jwtPort;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        configPort = MockConfigurationPort.withDefaults();
        githubPort = MockGithubPort.withDefaults();
        jwtPort = MockJwtPort.withDefaults();
        recreateAuthService();
    }

    private AuthService recreateAuthService() {
        return authService = new AuthService(configPort, githubPort, jwtPort);
    }

    @Nested
    @DisplayName("buildOAuthLoginUrl Tests")
    class BuildOAuthLoginUrlTests {

        @Test
        @DisplayName("Should build valid OAuth login URL with default configuration")
        void shouldBuildValidOAuthLoginUrlWithDefaults() {
            String redirectUri = URLEncoder.encode(TestData.DEFAULT_REDIRECT_URI, StandardCharsets.UTF_8);
            String scope = URLEncoder.encode(TestData.DEFAULT_SCOPE, StandardCharsets.UTF_8);

            // When
            String loginUrl = authService.buildOAuthLoginUrl();            

            // Then
            assertNotNull(loginUrl);
            assertTrue(loginUrl.startsWith("https://github.com/login/oauth/authorize"));
            assertTrue(loginUrl.contains("client_id=" + TestData.DEFAULT_CLIENT_ID));
            assertTrue(loginUrl.contains("redirect_uri=" + redirectUri));
            assertTrue(loginUrl.contains("scope=" + scope));
            assertTrue(loginUrl.contains("response_type=code"));
        }

        @Test
        @DisplayName("Should build OAuth login URL with custom configuration")
        void shouldBuildOAuthLoginUrlWithCustomConfiguration() {
            // Given
            configPort = MockConfigurationPort.builder()
                .oAuthClientId("custom-client-id")
                .oAuthRedirectUri("https://example.com/callback")
                .oAuthScope("user")
                .build();
            recreateAuthService();

            // When
            String loginUrl = authService.buildOAuthLoginUrl();

            // Then
            assertTrue(loginUrl.contains("client_id=custom-client-id"));
            assertTrue(loginUrl.contains("redirect_uri=https%3A%2F%2Fexample.com%2Fcallback"));
            assertTrue(loginUrl.contains("scope=user"));
        }

        

        @Test
        @DisplayName("Should handle special characters in OAuth parameters")
        void shouldHandleSpecialCharactersInOAuthParameters() {
            // Given
            configPort = MockConfigurationPort.builder()
                .oAuthClientId("client+with=special&chars")
                .oAuthRedirectUri("https://example.com/path?param=value")
                .oAuthScope("user:email repo:public_repo")
                .build();
            recreateAuthService();

            // When
            String loginUrl = authService.buildOAuthLoginUrl();

            // Then
            assertTrue(loginUrl.contains("client_id=client%2Bwith%3Dspecial%26chars"));
            assertTrue(loginUrl.contains("redirect_uri=https%3A%2F%2Fexample.com%2Fpath%3Fparam%3Dvalue"));
            assertTrue(loginUrl.contains("scope=user%3Aemail+repo%3Apublic_repo"));
        }
    }

    @Nested
    @DisplayName("handleOAuthCallback Tests")
    class HandleOAuthCallbackTests {

        @Test
        @DisplayName("Should successfully handle OAuth callback with valid code")
        void shouldSuccessfullyHandleOAuthCallback() {
            // Given
            String code = TestData.DEFAULT_CODE;
            String expectedAccessToken = TestData.DEFAULT_ACCESS_TOKEN;
            String expectedJwtToken = TestData.DEFAULT_JWT_TOKEN;

            GithubUser expectedUser = TestData.DEFAULT_USER;

            // When
            UserSession result = authService.handleOAuthCallback(code);

            // Then
            assertNotNull(result);
            assertEquals(expectedJwtToken, result.jwtToken());
            assertEquals(expectedAccessToken, result.githubAccessToken());
            assertEquals(expectedUser, result.githubUser());
        }

        @Test
        @DisplayName("Should handle OAuth callback with custom user data")
        void shouldHandleOAuthCallbackWithCustomUserData() {
            // Given
            String code = "valid-auth-code";
            GithubUser customUser = new GithubUser(
                "customuser", 
                "67890", 
                "Custom User", 
                "custom@example.com", 
                "https://avatars.githubusercontent.com/u/67890"
            );
            
            githubPort = MockGithubPort.builder()
                .githubUser(customUser)
                .build();
            recreateAuthService();

            // When
            UserSession result = authService.handleOAuthCallback(code);

            // Then
            assertNotNull(result);
            assertEquals(customUser, result.githubUser());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {" ", "\t", "\n"})
        @DisplayName("Should handle OAuth callback with invalid codes")
        void shouldHandleOAuthCallbackWithInvalidCodes(String invalidCode) {
            // When & Then
            assertDoesNotThrow(() -> authService.handleOAuthCallback(invalidCode));
        }
    }

    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should throw RuntimeException when token exchange fails")
        void shouldThrowRuntimeExceptionWhenTokenExchangeFails() {
            // Given
            githubPort = MockGithubPort.builder()
                .throwOnExchange(new RuntimeException("Token exchange failed"))
                .build();
            recreateAuthService();

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> authService.handleOAuthCallback("valid-code"));
            
            assertEquals("Failed to handle OAuth callback", exception.getMessage());
            assertInstanceOf(RuntimeException.class, exception.getCause());
            assertEquals("Token exchange failed", exception.getCause().getMessage());
        }

        @Test
        @DisplayName("Should throw RuntimeException when user data retrieval fails")
        void shouldThrowRuntimeExceptionWhenUserDataRetrievalFails() {
            // Given
            githubPort = MockGithubPort.builder()
                .throwOnGetUserData(new RuntimeException("User data retrieval failed"))
                .build();
            recreateAuthService();

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> authService.handleOAuthCallback("valid-code"));
            
            assertEquals("Failed to handle OAuth callback", exception.getMessage());
            assertInstanceOf(RuntimeException.class, exception.getCause());
            assertEquals("User data retrieval failed", exception.getCause().getMessage());
        }

        @Test
        @DisplayName("Should throw RuntimeException when JWT generation fails")
        void shouldThrowRuntimeExceptionWhenJwtGenerationFails() {
            // Given
            jwtPort = MockJwtPort.builder()
                .throwOnGenerate(new RuntimeException("JWT generation failed"))
                .build();
            recreateAuthService();

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> authService.handleOAuthCallback("valid-code"));
            
            assertEquals("Failed to handle OAuth callback", exception.getMessage());
            assertInstanceOf(RuntimeException.class, exception.getCause());
            assertEquals("JWT generation failed", exception.getCause().getMessage());
        }
    }

    @Nested
    @DisplayName("Integration Tests")
    class IntegrationTests {

        @Test
        @DisplayName("Should complete full OAuth flow successfully")
        void shouldCompleteFullOAuthFlowSuccessfully() {
            // Given
            String customClientId = "integration-client-id";
            String customRedirectUri = "https://app.example.com/auth/callback";
            String customScope = "user:email,repo";
            String customAccessToken = "ghp_integration_token_xyz";
            String customJwtToken = "integration.jwt.token";
            
            GithubUser integrationUser = new GithubUser(
                "integrationuser", 
                "integration123", 
                "Integration User", 
                "integration@example.com", 
                "https://avatars.githubusercontent.com/u/integration123"
            );

            configPort = MockConfigurationPort.builder()
                .oAuthClientId(customClientId)
                .oAuthRedirectUri(customRedirectUri)
                .oAuthScope(customScope)
                .jwtExpirationSeconds(7200L)
                .build();

            githubPort = MockGithubPort.builder()
                .accessToken(customAccessToken)
                .githubUser(integrationUser)
                .build();

            jwtPort = MockJwtPort.builder()
                .generatedToken(customJwtToken)
                .build();

            recreateAuthService();

            // When - Build OAuth URL
            String loginUrl = authService.buildOAuthLoginUrl();

            // Then - Verify OAuth URL
            assertTrue(loginUrl.contains("client_id=" + customClientId));
            assertTrue(loginUrl.contains("redirect_uri=" + 
                java.net.URLEncoder.encode(customRedirectUri, java.nio.charset.StandardCharsets.UTF_8)));
            assertTrue(loginUrl.contains("scope=" + 
                java.net.URLEncoder.encode(customScope, java.nio.charset.StandardCharsets.UTF_8)));

            // When - Handle OAuth callback
            UserSession session = authService.handleOAuthCallback("integration-auth-code");

            // Then - Verify session
            assertNotNull(session);
            assertEquals(customJwtToken, session.jwtToken());
            assertEquals(customAccessToken, session.githubAccessToken());
            assertEquals(integrationUser, session.githubUser());
        }

        @Test
        @DisplayName("Should handle complete error scenarios gracefully")
        void shouldHandleCompleteErrorScenariosGracefully() {
            // Given
            githubPort = MockGithubPort.builder()
                .throwOnExchange(new RuntimeException("Network error"))
                .build();
            recreateAuthService();

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> authService.handleOAuthCallback("error-code"));
            
            assertEquals("Failed to handle OAuth callback", exception.getMessage());
            assertTrue(exception.getCause().getMessage().contains("Network error"));
        }
    }
}
