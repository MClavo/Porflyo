package com.porflyo.application.ports.input;

import com.porflyo.domain.model.AuthResult;
import com.porflyo.domain.model.UserSession;

public interface AuthUseCase {
    
    /**
     * Initiates the GitHub authentication process.
     *
     * @return An AuthResult indicating the success or failure of the authentication initiation.
     */
    AuthResult initiateGithubAuth();

    /**
     * Handles the OAuth callback from GitHub after user authentication.
     *
     * @param code The authorization code received from GitHub.
     * @return A UserSession containing user data and access token if authentication is successful.
     */
    UserSession handleOauthCallback(String code);

    /**
     * Validates the provided JWT token and returns the associated user session.
     *
     * @param jwtToken The JWT token to validate.
     * @return A UserSession if the token is valid, null otherwise.
     */
    UserSession validateSession(String jwtToken);
}
