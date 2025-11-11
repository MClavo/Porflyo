package com.porflyo.model.metrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Derived metrics calculated from raw project metrics for a specific day.
 * Each field includes its calculation formula for reference.
 */
@Serdeable
@Introspected
public record ProjectDerivedMetrics(
    /**
     * Average view time per exposure in milliseconds.
     * Formula: safe_div(to_ms(viewTime), exposures)
     */
    Double avgViewTimeMs,
    
    /**
     * Code click-through rate (code views per exposure).
     * Formula: safe_div(codeViews, exposures)
     */
    Double codeCtr,
    
    /**
     * Live demo click-through rate (live views per exposure).
     * Formula: safe_div(liveViews, exposures)
     */
    Double liveCtr
) {}