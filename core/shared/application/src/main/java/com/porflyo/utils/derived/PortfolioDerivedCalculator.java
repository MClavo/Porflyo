package com.porflyo.utils.derived;

import com.porflyo.model.metrics.DerivedMetrics;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.utils.numeric.NumericUtils;

/**
 * Calculator for portfolio-level derived metrics from raw metrics.
 * Implements formulas as defined in porflyo-metrics-derived-and-zscores.md
 */
public final class PortfolioDerivedCalculator {

    private PortfolioDerivedCalculator() {}

    /**
     * Calculates derived metrics for a portfolio day from raw metrics.
     * 
     * @param engagement engagement metrics for the day
     * @param scroll interaction metrics for the day
     * @param cumProjects cumulative project metrics for the day
     * @return calculated derived metrics
     */
    public static DerivedMetrics calculate(
            Engagement engagement,
            InteractionMetrics scroll,
            ProjectMetrics cumProjects
    ) {
        if (engagement == null) {
            return createEmpty();
        }

        Integer views = engagement.views();
        Integer desktopViews = engagement.devices() != null ? engagement.devices().desktopViews() : null;
        Integer mobileTabletViews = engagement.devices() != null ? engagement.devices().mobileTabletViews() : null;
        Integer emailCopies = engagement.emailCopies();
        Integer qualityVisits = engagement.qualityVisits();
        Integer socialClicks = engagement.socialClicks();

        Integer sumScrollScore = scroll != null ? scroll.scoreTotal() : null;
        Integer sumScrollTime = scroll != null ? scroll.scrollTimeTotal() : null;
        Integer ttfiSumMs = scroll != null ? scroll.ttfiSumMs() : null;
        Integer ttfiCount = scroll != null ? scroll.ttfiCount() : null;

        Integer projectViewTimeTotal = cumProjects != null ? cumProjects.viewTime() : null;
        Integer projectExposuresTotal = cumProjects != null ? cumProjects.exposures() : null;

        return new DerivedMetrics(
            NumericUtils.safeDiv(desktopViews, NumericUtils.safeAdd(desktopViews, mobileTabletViews)),
            NumericUtils.safeDiv(mobileTabletViews, NumericUtils.safeAdd(desktopViews, mobileTabletViews)),
            NumericUtils.safeDiv(sumScrollScore, views),
            NumericUtils.safeDiv(NumericUtils.toMs(sumScrollTime), views),
            NumericUtils.safeDiv(NumericUtils.toMs(projectViewTimeTotal), projectExposuresTotal),
            NumericUtils.safeDiv(ttfiSumMs, ttfiCount),
            NumericUtils.safeDiv(emailCopies, views),
            NumericUtils.safeDiv(qualityVisits, views),
            NumericUtils.safeDiv(socialClicks, views)
        );
    }

    /**
     * Creates an empty DerivedMetrics instance with all null values.
     */
    private static DerivedMetrics createEmpty() {
        return new DerivedMetrics(null, null, null, null, null, null, null, null, null);
    }
}