package com.porflyo.dto;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record GithubUserResponseDto(
    String login,
    String id,
    String name,
    String email,
    String avatar_url
) {}
