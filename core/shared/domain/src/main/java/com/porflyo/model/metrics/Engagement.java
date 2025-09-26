package com.porflyo.model.metrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record Engagement(
    Integer activeTime,
    Integer views,
    Integer qualityVisits,
    Integer emailCopies,
    Integer socialClicks,
    Devices devices
) {}
