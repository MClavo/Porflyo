package com.porflyo;

import io.micronaut.context.annotation.ConfigurationProperties;

@ConfigurationProperties("frontend")
public record FrontendConfig(
    String url
) {}