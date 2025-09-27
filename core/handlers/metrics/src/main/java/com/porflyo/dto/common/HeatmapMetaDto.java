package com.porflyo.dto.common;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Heatmap metadata.
 */
@Serdeable
@Introspected
public record HeatmapMetaDto(
    Integer rows,
    Integer columns,
    Integer k
) {}