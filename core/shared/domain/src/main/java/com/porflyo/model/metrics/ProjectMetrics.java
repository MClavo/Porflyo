package com.porflyo.model.metrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record ProjectMetrics(
    Integer viewTime,
    Integer TTFI,           // Time To First Interaction
    Integer codeViews,
    Integer liveViews
){}
