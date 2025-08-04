package com.porflyo.application.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.porflyo.application.configuration.GithubOAuthConfig;
import com.porflyo.application.configuration.JwtConfig;
import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.*;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.ports.*;

/**
 * Unit tests for {@link AuthService}.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    // ────────────────────────────────── collaborators ──────────────────────────────────
    private MockGithubPort githubPort;
    private MockJwtPort    jwtPort;

    @Mock
    private UserRepository userRepository;   // classic Mockito mock

    // ──────────────────────────────────── SUT ─────────────────────────────────────────
    private AuthService authService;

    // static config data
    private GithubOAuthConfig oauthCfg;
    private JwtConfig         jwtCfg;

    // ───────────────────────────────── test setup ─────────────────────────────────────
    @BeforeEach
    void init() {
        oauthCfg   = MockGithubOAuthConfig.withDefaults();
        jwtCfg     = MockJwtConfig.withDefaults();
        githubPort = MockGithubPort.withDefaults();
        jwtPort    = MockJwtPort.withDefaults();
        authService = new AuthService(githubPort, jwtPort, oauthCfg, jwtCfg, userRepository);
    }

    // ─────────────────────────────────── buildOAuthLoginUrl ───────────────────────────
    @Nested
    @DisplayName("buildOAuthLoginUrl")
    class BuildOAuthLoginUrl {

        @Test
        @DisplayName("returns a fully-formed URL with default config")
        void returnsDefaultUrl() {
            // Given
            String encodedRedirect = URLEncoder.encode(TestData.DEFAULT_REDIRECT_URI, StandardCharsets.UTF_8);
            String encodedScope    = URLEncoder.encode(TestData.DEFAULT_SCOPE,       StandardCharsets.UTF_8);

            // When
            String url = authService.buildOAuthLoginUrl();

            // Then
            assertAll(
                () -> assertTrue(url.startsWith("https://github.com/login/oauth/authorize")),
                () -> assertTrue(url.contains("client_id="   + TestData.DEFAULT_CLIENT_ID)),
                () -> assertTrue(url.contains("redirect_uri=" + encodedRedirect)),
                () -> assertTrue(url.contains("scope="        + encodedScope)),
                () -> assertTrue(url.contains("response_type=code"))
            );
        }

        @Test
        @DisplayName("overrides parameters when config changes")
        void overridesParameters() {
            // Given
            oauthCfg = MockGithubOAuthConfig.builder()
                        .clientId("custom")
                        .redirectUri("https://cb")
                        .scope("user")
                        .build();
            authService = new AuthService(githubPort, jwtPort, oauthCfg, jwtCfg, userRepository);

            // When
            String url = authService.buildOAuthLoginUrl();

            // Then
            assertAll(
                () -> assertTrue(url.contains("client_id=custom")),
                () -> assertTrue(url.contains("redirect_uri=" +
                         URLEncoder.encode("https://cb", StandardCharsets.UTF_8))),
                () -> assertTrue(url.contains("scope=user"))
            );
        }
    }

    // ─────────────────────────────────── handleOAuthCallback ──────────────────────────
    @Nested
    @DisplayName("handleOAuthCallback")
    class HandleOAuthCallback {

        @Test
        @DisplayName("creates a valid UserSession on happy path")
        void happyPath() {
            // Given
            String code = TestData.DEFAULT_CODE;

            // When
            UserSession session = authService.handleOAuthCallback(code);

            // Then
            assertAll(
                () -> assertNotNull(session),
                () -> assertEquals(TestData.DEFAULT_JWT_TOKEN,   session.jwtToken()),
                () -> assertEquals(TestData.DEFAULT_ACCESS_TOKEN, session.user()
                                                                          .provider()
                                                                          .providerAccessToken())
            );
            // AuthService does NOT persist yet → ensure no accidental call
            verify(userRepository).save(any());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {" ", "\t"})
        @DisplayName("ignores blank codes without throwing")
        void ignoresBlankCodes(String invalid) {
            // When / Then
            assertDoesNotThrow(() -> authService.handleOAuthCallback(invalid));
        }
    }

    // ─────────────────────────────────── error scenarios ──────────────────────────────
    @Nested
    @DisplayName("error handling")
    class ErrorHandling {

        @Test
        @DisplayName("wraps token-exchange errors")
        void wrapsTokenExchangeErrors() {
            // Given
            githubPort = MockGithubPort.builder()
                          .throwOnExchange(new RuntimeException("boom"))
                          .build();
            authService = new AuthService(githubPort, jwtPort, oauthCfg, jwtCfg, userRepository);

            // When / Then
            RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.handleOAuthCallback("any"));
            assertEquals("Failed to handle OAuth callback", ex.getMessage());
            assertTrue(ex.getCause().getMessage().contains("boom"));
        }

        @Test
        @DisplayName("wraps get-user errors")
        void wrapsUserDataErrors() {
            // Given
            githubPort = MockGithubPort.builder()
                          .throwOnGetUserData(new RuntimeException("user-fail"))
                          .build();
            authService = new AuthService(githubPort, jwtPort, oauthCfg, jwtCfg, userRepository);

            // Then
            RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.handleOAuthCallback("any"));
            assertTrue(ex.getCause().getMessage().contains("user-fail"));
        }

        @Test
        @DisplayName("wraps JWT generation errors")
        void wrapsJwtErrors() {
            // Given
            jwtPort = MockJwtPort.builder()
                       .throwOnGenerate(new RuntimeException("jwt-fail"))
                       .build();
            authService = new AuthService(githubPort, jwtPort, oauthCfg, jwtCfg, userRepository);

            // Then
            RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.handleOAuthCallback("any"));
            assertTrue(ex.getCause().getMessage().contains("jwt-fail"));
        }
    }
}
