package com.porflyo.application.services;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.porflyo.application.configuration.JwtConfig;
import com.porflyo.application.configuration.ProviderOAuthConfig;
import com.porflyo.application.ports.output.MediaRepository;
import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;
import com.porflyo.domain.model.user.UserSession;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.ports.MockGithubOAuthConfig;
import com.porflyo.testing.mocks.ports.MockGithubPort;
import com.porflyo.testing.mocks.ports.MockJwtConfig;
import com.porflyo.testing.mocks.ports.MockJwtPort;

/**
 * Unit tests for {@link AuthService}.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    // ────────────────────────────────── collaborators ──────────────────────────────────
    private MockGithubPort githubPort;
    private MockJwtPort    jwtPort;

    @Mock
    private UserRepository userRepository;   
    @Mock
    private MediaRepository mediaRepository;
    @Mock
    private HttpClient httpClient;


    // ──────────────────────────────────── SUT ─────────────────────────────────────────
    private AuthService authService;

    // static config data
    private ProviderOAuthConfig oauthCfg;
    private JwtConfig         jwtCfg;

    // ───────────────────────────────── test setup ─────────────────────────────────────
    @BeforeEach
    void init() {
        oauthCfg   = MockGithubOAuthConfig.withDefaults();
        jwtCfg     = MockJwtConfig.withDefaults();
        githubPort = MockGithubPort.withDefaults();
        jwtPort    = MockJwtPort.withDefaults();
        authService = new AuthService(githubPort, jwtPort, oauthCfg, jwtCfg, userRepository, mediaRepository);

        // mediaRepository.put is a void method, so use doNothing().when(...)
        org.mockito.Mockito.lenient().doNothing().when(mediaRepository).put(any(), any());

        // Mock HttpClient.send to return a valid HttpResponse with a non-null body
        var mockResponse = org.mockito.Mockito.mock(java.net.http.HttpResponse.class);
        org.mockito.Mockito.lenient().when(mockResponse.body()).thenReturn(new java.io.ByteArrayInputStream(new byte[0]));
        try {
            org.mockito.Mockito.lenient().when(httpClient.send(any(), any())).thenReturn(mockResponse);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void refreshAuthService() {
        authService = new AuthService(githubPort, jwtPort, oauthCfg, jwtCfg, userRepository, mediaRepository);
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
            refreshAuthService();

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
            String code = TestData.DEFAULT_OAUTH_CODE;

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

        @Test
        @DisplayName("saves new user if not previously registered")
        void createsNewUser() {
            // Given
            when(userRepository.findByProviderId(any())).thenReturn(Optional.empty());

            // When
            UserSession session = authService.handleOAuthCallback(TestData.DEFAULT_OAUTH_CODE);

            // Then
            verify(userRepository).save(argThat(user -> {
                assertAll(
                    () -> assertNotNull(user.id(), "ID should not be null"),
                    () -> assertTrue(user.id().equals(session.user().id()), "ID should match session user ID")
                );
                return true;
            }));

            assertNotNull(session.user().id());
        }

        @Test
        @DisplayName("does not save if user already exists with same provider data")
        void reusesExistingUser() {
            // Given
            EntityId originalId = EntityId.newKsuid(); // simulate existing ID

            ProviderAccount account = new ProviderAccount(
                TestData.DEFAULT_GITHUB_ID,
                TestData.DEFAULT_GITHUB_NAME,
                URI.create(TestData.DEFAULT_GITHUB_AVATAR_URL),
                TestData.DEFAULT_ACCESS_TOKEN
            );

            User existing = new User(
                originalId,
                account,
                TestData.DEFAULT_GITHUB_NAME,
                TestData.DEFAULT_GITHUB_EMAIL,
                "",
                TestData.DEFAULT_GITHUB_AVATAR_URL,
                Map.of()
            );

            when(userRepository.findByProviderId(TestData.DEFAULT_GITHUB_ID)).thenReturn(Optional.of(existing));

            // When
            UserSession session = authService.handleOAuthCallback(TestData.DEFAULT_OAUTH_CODE);

            // Then
            assertEquals(originalId.value(), session.user().id().value());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("patches user if provider data changes (e.g. new name or avatar)")
        void updatesProviderAccountIfDifferent() {
            // Given: same GitHub ID, but different token
            ProviderAccount oldAccount = new ProviderAccount(
                TestData.DEFAULT_GITHUB_ID,
                "OLD Name",
                URI.create("https://newProfile.com/avatar.png"),
                TestData.DEFAULT_ACCESS_TOKEN
            );

            User existing = new User(
                EntityId.newKsuid(),
                oldAccount,
                TestData.DEFAULT_GITHUB_NAME,
                TestData.DEFAULT_GITHUB_EMAIL,
                "",
                TestData.DEFAULT_GITHUB_AVATAR_URL,
                Map.of()
            );

            when(userRepository.findByProviderId(TestData.DEFAULT_GITHUB_ID)).thenReturn(Optional.of(existing));
            when(userRepository.patchProviderAccount(eq(existing.id()), eq(TestData.DEFAULT_PROVIDER_ACCOUNT))).thenReturn(existing);

            // When
            authService.handleOAuthCallback(TestData.DEFAULT_OAUTH_CODE);
            // Then
            verify(userRepository).patchProviderAccount(eq(existing.id()), any());
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

            refreshAuthService();

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

            refreshAuthService();

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
            refreshAuthService();

            // Then
            RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.handleOAuthCallback("any"));
            assertTrue(ex.getCause().getMessage().contains("jwt-fail"));
        }
    }
}
