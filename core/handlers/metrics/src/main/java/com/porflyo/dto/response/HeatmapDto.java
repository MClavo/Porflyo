package com.porflyo.dto.response;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record HeatmapDto(
    HeatmapMetaDto meta,
    List<HeatmapCellDto> cells
) {}
