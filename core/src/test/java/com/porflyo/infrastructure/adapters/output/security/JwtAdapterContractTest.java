package com.porflyo.infrastructure.adapters.output.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.user.UserClaims;
import com.porflyo.testing.data.TestData;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import jakarta.inject.Named;


@MicronautTest(startApplication = false)
@DisplayName("JwtAdapter Tests")
class JwtAdapterContractTest {

    @Inject
    @Named("jwt-adapter")
    private JwtPort jwtPort;

    @Inject
    @Named("jwt-different-adapter")
    private JwtPort differentPort;

    @Nested
    @DisplayName("Token Generation")
    class TokenGeneration {

        @Test
        @DisplayName("Should generate valid JWT token with valid claims")
        void shouldGenerateValidToken() {
            // Given
            UserClaims claims = TestData.DEFAULT_CLAIMS;

            // When
            String token = jwtPort.generateToken(claims);

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
            UserClaims claims1 = new UserClaims("user1", 3600);
            UserClaims claims2 = new UserClaims("user2", 3600);

            // When
            String token1 = jwtPort.generateToken(claims1);
            String token2 = jwtPort.generateToken(claims2);

            // Then
            assertNotNull(token1);
            assertNotNull(token2);
            assertFalse(token1.equals(token2), "Different claims should generate different tokens");
        }

        @Test
        @DisplayName("Should throw exception when claims is null")
        void shouldThrowExceptionWhenClaimsIsNull() {
            // When & Then
            assertThrows(RuntimeException.class, () -> jwtPort.generateToken(null));
        }

        @Test
        @DisplayName("Should generate token with custom expiration time")
        void shouldGenerateTokenWithCustomExpiration() {
            // Given
            Instant now = Instant.now();
            Instant futureExp = now.plusSeconds(7200); // 2 hours
            UserClaims claims = new UserClaims("testuser", now, futureExp);

            // When
            String token = jwtPort.generateToken(claims);

            // Then
            assertNotNull(token);
            
            // Verify by extracting claims back
            UserClaims extractedClaims = jwtPort.extractClaims(token);
            assertEquals(claims.getSub(), extractedClaims.getSub());
        }
    }

    @Nested
    @DisplayName("Token Validation")
    class TokenValidation {

        @Test
        @DisplayName("Should validate correctly signed token")
        void shouldValidateCorrectlySignedToken() {
            // Given
            UserClaims claims = TestData.DEFAULT_CLAIMS;
            String token = jwtPort.generateToken(claims);

            // When
            boolean isValid = jwtPort.validateToken(token);

            // Then
            assertTrue(isValid);
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"invalid.token", "not.a.jwt.token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"})
        @DisplayName("Should return false for invalid tokens")
        void shouldReturnFalseForInvalidTokens(String invalidToken) {
            // When
            boolean isValid = jwtPort.validateToken(invalidToken);

            // Then
            assertFalse(isValid);
        }

        @Test
        @DisplayName("Should return false for token with wrong issuer")
        void shouldReturnFalseForTokenWithWrongIssuer() {
            // Given - different secret to simulate wrong issuer
            String tokenFromDifferentAdapter = differentPort.generateToken(TestData.DEFAULT_CLAIMS);

            // When
            boolean isValid = jwtPort.validateToken(tokenFromDifferentAdapter);

            // Then
            assertFalse(isValid);
        }

        @Test
        @DisplayName("Should return false for expired token")
        void shouldReturnFalseForExpiredToken() {
            // Given - Create claims with past expiration
            Instant now = Instant.now();
            Instant pastExp = now.minusSeconds(3600); // 1 hour ago
            UserClaims expiredClaims = new UserClaims("testuser", now.minusSeconds(7200), pastExp);

            String expiredToken = jwtPort.generateToken(expiredClaims);

            // When
            boolean isValid = jwtPort.validateToken(expiredToken);

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
            UserClaims originalClaims = TestData.DEFAULT_CLAIMS;
            String token = jwtPort.generateToken(originalClaims);

            // When
            UserClaims extractedClaims = jwtPort.extractClaims(token);

            // Then
            assertNotNull(extractedClaims);
            assertEquals(originalClaims.getSub(), extractedClaims.getSub());
            // Note: Times might have slight differences due to precision, so we check they're close
            assertTrue(Math.abs(originalClaims.getIat().toEpochMilli() - extractedClaims.getIat().toEpochMilli()) < 1000);
            assertTrue(Math.abs(originalClaims.getExp().toEpochMilli() - extractedClaims.getExp().toEpochMilli()) < 1000);
        }

        @Test
        @DisplayName("Should extract claims with special characters in subject")
        void shouldExtractClaimsWithSpecialCharacters() {
            // Given
            String specialSub = "user@example.com";
            UserClaims claims = new UserClaims(
                specialSub, 
                Instant.now(), 
                Instant.now().plusSeconds(3600)
            );
            String token = jwtPort.generateToken(claims);

            // When
            UserClaims extractedClaims = jwtPort.extractClaims(token);

            // Then
            assertEquals(specialSub, extractedClaims.getSub());
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"invalid.token", "not.a.jwt", "malformed"})
        @DisplayName("Should throw exception for invalid tokens")
        void shouldThrowExceptionForInvalidTokens(String invalidToken) {
            // When & Then
            assertThrows(RuntimeException.class, () -> jwtPort.extractClaims(invalidToken));
        }

        @Test
        @DisplayName("Should throw exception for token with wrong signature")
        void shouldThrowExceptionForTokenWithWrongSignature() {
            // Given

            String tokenFromDifferentAdapter = differentPort.generateToken(TestData.DEFAULT_CLAIMS);

            // When & Then
            assertThrows(RuntimeException.class, () -> jwtPort.extractClaims(tokenFromDifferentAdapter));
        }
    }

    @Nested
    @DisplayName("Integration Tests")
    class IntegrationTests {

        @Test
        @DisplayName("Should complete full token lifecycle successfully")
        void shouldCompleteFullTokenLifecycleSuccessfully() {
            // Given
            UserClaims originalClaims = new UserClaims(
                "integration_user",
                Instant.now(),
                Instant.now().plusSeconds(1800) // 30 minutes
            );

            // When - Generate token
            String token = jwtPort.generateToken(originalClaims);

            // Then - Validate token
            assertTrue(jwtPort.validateToken(token));

            // And - Extract claims
            UserClaims extractedClaims = jwtPort.extractClaims(token);
            assertEquals(originalClaims.getSub(), extractedClaims.getSub());
        }

        @Test
        @DisplayName("Should handle minimum viable token data")
        void shouldHandleMinimumViableTokenData() {
            // Given - Minimum required data
            UserClaims minimalClaims = new UserClaims(
                "1",
                Instant.now(),
                Instant.now().plusSeconds(60)
            );

            // When
            String token = jwtPort.generateToken(minimalClaims);

            // Then
            assertTrue(jwtPort.validateToken(token));
            UserClaims extractedClaims = jwtPort.extractClaims(token);
            assertEquals("1", extractedClaims.getSub());
        }
    }
}
