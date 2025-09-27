package com.porflyo.dto.common;

import java.util.Map;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Daily metrics entry combining raw, derived and z-scores.
 */
@Serdeable
@Introspected
public record DailyEntryDto(
    String date,                    // YYYY-MM-DD format
    DailyRawDto raw,
    DailyDerivedDto derived,
    Map<String, Double> zScores     // metric name -> z-score
) {}