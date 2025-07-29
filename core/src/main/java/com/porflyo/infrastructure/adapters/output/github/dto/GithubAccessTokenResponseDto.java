package com.porflyo.infrastructure.adapters.output.github.dto;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GithubAccessTokenResponseDto(
    String access_token,
    String token_type,
    String scope
) {}