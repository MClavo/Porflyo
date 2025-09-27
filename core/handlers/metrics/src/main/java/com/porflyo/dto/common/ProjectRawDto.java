package com.porflyo.dto.common;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Project raw metrics.
 */
@Serdeable
@Introspected
public record ProjectRawDto(
    Integer projectId,
    Integer exposures,
    Integer viewTime,     // in deciseconds if timeBase=ds
    Integer codeViews,
    Integer liveViews
) {}