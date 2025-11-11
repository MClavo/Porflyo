package com.porflyo.utils.derived;

import com.porflyo.dto.EnhancedProjectMetricsWithId;
import com.porflyo.model.metrics.ProjectDerivedMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;
import com.porflyo.utils.numeric.NumericUtils;

/**
 * Calculator for project-level derived metrics from raw project metrics.
 * Implements formulas as defined in porflyo-metrics-derived-and-zscores.md
 */
public final class ProjectDerivedCalculator {

    private ProjectDerivedCalculator() {}

    /**
     * Calculates derived metrics for a project from raw project metrics.
     * 
     * @param projectMetrics raw project metrics
     * @return calculated project derived metrics
     */
    public static ProjectDerivedMetrics calculate(ProjectMetrics projectMetrics) {
        if (projectMetrics == null) {
            return new ProjectDerivedMetrics(null, null, null);
        }

        return new ProjectDerivedMetrics(
            NumericUtils.safeDiv(NumericUtils.toMs(projectMetrics.viewTime()), projectMetrics.exposures()),
            NumericUtils.safeDiv(projectMetrics.codeViews(), projectMetrics.exposures()),
            NumericUtils.safeDiv(projectMetrics.liveViews(), projectMetrics.exposures())
        );
    }

    /**
     * Enhances a project metrics with ID by calculating derived metrics.
     * 
     * @param projectWithId project metrics with ID
     * @return enhanced project metrics with derived analytics
     */
    public static EnhancedProjectMetricsWithId enhance(ProjectMetricsWithId projectWithId) {
        if (projectWithId == null) {
            return null;
        }

        ProjectMetrics projectMetrics = new ProjectMetrics(
            projectWithId.viewTime(),
            projectWithId.exposures(),
            projectWithId.codeViews(),
            projectWithId.liveViews()
        );

        ProjectDerivedMetrics derived = calculate(projectMetrics);
        
        return EnhancedProjectMetricsWithId.from(projectWithId.id(), projectMetrics, derived);
    }
}