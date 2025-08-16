package com.porflyo.infrastructure.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;

@ConfigurationProperties("github.api")
public record GithubConfig (
    String baseUrl,
    String oauthBaseUrl,
    Integer timeout
) {}
