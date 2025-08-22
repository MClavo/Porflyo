package com.porflyo.ports.input;

import com.porflyo.model.user.UserClaims;
import com.porflyo.model.user.UserSession;

public interface AuthUseCase {

    /**
     * Verifies the JWT token and throws an exception if it's invalid.
     *
     * @param token The JWT token to verify.
     */
    void verifyTokenOrThrow(String token);

    /**
     * Extracts user claims from the JWT token.
     *
     * @param token The JWT token.
     * @return UserClaims containing user information.
     */
    UserClaims extractClaims(String token);

    /**
     * Builds the OAuth login URL for GitHub authentication.
     *
     * @return The OAuth login URL as a string.
     */
    String buildOAuthLoginUrl();

    /**
     * Handles the OAuth callback from the provider after user authentication.
     *
     * @param code The authorization code received from the provider.
     * @return A UserSession containing user data and jwt session token if authentication is successful.
     */
    UserSession handleOAuthCallback(String code);
}
