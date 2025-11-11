package com.porflyo.model.metrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Z-scores for key portfolio metrics, normalized against a baseline window.
 * Z-scores indicate how many standard deviations the current value is from the mean.
 * 
 * Calculation: z = (current_value - mean_baseline) / std_baseline
 * - Positive z-scores indicate above-average performance
 * - Negative z-scores indicate below-average performance
 * - Values are typically clamped to [-3, +3] for visualization
 */
@Serdeable
@Introspected
public record ZScores(
    /**
     * Z-score for daily visits (views).
     * Formula: (visits_today - mean_visits_baseline) / std_visits_baseline
     * Higher values indicate better performance.
     */
    Double visits,
    
    /**
     * Z-score for engagement average.
     * Formula: (engagement_today - mean_engagement_baseline) / std_engagement_baseline
     * Higher values indicate better performance.
     */
    Double engagement,
    
    /**
     * Z-score for Time To First Interaction (inverted - lower is better).
     * Formula: -(ln(ttfi_today) - mean_ln_ttfi_baseline) / std_ln_ttfi_baseline
     * Higher values indicate better performance (faster interaction).
     */
    Double ttfi,
    
    /**
     * Z-score for quality visit rate.
     * Formula: (qualityVisitRate_today - mean_qualityVisitRate_baseline) / std_qualityVisitRate_baseline
     * Higher values indicate better performance.
     */
    Double qualityVisitRate,
    
    /**
     * Z-score for social click-through rate.
     * Formula: (socialCtr_today - mean_socialCtr_baseline) / std_socialCtr_baseline
     * Higher values indicate better performance.
     */
    Double socialCtr
) {}