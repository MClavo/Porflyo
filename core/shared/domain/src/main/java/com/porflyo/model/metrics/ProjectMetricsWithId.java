package com.porflyo.model.metrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record ProjectMetricsWithId(
    Integer id,             // Provider Project ID 
    Integer viewTime,
    Integer exposures,
    Integer codeViews,
    Integer liveViews
){}
