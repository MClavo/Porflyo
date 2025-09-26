package com.porflyo.model.metrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record InteractionMetrics(
    Integer scoreTotal,
    Integer scrollTimeTotal,
    Integer ttfiSumMs,  // Time To First Interaction
    Integer ttfiCount
) {}
