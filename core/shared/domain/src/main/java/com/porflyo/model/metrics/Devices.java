package com.porflyo.model.metrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record Devices(
    Integer desktopViews,
    Integer mobileTabletViews // Mobile and Tablet combined
) {}
