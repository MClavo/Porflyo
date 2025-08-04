package com.porflyo.application.ports.output;

import com.porflyo.domain.model.UserClaims;

public interface JwtPort {
    
    /**
     * Generates a JWT token with the provided claims.
     *
     * @param claims A map of claims to include in the JWT token.
     * @return The generated JWT token as a string.
     */
    String generateToken(UserClaims claims);

    /**
     * Validates the provided JWT token.
     *
     * @param token The JWT token to validate.
     * @return true if the token is valid, false otherwise.
     */
    boolean validateToken(String token);

    /**
     * Extracts claims from the provided JWT token.
     *
     * @param token The JWT token from which to extract claims.
     * @return A map containing the claims extracted from the token.
     */
    UserClaims extractClaims(String token);
}
