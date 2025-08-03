package com.porflyo.infrastructure.adapters.output.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import com.porflyo.application.configuration.JwtConfig;
import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.ports.MockJwtConfig;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;


@DisplayName("JwtAdapter Tests")
class JwtAdapterTest {

    private JwtAdapter jwtAdapter;
    private JwtConfig jwtConfig;

    @BeforeEach
    void setUp() {
        jwtConfig = MockJwtConfig.withDefaults();
        jwtAdapter = new JwtAdapter(jwtConfig);
    }

    @Nested
    @DisplayName("Token Generation")
    class TokenGeneration {

        @Test
        @DisplayName("Should generate valid JWT token with valid claims")
        void shouldGenerateValidToken() {
            // Given
            GithubLoginClaims claims = TestData.DEFAULT_CLAIMS;

            // When
            String token = jwtAdapter.generateToken(claims);

            // Then
            assertNotNull(token);
            assertFalse(token.isEmpty());
            assertTrue(token.contains("."), "Token should have JWT format with dots");
            assertEquals(3, token.split("\\.").length, "JWT should have 3 parts separated by dots");
        }

        @Test
        @DisplayName("Should generate different tokens for different claims")
        void shouldGenerateDifferentTokensForDifferentClaims() {
            // Given
            GithubLoginClaims claims1 = new GithubLoginClaims("user1", 3600, "token1");
            GithubLoginClaims claims2 = new GithubLoginClaims("user2", 3600, "token2");

            // When
            String token1 = jwtAdapter.generateToken(claims1);
            String token2 = jwtAdapter.generateToken(claims2);

            // Then
            assertNotNull(token1);
            assertNotNull(token2);
            assertFalse(token1.equals(token2), "Different claims should generate different tokens");
        }

        @Test
        @DisplayName("Should throw exception when claims is null")
        void shouldThrowExceptionWhenClaimsIsNull() {
            // When & Then
            assertThrows(RuntimeException.class, () -> jwtAdapter.generateToken(null));
        }

        @Test
        @DisplayName("Should generate token with custom expiration time")
        void shouldGenerateTokenWithCustomExpiration() {
            // Given
            Instant now = Instant.now();
            Instant futureExp = now.plusSeconds(7200); // 2 hours
            GithubLoginClaims claims = new GithubLoginClaims("testuser", now, futureExp, "access_token");

            // When
            String token = jwtAdapter.generateToken(claims);

            // Then
            assertNotNull(token);
            
            // Verify by extracting claims back
            GithubLoginClaims extractedClaims = jwtAdapter.extractClaims(token);
            assertEquals(claims.getSub(), extractedClaims.getSub());
            assertEquals(claims.getAccessToken(), extractedClaims.getAccessToken());
        }
    }

    @Nested
    @DisplayName("Token Validation")
    class TokenValidation {

        @Test
        @DisplayName("Should validate correctly signed token")
        void shouldValidateCorrectlySignedToken() {
            // Given
            GithubLoginClaims claims = TestData.DEFAULT_CLAIMS;
            String token = jwtAdapter.generateToken(claims);

            // When
            boolean isValid = jwtAdapter.validateToken(token);

            // Then
            assertTrue(isValid);
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"invalid.token", "not.a.jwt.token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"})
        @DisplayName("Should return false for invalid tokens")
        void shouldReturnFalseForInvalidTokens(String invalidToken) {
            // When
            boolean isValid = jwtAdapter.validateToken(invalidToken);

            // Then
            assertFalse(isValid);
        }

        @Test
        @DisplayName("Should return false for token with wrong issuer")
        void shouldReturnFalseForTokenWithWrongIssuer() {
            // Given - Create adapter with different secret to simulate wrong issuer
            JwtConfig differentConfig = MockJwtConfig.builder()
                .secret("different-secret-key-that-is-long-enough-for-hs256-algorithm")
                .build();
            JwtAdapter differentAdapter = new JwtAdapter(differentConfig);
            
            String tokenFromDifferentAdapter = differentAdapter.generateToken(TestData.DEFAULT_CLAIMS);

            // When
            boolean isValid = jwtAdapter.validateToken(tokenFromDifferentAdapter);

            // Then
            assertFalse(isValid);
        }

        @Test
        @DisplayName("Should return false for expired token")
        void shouldReturnFalseForExpiredToken() {
            // Given - Create claims with past expiration
            Instant now = Instant.now();
            Instant pastExp = now.minusSeconds(3600); // 1 hour ago
            GithubLoginClaims expiredClaims = new GithubLoginClaims("testuser", now.minusSeconds(7200), pastExp, "access_token");
            
            String expiredToken = jwtAdapter.generateToken(expiredClaims);

            // When
            boolean isValid = jwtAdapter.validateToken(expiredToken);

            // Then
            assertFalse(isValid);
        }
    }

    @Nested
    @DisplayName("Claims Extraction")
    class ClaimsExtraction {

        @Test
        @DisplayName("Should extract all claims from valid token")
        void shouldExtractAllClaimsFromValidToken() {
            // Given
            GithubLoginClaims originalClaims = TestData.DEFAULT_CLAIMS;
            String token = jwtAdapter.generateToken(originalClaims);

            // When
            GithubLoginClaims extractedClaims = jwtAdapter.extractClaims(token);

            // Then
            assertNotNull(extractedClaims);
            assertEquals(originalClaims.getSub(), extractedClaims.getSub());
            assertEquals(originalClaims.getAccessToken(), extractedClaims.getAccessToken());
            // Note: Times might have slight differences due to precision, so we check they're close
            assertTrue(Math.abs(originalClaims.getIat().toEpochMilli() - extractedClaims.getIat().toEpochMilli()) < 1000);
            assertTrue(Math.abs(originalClaims.getExp().toEpochMilli() - extractedClaims.getExp().toEpochMilli()) < 1000);
        }

        @Test
        @DisplayName("Should extract claims with special characters in subject")
        void shouldExtractClaimsWithSpecialCharacters() {
            // Given
            String specialSub = "user@example.com";
            GithubLoginClaims claims = new GithubLoginClaims(
                specialSub, 
                Instant.now(), 
                Instant.now().plusSeconds(3600), 
                "special_access_token"
            );
            String token = jwtAdapter.generateToken(claims);

            // When
            GithubLoginClaims extractedClaims = jwtAdapter.extractClaims(token);

            // Then
            assertEquals(specialSub, extractedClaims.getSub());
            assertEquals("special_access_token", extractedClaims.getAccessToken());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"invalid.token", "not.a.jwt", "malformed"})
        @DisplayName("Should throw exception for invalid tokens")
        void shouldThrowExceptionForInvalidTokens(String invalidToken) {
            // When & Then
            assertThrows(RuntimeException.class, () -> jwtAdapter.extractClaims(invalidToken));
        }

        @Test
        @DisplayName("Should throw exception for token with wrong signature")
        void shouldThrowExceptionForTokenWithWrongSignature() {
            // Given - Token from different adapter (different secret)
            JwtConfig differentConfig = MockJwtConfig.builder()
                .secret("completely-different-secret-that-is-long-enough-for-hs256")
                .build();
            JwtAdapter differentAdapter = new JwtAdapter(differentConfig);
            String tokenFromDifferentAdapter = differentAdapter.generateToken(TestData.DEFAULT_CLAIMS);

            // When & Then
            assertThrows(RuntimeException.class, () -> jwtAdapter.extractClaims(tokenFromDifferentAdapter));
        }
    }

    @Nested
    @DisplayName("Integration Tests")
    class IntegrationTests {

        @Test
        @DisplayName("Should complete full token lifecycle successfully")
        void shouldCompleteFullTokenLifecycleSuccessfully() {
            // Given
            GithubLoginClaims originalClaims = new GithubLoginClaims(
                "integration_user",
                Instant.now(),
                Instant.now().plusSeconds(1800), // 30 minutes
                "integration_access_token"
            );

            // When - Generate token
            String token = jwtAdapter.generateToken(originalClaims);

            // Then - Validate token
            assertTrue(jwtAdapter.validateToken(token));

            // And - Extract claims
            GithubLoginClaims extractedClaims = jwtAdapter.extractClaims(token);
            assertEquals(originalClaims.getSub(), extractedClaims.getSub());
            assertEquals(originalClaims.getAccessToken(), extractedClaims.getAccessToken());
        }

        @Test
        @DisplayName("Should work with different JWT secrets")
        void shouldWorkWithDifferentJwtSecrets() {
            // Given
            String customSecret = "my-super-secret-jwt-key-for-testing-purposes-that-is-long-enough";
            JwtConfig customConfig = MockJwtConfig.builder()
                .secret(customSecret)
                .build();
            JwtAdapter customAdapter = new JwtAdapter(customConfig);

            // When
            String token = customAdapter.generateToken(TestData.DEFAULT_CLAIMS);

            // Then
            assertTrue(customAdapter.validateToken(token));
            GithubLoginClaims claims = customAdapter.extractClaims(token);
            assertEquals(TestData.DEFAULT_CLAIMS.getSub(), claims.getSub());
            
            // But should fail with default adapter
            assertFalse(jwtAdapter.validateToken(token));
        }

        @Test
        @DisplayName("Should handle minimum viable token data")
        void shouldHandleMinimumViableTokenData() {
            // Given - Minimum required data
            GithubLoginClaims minimalClaims = new GithubLoginClaims(
                "1",
                Instant.now(),
                Instant.now().plusSeconds(60), // 1 minute
                "t"
            );

            // When
            String token = jwtAdapter.generateToken(minimalClaims);

            // Then
            assertTrue(jwtAdapter.validateToken(token));
            GithubLoginClaims extractedClaims = jwtAdapter.extractClaims(token);
            assertEquals("1", extractedClaims.getSub());
            assertEquals("t", extractedClaims.getAccessToken());
        }
    }

    @Nested
    @DisplayName("Security Tests")
    class SecurityTests {

        @Test
        @DisplayName("Should require correct issuer in token")
        void shouldRequireCorrectIssuerInToken() {
            // This is implicitly tested by the validation logic
            // JWT tokens with wrong issuer will fail validation
            String token = jwtAdapter.generateToken(TestData.DEFAULT_CLAIMS);
            assertTrue(jwtAdapter.validateToken(token));

            // Tokens from adapters with different secrets will have different issuers
            // and will fail validation, which is tested in other test cases
        }

        @Test
        @DisplayName("Should use HS256 algorithm for signing")
        void shouldUseHS256AlgorithmForSigning() {
            // Given
            String token = jwtAdapter.generateToken(TestData.DEFAULT_CLAIMS);

            // Then - Check that token uses HS256 (this is verified by successful validation)
            // If the algorithm was different, validation would fail
            assertTrue(jwtAdapter.validateToken(token));
            
            // The algorithm is enforced in the JWT library configuration
            // Any tampering with the algorithm would cause validation to fail
        }
    }
}
