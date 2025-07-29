package com.porflyo.infrastructure.adapters.output.github.dto;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record GithubRepoResponseDto(
    String name,
    String description,
    String html_url
) {}