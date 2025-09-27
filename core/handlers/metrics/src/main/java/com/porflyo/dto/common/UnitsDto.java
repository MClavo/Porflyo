package com.porflyo.dto.common;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Units configuration for time display.
 */
@Serdeable
@Introspected
public record UnitsDto(
    String timeBase,    // e.g., "ds" (deciseconds)
    String displayTime  // e.g., "ms" (milliseconds)
) {}