package com.porflyo.model.metrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record ScrollMetrics(
    Integer avgScore,
    Integer maxScore,
    Integer avgScrollTime,
    Integer maxScrollTime
) {}
