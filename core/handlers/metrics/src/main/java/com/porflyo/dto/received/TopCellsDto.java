package com.porflyo.dto.received;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for top cells data within heatmap metrics.
 */
@Serdeable
@Introspected
public record TopCellsDto(
    @NotNull List<Integer> indices,
    @NotNull List<Integer> values
) {}
