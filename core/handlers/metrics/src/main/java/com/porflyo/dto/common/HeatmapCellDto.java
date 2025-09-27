package com.porflyo.dto.common;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Decoded heatmap cell.
 */
@Serdeable
@Introspected
public record HeatmapCellDto(
    Integer index,
    Integer value,
    Integer count
) {}