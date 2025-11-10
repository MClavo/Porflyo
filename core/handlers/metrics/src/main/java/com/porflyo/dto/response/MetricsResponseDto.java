package com.porflyo.dto.response;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record MetricsResponseDto(
    MetaResponseDto meta,
    List<DailyAggregateDto> dailyAgg,
    List<SlotDto> slots
) {}
