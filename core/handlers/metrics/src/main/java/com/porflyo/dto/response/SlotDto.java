package com.porflyo.dto.response;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record SlotDto(
    String date,
    List<ProjectSlotDto> projects,
    HeatmapDto heatmap
) {}
