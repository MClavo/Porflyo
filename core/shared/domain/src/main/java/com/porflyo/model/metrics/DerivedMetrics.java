package com.porflyo.model.metrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Derived metrics calculated from raw portfolio metrics for a specific day.
 * Each field includes its calculation formula for reference.
 */
@Serdeable
@Introspected
public record DerivedMetrics(
    /**
     * Device mix showing desktop percentage.
     * Formula: safe_div(desktopViews, desktopViews + mobileTabletViews)
     */
    Double desktopPct,
    
    /**
     * Device mix showing mobile/tablet percentage.
     * Formula: safe_div(mobileTabletViews, desktopViews + mobileTabletViews)
     */
    Double mobileTabletPct,
    
    /**
     * Average engagement score per view.
     * Formula: safe_div(sumScrollScore, views)
     */
    Double engagementAvg,
    
    /**
     * Average scroll time in milliseconds per view.
     * Formula: safe_div(to_ms(sumScrollTime), views)
     */
    Double avgScrollTimeMs,
    
    /**
     * Average view time per project card in milliseconds.
     * Formula: safe_div(to_ms(projectViewTimeTotal), projectExposuresTotal)
     */
    Double avgCardViewTimeMs,
    
    /**
     * Average Time To First Interaction in milliseconds.
     * Formula: safe_div(ttfiSumMs, ttfiCount)
     */
    Double ttfiMeanMs,
    
    /**
     * Email conversion rate (email copies per view).
     * Formula: safe_div(emailCopies, views)
     */
    Double emailConversion,
    
    /**
     * Quality visit rate (quality visits per view).
     * Formula: safe_div(qualityVisits, views) - Optional metric
     */
    Double qualityVisitRate,
    
    /**
     * Social click-through rate (social clicks per view).
     * Formula: safe_div(socialClicks, views) - Optional metric
     */
    Double socialCtr
) {}