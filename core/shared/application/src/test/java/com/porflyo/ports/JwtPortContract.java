package com.porflyo.ports;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.exceptions.auth.AuthException;
import com.porflyo.model.user.UserClaims;

public abstract class JwtPortContract {
    protected JwtPort jwtPort;

    protected JwtPortContract(JwtPort jwtPort) {
        this.jwtPort = jwtPort;
    }

    @Test
    @DisplayName("should generate valid token when given valid claims")
    protected void shouldGenerateValidToken_whenGivenValidClaims() {
        // Given
        String userId = "user123";
        long tokenLifetime = 3600; 
        UserClaims claims = new UserClaims(userId, tokenLifetime);

        // When
        String token = jwtPort.generateToken(claims);

        // Then
        assertNotNull(token, "Generated token should not be null");
        assertTrue(token.length() > 0, "Generated token should not be empty");
        assertTrue(token.contains("."), "JWT token should contain dots");
        // JWT tokens have 3 parts separated by dots
        assertEquals(3, token.split("\\.").length, "JWT token should have 3 parts");
    }

    @Test
    @DisplayName("should verify valid token when token is not expired")
    protected void shouldVerifyValidToken_whenTokenIsNotExpired() {
        // Given
        String userId = "user456";
        long tokenLifetime = 3600; 
        UserClaims claims = new UserClaims(userId, tokenLifetime);
        String token = jwtPort.generateToken(claims);

        // When & Then
        // Should not throw any exception
        jwtPort.verifyTokenOrThrow(token);
    }

    @Test
    @DisplayName("should throw exception when token is malformed")
    protected void shouldThrowException_whenTokenIsMalformed() {
        // Given
        String malformedToken = "invalid.token.format";

        // When & Then
        assertThrows(AuthException.class, () -> {
            jwtPort.verifyTokenOrThrow(malformedToken);
        }, "Should throw AuthException for malformed token");
    }

    @Test
    @DisplayName("should throw exception when token is expired")
    protected void shouldThrowException_whenTokenIsExpired() {
        // Given
        String userId = "user789";
        Instant past = Instant.now().minusSeconds(3600); // 1 hour ago
        Instant expiredTime = Instant.now().minusSeconds(1800); // 30 minutes ago
        UserClaims expiredClaims = new UserClaims(userId, past, expiredTime);
        String expiredToken = jwtPort.generateToken(expiredClaims);

        // When & Then
        assertThrows(AuthException.class, () -> {
            jwtPort.verifyTokenOrThrow(expiredToken);
        }, "Should throw AuthException for expired token");
    }

    @Test
    @DisplayName("should extract claims when token is valid")
    protected void shouldExtractClaims_whenTokenIsValid() {
        // Given
        String userId = "user101";
        long tokenLifetime = 3600;
        UserClaims originalClaims = new UserClaims(userId, tokenLifetime);
        String token = jwtPort.generateToken(originalClaims);

        // When
        UserClaims extractedClaims = jwtPort.extractClaims(token);

        // Then
        assertNotNull(extractedClaims, "Extracted claims should not be null");
        assertEquals(originalClaims.getSub(), extractedClaims.getSub(), "Subject should match");
        
        // Compare timestamps with some tolerance (JWT tokens may truncate milliseconds) MAY FAIL, TRY AGAIN
        assertTrue(Math.abs(originalClaims.getIat().getEpochSecond() - extractedClaims.getIat().getEpochSecond()) <= 1, 
                   "Issued at time should match within 1 second");
        assertTrue(Math.abs(originalClaims.getExp().getEpochSecond() - extractedClaims.getExp().getEpochSecond()) <= 1, 
                   "Expiration time should match within 1 second");
    }

    @Test
    @DisplayName("should throw exception when extracting claims from invalid token")
    protected void shouldThrowException_whenExtractingClaimsFromInvalidToken() {
        // Given
        String invalidToken = "completely.invalid.token";

        // When & Then
        assertThrows(AuthException.class, () -> {
            jwtPort.extractClaims(invalidToken);
        }, "Should throw AuthException when extracting claims from invalid token");
    }

    @Test
    @DisplayName("should generate different tokens when called multiple times")
    protected void shouldGenerateDifferentTokens_whenCalledMultipleTimes() {
        // Given
        String userId = "user202";
        long tokenLifetime = 3600;

        // When
        UserClaims claims1 = new UserClaims(userId, tokenLifetime);
        String token1 = jwtPort.generateToken(claims1);
        
        // Wait a bit to ensure different issued at times
        try { Thread.sleep(1000); } catch (InterruptedException ignored) {}
        
        UserClaims claims2 = new UserClaims(userId, tokenLifetime);
        String token2 = jwtPort.generateToken(claims2);

        // Then
        assertNotNull(token1, "First token should not be null");
        assertNotNull(token2, "Second token should not be null");
        // Tokens should be different due to different issued at times
        assertTrue(!token1.equals(token2), "Different claims should generate different tokens");
    }
}
