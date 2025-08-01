package com.porflyo.application.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;


@ConfigurationProperties("jwt")
public record JwtConfig(
    String secret,
    long expiration
) {}