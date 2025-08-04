package com.porflyo.infrastructure.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;

@ConfigurationProperties("frontend")
public record FrontendConfig(
    String url
) {}