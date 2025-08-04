package com.porflyo.application.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;

// Micronaut converts camelCase <-> kebab-case automatically
// clientId -> client-id
@ConfigurationProperties("oauth.github")
public record GithubOAuthConfig(
    String clientId,
    String clientSecret,
    String redirectUri,
    String scope,
    String userAgent
) {}
