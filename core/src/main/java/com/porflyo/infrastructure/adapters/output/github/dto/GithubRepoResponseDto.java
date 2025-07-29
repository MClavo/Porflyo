package com.porflyo.infrastructure.adapters.output.github.dto;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GithubRepoResponseDto(
    String name,
    String description,
    String html_url
) {}