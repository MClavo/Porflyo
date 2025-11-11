package com.porflyo.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record ZScoresDto(
    Double visits,
    Double engagement,
    Double tffi
) {}
