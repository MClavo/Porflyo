package com.porflyo.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record DailyAggregateDto(
    String date,
    RawMetricsDto raw,
    DerivedMetricsDto derived,
    ZScoresDto zScores
) {}
