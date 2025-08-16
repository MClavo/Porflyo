package com.porflyo.application.ports.output;

import com.porflyo.domain.model.user.UserClaims;

public interface JwtPort {
    
    /**
     * Generates a JWT token with the provided claims.
     *
     * @param claims A map of claims to include in the JWT token.
     * @return The generated JWT token as a string.
     */
    String generateToken(UserClaims claims);

    /**
     * Validates the provided JWT token and throws an exception if the token is invalid or expired.
     *
     * @param token the JWT token to validate
     * @throws AuthException if the token is invalid, expired, or otherwise fails validation
     */
    void verifyTokenOrThrow(String token);

    /**
     * Extracts claims from the provided JWT token.
     *
     * @param token The JWT token from which to extract claims.
     * @return A map containing the claims extracted from the token.
     */
    UserClaims extractClaims(String token);
}
