package com.porflyo.dto;

import com.porflyo.model.metrics.ProjectDerivedMetrics;
import com.porflyo.model.metrics.ProjectMetrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Enhanced project metrics with ID that includes derived metrics calculations.
 * This extends the basic ProjectMetricsWithId with computed analytics.
 */
@Serdeable
@Introspected
public record EnhancedProjectMetricsWithId(
    Integer id,
    Integer viewTime,
    Integer exposures,
    Integer codeViews,
    Integer liveViews,
    ProjectDerivedMetrics derived
) {
    /**
     * Creates enhanced project metrics from base metrics with computed analytics.
     */
    public static EnhancedProjectMetricsWithId from(
            Integer id,
            ProjectMetrics baseMetrics,
            ProjectDerivedMetrics derived
    ) {
        return new EnhancedProjectMetricsWithId(
            id,
            baseMetrics.viewTime(),
            baseMetrics.exposures(),
            baseMetrics.codeViews(),
            baseMetrics.liveViews(),
            derived
        );
    }
}