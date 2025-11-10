package com.porflyo.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record MetaResponseDto(
    String calcVersion,
    String generatedAt,
    String timezone,
    UnitsDto units,
    BaselineDto baseline
) {}
