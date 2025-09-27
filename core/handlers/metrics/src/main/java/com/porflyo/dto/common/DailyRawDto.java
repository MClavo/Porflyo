package com.porflyo.dto.common;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Raw daily metrics data.
 */
@Serdeable
@Introspected
public record DailyRawDto(
    Integer views,
    Integer emailCopies,
    Integer desktopViews,
    Integer mobileTabletViews,
    Integer sumScrollScore,
    Integer sumScrollTime,
    Integer qualityVisits,
    Integer projectViewTimeTotal,
    Integer projectExposuresTotal,
    Integer tffiSumMs,
    Integer tffiCount,
    Integer socialClicksTotal
) {}