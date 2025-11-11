package com.porflyo.dto.received;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for individual project metrics within a metrics save request.
 */
@Serdeable
@Introspected
public record ProjectMetricDto(
    @NotBlank String id,
    @NotNull Integer viewTime,
    @NotNull Integer exposures,
    @NotNull Integer codeViews,
    @NotNull Integer liveViews
) {}
