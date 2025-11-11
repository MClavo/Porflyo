package com.porflyo.utils.zscore;

import java.util.List;

import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ZScores;
import com.porflyo.utils.numeric.NumericUtils;
import com.porflyo.utils.zscore.BaselineBuilder.BaselineArrays;

/**
 * High-level calculator for portfolio z-scores.
 * Orchestrates baseline building and z-score calculation for all metrics.
 */
public final class PortfolioZScoreCalculator {

    private PortfolioZScoreCalculator() {}

    /**
     * Calculates z-scores for a current day's metrics against a baseline window of previous days.
     * 
     * @param currentMetrics metrics for the current day
     * @param baselineMetrics list of metrics from previous days (including current day which will be filtered out)
     * @param windowDays number of days to use for baseline calculation
     * @return calculated z-scores, or empty z-scores if insufficient data
     */
    public static ZScores calculate(
            PortfolioMetrics currentMetrics,
            List<PortfolioMetrics> baselineMetrics,
            int windowDays
    ) {
        if (currentMetrics == null || baselineMetrics == null) {
            return createEmpty();
        }

        // Build baseline arrays
        BaselineArrays arrays = BaselineBuilder.build(baselineMetrics, currentMetrics.date(), windowDays);
        if (arrays == null) {
            return createEmpty();
        }

        // Extract current day values
        Double currentViews = extractCurrentViews(currentMetrics);
        Double currentEngagement = extractCurrentEngagement(currentMetrics);
        Double currentTtfi = extractCurrentTtfi(currentMetrics);
        Double currentQualityVisitRate = extractCurrentQualityVisitRate(currentMetrics);
        Double currentSocialCtr = extractCurrentSocialCtr(currentMetrics);

        // Calculate z-scores
        return new ZScores(
            ZScoreCalculator.calculate(currentViews, arrays.views),
            ZScoreCalculator.calculate(currentEngagement, arrays.engagementAvg),
            ZScoreCalculator.calculateInverted(currentTtfi, arrays.ttfi, true), // TTFI: lower is better
            ZScoreCalculator.calculate(currentQualityVisitRate, arrays.qualityRate),
            ZScoreCalculator.calculate(currentSocialCtr, arrays.socialCtr)
        );
    }

    /**
     * Creates an empty ZScores instance with all null values.
     */
    private static ZScores createEmpty() {
        return new ZScores(null, null, null, null, null);
    }

    /**
     * Extracts current day views as nullable Double.
     */
    private static Double extractCurrentViews(PortfolioMetrics currentMetrics) {
        Integer views = currentMetrics.engagement() != null ? currentMetrics.engagement().views() : null;
        return NumericUtils.asDoubleOrNull(views);
    }

    /**
     * Extracts current day engagement average as nullable Double.
     */
    private static Double extractCurrentEngagement(PortfolioMetrics currentMetrics) {
        double engagementAvg = calculateEngagementAvg(currentMetrics.engagement(), currentMetrics.scroll());
        return NumericUtils.asNullableDouble(engagementAvg);
    }

    /**
     * Extracts current day TTFI mean as nullable Double.
     */
    private static Double extractCurrentTtfi(PortfolioMetrics currentMetrics) {
        double ttfiMean = calculateTtfiMean(currentMetrics.scroll());
        return NumericUtils.asNullableDouble(ttfiMean);
    }

    /**
     * Extracts current day quality visit rate as nullable Double.
     */
    private static Double extractCurrentQualityVisitRate(PortfolioMetrics currentMetrics) {
        double qualityVisitRate = calculateQualityVisitRate(currentMetrics.engagement());
        return NumericUtils.asNullableDouble(qualityVisitRate);
    }

    /**
     * Extracts current day social CTR as nullable Double.
     */
    private static Double extractCurrentSocialCtr(PortfolioMetrics currentMetrics) {
        double socialCtr = calculateSocialCtr(currentMetrics.engagement());
        return NumericUtils.asNullableDouble(socialCtr);
    }

    /**
     * Calculates engagement average for current day extraction.
     */
    private static double calculateEngagementAvg(Engagement engagement, InteractionMetrics scroll) {
        if (engagement == null || scroll == null || engagement.views() == null || scroll.scoreTotal() == null) {
            return Double.NaN;
        }
        if (engagement.views() == 0) {
            return Double.NaN;
        }
        return scroll.scoreTotal().doubleValue() / engagement.views().doubleValue();
    }

    /**
     * Calculates TTFI mean for current day extraction.
     */
    private static double calculateTtfiMean(InteractionMetrics scroll) {
        if (scroll == null || scroll.ttfiSumMs() == null || scroll.ttfiCount() == null || scroll.ttfiCount() == 0) {
            return Double.NaN;
        }
        return scroll.ttfiSumMs().doubleValue() / scroll.ttfiCount().doubleValue();
    }

    /**
     * Calculates quality visit rate for current day extraction.
     */
    private static double calculateQualityVisitRate(Engagement engagement) {
        if (engagement == null || engagement.qualityVisits() == null || engagement.views() == null || engagement.views() == 0) {
            return Double.NaN;
        }
        return engagement.qualityVisits().doubleValue() / engagement.views().doubleValue();
    }

    /**
     * Calculates social CTR for current day extraction.
     */
    private static double calculateSocialCtr(Engagement engagement) {
        if (engagement == null || engagement.socialClicks() == null || engagement.views() == null || engagement.views() == 0) {
            return Double.NaN;
        }
        return engagement.socialClicks().doubleValue() / engagement.views().doubleValue();
    }
}