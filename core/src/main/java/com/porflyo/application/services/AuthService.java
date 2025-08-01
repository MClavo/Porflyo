package com.porflyo.application.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import com.porflyo.application.configuration.GithubOAuthConfig;
import com.porflyo.application.configuration.JwtConfig;
import com.porflyo.application.ports.input.AuthUseCase;
import com.porflyo.application.ports.output.GithubPort;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.domain.model.GithubUser;
import com.porflyo.domain.model.UserSession;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Service responsible for handling authentication logic using GitHub OAuth.
 * <p>
 * This service provides methods to build the GitHub OAuth login URL and handle the OAuth callback,
 * exchanging the authorization code for an access token, retrieving user data, and generating a JWT token for session management.
 * </p>
 *
 * <p>
 * Dependencies:
 * <ul>
 *   <li>{@link ConfigurationPort} - Provides configuration values such as OAuth client ID, redirect URI, scope, and JWT expiration.</li>
 *   <li>{@link GithubPort} - Handles communication with GitHub for exchanging codes and fetching user data.</li>
 *   <li>{@link JwtPort} - Responsible for generating JWT tokens based on user claims.</li>
 * </ul>
 * </p>
 *
 * <p>
 * Main methods:
 * <ul>
 *   <li>{@link #buildOAuthLoginUrl()} - Constructs the GitHub OAuth login URL with required parameters.</li>
 *   <li>{@link #handleOAuthCallback(String)} - Handles the OAuth callback by exchanging the code for an access token, retrieving user data, and generating a JWT token.</li>
 * </ul>
 * </p>
 *
 * <p>
 * This class is annotated with {@code @Singleton} to ensure a single instance is used throughout the application.
 * </p>
 */
@Singleton
public class AuthService implements AuthUseCase {
    private final GithubOAuthConfig oauthconfig;
    private final JwtConfig jwtConfig;
    private final GithubPort github;
    private final JwtPort jwt;

    @Inject
    public AuthService(GithubPort githubPort, JwtPort jwtPort, GithubOAuthConfig Oauthconfig, JwtConfig jwtConfig) {
        this.github = githubPort;
        this.jwt = jwtPort;
        this.oauthconfig = Oauthconfig;
        this.jwtConfig = jwtConfig;
    }

    @Override
    public String buildOAuthLoginUrl() {
        String clientId = oauthconfig.clientId();
        String redirectUri = oauthconfig.redirectUri();
        String scope = oauthconfig.scope();

        String loginUrl = String.format(
            "https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=%s&response_type=code",
            URLEncoder.encode(clientId, StandardCharsets.UTF_8),
            URLEncoder.encode(redirectUri, StandardCharsets.UTF_8),
            URLEncoder.encode(scope, StandardCharsets.UTF_8)
        );

        return loginUrl;
    }

    @Override
    public UserSession handleOAuthCallback(String code) {
       try {
            // Exchange the code for an access token and fetch user data
            String accessToken = github.exchangeCodeForAccessToken(code);
            GithubUser user = github.getUserData(accessToken);

            GithubLoginClaims claims = new GithubLoginClaims(
                user.id(),
                jwtConfig.expiration(),
                accessToken
            );

            String jwtToken = jwt.generateToken(claims);

            return new UserSession(jwtToken, accessToken, user);
            
        } catch (Exception e) {
            // Handle exceptions appropriately, e.g., log error, rethrow, etc.
            throw new RuntimeException("Failed to handle OAuth callback", e);
        }
    }
}
