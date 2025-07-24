package com.porflyo.infrastructure.adapters.output.configuration;

import com.porflyo.application.ports.output.ConfigurationPort;

import io.micronaut.context.annotation.Property;
import jakarta.inject.Singleton;

@Singleton
public class ConfigurationAdapter implements ConfigurationPort {

    private final GithubOAuthConfig githubOAuthConfig;
    private final JwtConfig jwtConfig;
    private final String frontendUrl;

    public ConfigurationAdapter(
            GithubOAuthConfig githubOAuthConfig,
            JwtConfig jwtConfig,
            @Property(name = "frontend.url") String frontendUrl) {

        this.githubOAuthConfig = githubOAuthConfig;
        this.jwtConfig = jwtConfig;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public String getOAuthClientId() {
        return githubOAuthConfig.clientId();
    }

    @Override
    public String getOAuthClientSecret() {
        return githubOAuthConfig.clientSecret();
    }

    @Override
    public String getOAuthRedirectUri() {
        return githubOAuthConfig.redirectUri();
    }

    @Override
    public String getOAuthScope() {
        return githubOAuthConfig.scope();
    }

    @Override
    public String getUserAgent() {
        return githubOAuthConfig.userAgent();
    }

    @Override
    public String getJWTSecret() {
        return jwtConfig.secret();
    }

    @Override
    public long getJwtExpirationSeconds() {
        return jwtConfig.expiration();
    }

    @Override
    public String getFrontendUrl() {
        return frontendUrl;
    }
}