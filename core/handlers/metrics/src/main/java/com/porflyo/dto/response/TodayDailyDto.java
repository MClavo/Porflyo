package com.porflyo.dto.response;

import java.util.Map;

import com.porflyo.dto.common.DailyDerivedDto;
import com.porflyo.dto.common.DailyRawDto;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Today's daily metrics.
 */
@Serdeable
@Introspected
public record TodayDailyDto(
    DailyRawDto raw,
    DailyDerivedDto derived,
    Map<String, Double> zScores
) {}