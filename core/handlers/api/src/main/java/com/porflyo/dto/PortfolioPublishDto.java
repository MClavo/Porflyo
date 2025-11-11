package com.porflyo.dto;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for setting portfolio URL and publication status.
 */
@Serdeable
@Introspected
public record PortfolioPublishDto(
    @NotBlank String url,
    @NotNull Boolean published
) {}
