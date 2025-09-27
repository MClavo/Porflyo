package com.porflyo.dto.common;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Decoded heatmap data.
 */
@Serdeable
@Introspected
public record HeatmapDto(
    HeatmapMetaDto meta,
    List<HeatmapCellDto> cells
) {}