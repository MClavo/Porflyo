package com.porflyo.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record HeatmapCellDto(
    Integer index,
    Integer value,
    Integer count
) {}
