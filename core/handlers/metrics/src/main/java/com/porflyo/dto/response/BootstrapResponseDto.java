package com.porflyo.dto.response;

import java.util.List;

import com.porflyo.dto.common.DailyEntryDto;
import com.porflyo.dto.common.MetaDto;
import com.porflyo.dto.common.SlotEntryDto;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Response DTO for the bootstrap endpoint.
 * Returns N months of daily metrics and all available slots.
 */
@Serdeable
@Introspected
public record BootstrapResponseDto(
    MetaDto meta,
    List<DailyEntryDto> dailyAgg,
    List<SlotEntryDto> slots
) {}