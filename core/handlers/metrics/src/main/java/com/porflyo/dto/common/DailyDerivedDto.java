package com.porflyo.dto.common;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Derived daily metrics data.
 */
@Serdeable
@Introspected
public record DailyDerivedDto(
    DeviceMixDto deviceMix,
    Double engagementAvg,
    Double avgScrollTimeMs,
    Double avgCardViewTimeMs,
    Double tffiMeanMs,
    Double emailConversion
) {}