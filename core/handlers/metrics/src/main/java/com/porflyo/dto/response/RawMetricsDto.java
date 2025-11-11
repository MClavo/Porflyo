package com.porflyo.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record RawMetricsDto(
    Integer views,
    Integer activeTime,
    Integer emailCopies,
    Integer desktopViews,
    Integer mobileTabletViews,
    Integer sumScrollScore,
    Integer sumScrollTime,
    Integer qualityVisits,
    Integer projectViewTimeTotal,
    Integer projectExposuresTotal,
    Integer projectCodeViewsTotal,
    Integer projectLiveViewsTotal,
    Integer tffiSumMs,
    Integer tffiCount,
    Integer socialClicksTotal
) {}
