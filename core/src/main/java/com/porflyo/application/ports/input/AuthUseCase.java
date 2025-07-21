package com.porflyo.application.ports.input;

import com.porflyo.domain.model.UserSession;

public interface AuthUseCase {
    
    /**
     * Builds the OAuth login URL for GitHub authentication.
     *
     * @return The OAuth login URL as a string.
     */
    String buildOAuthLoginUrl();

    /**
     * Handles the OAuth callback from GitHub after user authentication.
     *
     * @param code The authorization code received from GitHub.
     * @return A UserSession containing user data and access token if authentication is successful.
     */
    UserSession handleOAuthCallback(String code);

    /**
     * Validates the provided JWT token and returns the associated user session.
     *
     * @param jwtToken The JWT token to validate.
     * @return A UserSession if the token is valid, null otherwise.
     */
    UserSession validateSession(String jwtToken);
}
