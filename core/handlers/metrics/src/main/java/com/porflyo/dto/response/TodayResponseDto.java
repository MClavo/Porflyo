package com.porflyo.dto.response;

import com.porflyo.dto.common.MetaDto;
import com.porflyo.dto.common.SlotEntryDto;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Response DTO for the today endpoint.
 * Returns only today's metrics to merge into the store.
 */
@Serdeable
@Introspected
public record TodayResponseDto(
    MetaDto meta,
    String date,                    // YYYY-MM-DD format
    TodayDailyDto daily,
    SlotEntryDto slot
) {}