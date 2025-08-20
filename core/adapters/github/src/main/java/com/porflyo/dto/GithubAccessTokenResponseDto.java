package com.porflyo.dto;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record GithubAccessTokenResponseDto(
    String access_token,
    String token_type,
    String scope
) {}