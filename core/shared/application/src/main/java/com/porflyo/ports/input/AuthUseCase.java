package com.porflyo.ports.input;

import com.porflyo.model.user.UserClaims;
import com.porflyo.model.user.UserSession;

public interface AuthUseCase {

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
