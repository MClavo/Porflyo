package com.porflyo.infrastructure.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;

// Micronaut converts camelCase <-> kebab-case automatically
// clientId -> client-id
@ConfigurationProperties("oauth")
public record ProviderOAuthConfig(
    String providerName,
    String clientId,
    String clientSecret,
    String redirectUri,
    String scope,
    String userAgent
) {}
