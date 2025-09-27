package com.porflyo.dto.common;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Baseline window configuration for z-scores calculation.
 */
@Serdeable
@Introspected
public record BaselineDto(
    Integer windowDays
) {}