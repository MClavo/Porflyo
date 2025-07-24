package com.porflyo.infrastructure.adapters.output.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;


@ConfigurationProperties("jwt")
public record JwtConfig(
    String secret,
    long expiration
) {}