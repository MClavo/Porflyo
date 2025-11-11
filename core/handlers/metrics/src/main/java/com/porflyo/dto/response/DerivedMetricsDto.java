package com.porflyo.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record DerivedMetricsDto(
    DeviceMixDto deviceMix,
    Double engagementAvg,
    Double avgScrollTimeMs,
    Double avgSessionTime,
    Double avgCardViewTimeMs,
    Double tffiMeanMs,
    Double emailConversion
) {}
