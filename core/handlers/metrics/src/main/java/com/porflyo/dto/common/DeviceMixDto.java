package com.porflyo.dto.common;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Device mix metrics.
 */
@Serdeable
@Introspected
public record DeviceMixDto(
    Double desktopPct,
    Double mobileTabletPct
) {}