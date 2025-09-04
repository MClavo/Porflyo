package com.porflyo.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;


@ConfigurationProperties("jwt")
public record JwtConfig(
    String secret,
    long expiration
) {}