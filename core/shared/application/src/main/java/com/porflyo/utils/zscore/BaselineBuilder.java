package com.porflyo.utils.zscore;

import java.time.LocalDate;
import java.util.List;

import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioMetrics;

/**
 * Builder for creating baseline arrays from portfolio metrics.
 * Filters and processes metrics to prepare data for z-score calculations.
 */
public final class BaselineBuilder {

    private BaselineBuilder() {}

    /**
     * Container for baseline primitive arrays organized by metric type.
     */
    public static final class BaselineArrays {
        public final double[] views;
        public final double[] engagementAvg;
        public final double[] ttfi;
        public final double[] qualityRate;
        public final double[] socialCtr;

        public BaselineArrays(double[] views, double[] engagementAvg, double[] ttfi, double[] qualityRate, double[] socialCtr) {
            this.views = views;
            this.engagementAvg = engagementAvg;
            this.ttfi = ttfi;
            this.qualityRate = qualityRate;
            this.socialCtr = socialCtr;
        }
    }

    /**
     * Builds baseline arrays from portfolio metrics, excluding the current date and limiting to window size.
     * 
     * @param baselineMetrics list of portfolio metrics to process
     * @param currentDate date to exclude from baseline (current day)
     * @param windowDays maximum number of days to include in baseline
     * @return baseline arrays ready for z-score calculation, or null if insufficient data
     */
    public static BaselineArrays build(List<PortfolioMetrics> baselineMetrics, LocalDate currentDate, int windowDays) {
        if (baselineMetrics == null || baselineMetrics.isEmpty()) {
            return null;
        }

        // Filter and limit baseline
        List<PortfolioMetrics> filteredBaseline = baselineMetrics.stream()
            .filter(m -> !m.date().equals(currentDate))
            .limit(windowDays)
            .toList();

        if (filteredBaseline.size() < 2) {
            return null;
        }

        return buildArraysFromMetrics(filteredBaseline);
    }

    /**
     * Builds trimmed primitive arrays for each baseline metric in a single pass.
     */
    private static BaselineArrays buildArraysFromMetrics(List<PortfolioMetrics> baseline) {
        int max = baseline.size();
        double[] viewsArr = new double[max];
        double[] engArr = new double[max];
        double[] ttfiArr = new double[max];
        double[] qualArr = new double[max];
        double[] socialArr = new double[max];

        int vCnt = 0, eCnt = 0, tCnt = 0, qCnt = 0, sCnt = 0;

        for (PortfolioMetrics m : baseline) {
            // Views
            if (m.engagement() != null && m.engagement().views() != null) {
                viewsArr[vCnt++] = m.engagement().views().doubleValue();
            }
            
            // Engagement average
            double eAvg = calculateEngagementAvg(m.engagement(), m.scroll());
            if (!Double.isNaN(eAvg)) {
                engArr[eCnt++] = eAvg;
            }
            
            // TTFI mean
            double tAvg = calculateTtfiMean(m.scroll());
            if (!Double.isNaN(tAvg)) {
                ttfiArr[tCnt++] = tAvg;
            }
            
            // Quality visit rate
            double q = calculateQualityVisitRate(m.engagement());
            if (!Double.isNaN(q)) {
                qualArr[qCnt++] = q;
            }
            
            // Social CTR
            double s = calculateSocialCtr(m.engagement());
            if (!Double.isNaN(s)) {
                socialArr[sCnt++] = s;
            }
        }

        return new BaselineArrays(
            java.util.Arrays.copyOf(viewsArr, vCnt),
            java.util.Arrays.copyOf(engArr, eCnt),
            java.util.Arrays.copyOf(ttfiArr, tCnt),
            java.util.Arrays.copyOf(qualArr, qCnt),
            java.util.Arrays.copyOf(socialArr, sCnt)
        );
    }

    /**
     * Calculates engagement average for baseline processing.
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
     * Calculates TTFI mean for baseline processing.
     */
    private static double calculateTtfiMean(InteractionMetrics scroll) {
        if (scroll == null || scroll.ttfiSumMs() == null || scroll.ttfiCount() == null || scroll.ttfiCount() == 0) {
            return Double.NaN;
        }
        return scroll.ttfiSumMs().doubleValue() / scroll.ttfiCount().doubleValue();
    }

    /**
     * Calculates quality visit rate for baseline processing.
     */
    private static double calculateQualityVisitRate(Engagement engagement) {
        if (engagement == null || engagement.qualityVisits() == null || engagement.views() == null || engagement.views() == 0) {
            return Double.NaN;
        }
        return engagement.qualityVisits().doubleValue() / engagement.views().doubleValue();
    }

    /**
     * Calculates social CTR for baseline processing.
     */
    private static double calculateSocialCtr(Engagement engagement) {
        if (engagement == null || engagement.socialClicks() == null || engagement.views() == null || engagement.views() == 0) {
            return Double.NaN;
        }
        return engagement.socialClicks().doubleValue() / engagement.views().doubleValue();
    }
}