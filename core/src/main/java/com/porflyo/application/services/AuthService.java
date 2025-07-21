package com.porflyo.application.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import com.porflyo.application.ports.input.AuthUseCase;
import com.porflyo.application.ports.output.ConfigurationPort;
import com.porflyo.application.ports.output.GithubPort;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.domain.model.GithubUser;
import com.porflyo.domain.model.UserSession;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class AuthService implements AuthUseCase {
    private final ConfigurationPort config;
    private final GithubPort github;
    private final JwtPort jwt;

    @Inject
    public AuthService(ConfigurationPort configurationPort, GithubPort githubPort, JwtPort jwtPort) {
        this.config = configurationPort;
        this.github = githubPort;
        this.jwt = jwtPort;
    }

    @Override
    public String buildOAuthLoginUrl() {
        String clientId = config.getOAuthClientId();
        String redirectUri = config.getOAuthRedirectUri();
        String scope = config.getOAuthScope();

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
                config.getJwtExpirationSeconds(),
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
