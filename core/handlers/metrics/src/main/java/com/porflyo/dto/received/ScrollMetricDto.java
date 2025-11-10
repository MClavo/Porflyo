package com.porflyo.dto.received;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for scroll metrics within a metrics save request.
 */
@Serdeable
@Introspected
public record ScrollMetricDto(
    @NotNull Integer score,
    @NotNull Integer scrollTimeMs
) {}
