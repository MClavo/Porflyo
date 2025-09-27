package com.porflyo.dto.common;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Slot entry containing projects and heatmap for a specific date.
 */
@Serdeable
@Introspected
public record SlotEntryDto(
    String date,                          // YYYY-MM-DD format
    List<ProjectRawDto> projects,
    HeatmapDto heatmap
) {}