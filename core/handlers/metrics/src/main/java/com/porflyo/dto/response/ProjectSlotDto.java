package com.porflyo.dto.response;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record ProjectSlotDto(
    Integer projectId,
    Integer exposures,
    Integer viewTime,
    Integer codeViews,
    Integer liveViews
) {}
