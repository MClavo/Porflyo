package com.porflyo.dto.response;

import java.util.List;

import com.porflyo.dto.common.DailyEntryDto;
import com.porflyo.dto.common.MetaDto;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Response DTO for the month endpoint.
 * Returns only the specified month of daily metrics.
 */
@Serdeable
@Introspected
public record MonthResponseDto(
    MetaDto meta,
    List<DailyEntryDto> dailyAgg
) {}