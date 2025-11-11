package com.porflyo.dto.received;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for heatmap data within a metrics save request.
 */
@Serdeable
@Introspected
public record HeatmapDataDto(
    @NotNull Integer cols,
    @NotNull Integer rows,
    @NotNull @Valid TopCellsDto topCells
) {}
