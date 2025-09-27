package com.porflyo.dto.common;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Common metadata included in all metric responses.
 */
@Serdeable
@Introspected
public record MetaDto(
    String calcVersion,
    String generatedAt,
    String timezone,
    UnitsDto units,
    BaselineDto baseline
) {}