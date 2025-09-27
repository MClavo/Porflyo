package com.porflyo.utils;

import java.util.List;

import com.porflyo.dto.EnhancedProjectMetricsWithId;
import com.porflyo.model.metrics.DerivedMetrics;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectDerivedMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;
import com.porflyo.model.metrics.ZScores;

/**
 * Utility class for calculating derived metrics and z-scores from raw portfolio metrics.
 * Implements formulas as defined in porflyo-metrics-derived-and-zscores.md
 */
public final class DerivedMetricsCalculator {

    private DerivedMetricsCalculator() {}

    /**
     * Calculates derived metrics for a portfolio day from raw metrics.
     * 
     * @param engagement engagement metrics for the day
     * @param scroll interaction metrics for the day
     * @param cumProjects cumulative project metrics for the day
     * @return calculated derived metrics
     */
    public static DerivedMetrics calculateDerivedMetrics(
            Engagement engagement,
            InteractionMetrics scroll,
            ProjectMetrics cumProjects
    ) {
        if (engagement == null) {
            return createEmptyDerivedMetrics();
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
            safeDiv(desktopViews, safeAdd(desktopViews, mobileTabletViews)),
            safeDiv(mobileTabletViews, safeAdd(desktopViews, mobileTabletViews)),
            safeDiv(sumScrollScore, views),
            safeDiv(toMs(sumScrollTime), views),
            safeDiv(toMs(projectViewTimeTotal), projectExposuresTotal),
            safeDiv(ttfiSumMs, ttfiCount),
            safeDiv(emailCopies, views),
            safeDiv(qualityVisits, views),
            safeDiv(socialClicks, views)
        );
    }

    /**
     * Calculates derived metrics for a project from raw project metrics.
     * 
     * @param projectMetrics raw project metrics
     * @return calculated project derived metrics
     */
    public static ProjectDerivedMetrics calculateProjectDerivedMetrics(ProjectMetrics projectMetrics) {
        if (projectMetrics == null) {
            return new ProjectDerivedMetrics(null, null, null);
        }

        return new ProjectDerivedMetrics(
            safeDiv(toMs(projectMetrics.viewTime()), projectMetrics.exposures()),
            safeDiv(projectMetrics.codeViews(), projectMetrics.exposures()),
            safeDiv(projectMetrics.liveViews(), projectMetrics.exposures())
        );
    }

    /**
     * Calculates z-scores for a current day's metrics against a baseline window of previous days.
     * 
     * @param currentMetrics metrics for the current day
     * @param baselineMetrics list of metrics from previous days (excluding current day)
     * @param windowDays number of days to use for baseline calculation
     * @return calculated z-scores
     */
    public static ZScores calculateZScores(
            PortfolioMetrics currentMetrics,
            List<PortfolioMetrics> baselineMetrics,
            int windowDays
    ) {
        if (currentMetrics == null || baselineMetrics == null) {
            return createEmptyZScores();
        }

        // prepare limited baseline (exclude current day)
        List<PortfolioMetrics> baseline = baselineMetrics.stream()
            .filter(m -> !m.date().equals(currentMetrics.date()))
            .limit(windowDays)
            .toList();

        if (baseline.size() < 2) {
            return createEmptyZScores();
        }

        // extract current values (may be null)
        Double currentViews = asDoubleOrNull(currentMetrics.engagement() != null ? currentMetrics.engagement().views() : null);
        Double currentEngagement = asNullableDouble(calculateEngagementAvg(currentMetrics.engagement(), currentMetrics.scroll()));
        Double currentTtfi = asNullableDouble(calculateTtfiMean(currentMetrics.scroll()));
        Double currentQualityVisitRate = asNullableDouble(calculateQualityVisitRate(currentMetrics.engagement()));
        Double currentSocialCtr = asNullableDouble(calculateSocialCtr(currentMetrics.engagement()));

        // build primitive baseline arrays in a single pass
        BaselineArrays arrays = buildBaselineArrays(baseline);

        return new ZScores(
            calculateZScore(currentViews, arrays.views),
            calculateZScore(currentEngagement, arrays.engagementAvg),
            calculateInvertedZScore(currentTtfi, arrays.ttfi, true),
            calculateZScore(currentQualityVisitRate, arrays.qualityRate),
            calculateZScore(currentSocialCtr, arrays.socialCtr)
        );
    }

    
    // ────────────────────────── Private Helper Methods ──────────────────────────

    // helper container for baseline primitive arrays
    private static final class BaselineArrays {
        final double[] views;
        final double[] engagementAvg;
        final double[] ttfi;
        final double[] qualityRate;
        final double[] socialCtr;

        BaselineArrays(double[] views, double[] engagementAvg, double[] ttfi, double[] qualityRate, double[] socialCtr) {
            this.views = views;
            this.engagementAvg = engagementAvg;
            this.ttfi = ttfi;
            this.qualityRate = qualityRate;
            this.socialCtr = socialCtr;
        }
    }

    /**
     * Builds trimmed primitive arrays for each baseline metric in a single pass.
     */
    private static BaselineArrays buildBaselineArrays(List<PortfolioMetrics> baseline) {
        int max = baseline.size();
        double[] viewsArr = new double[max];
        double[] engArr = new double[max];
        double[] ttfiArr = new double[max];
        double[] qualArr = new double[max];
        double[] socialArr = new double[max];

        int vCnt = 0, eCnt = 0, tCnt = 0, qCnt = 0, sCnt = 0;

        for (PortfolioMetrics m : baseline) {
            if (m.engagement() != null && m.engagement().views() != null) {
                viewsArr[vCnt++] = m.engagement().views().doubleValue();
            }
            double eAvg = calculateEngagementAvg(m.engagement(), m.scroll());
            if (!Double.isNaN(eAvg)) engArr[eCnt++] = eAvg;
            double tAvg = calculateTtfiMean(m.scroll());
            if (!Double.isNaN(tAvg)) ttfiArr[tCnt++] = tAvg;
            double q = calculateQualityVisitRate(m.engagement());
            if (!Double.isNaN(q)) qualArr[qCnt++] = q;
            double s = calculateSocialCtr(m.engagement());
            if (!Double.isNaN(s)) socialArr[sCnt++] = s;
        }

        return new BaselineArrays(
            java.util.Arrays.copyOf(viewsArr, vCnt),
            java.util.Arrays.copyOf(engArr, eCnt),
            java.util.Arrays.copyOf(ttfiArr, tCnt),
            java.util.Arrays.copyOf(qualArr, qCnt),
            java.util.Arrays.copyOf(socialArr, sCnt)
        );
    }

    private static Double asDoubleOrNull(Integer v) {
        return v == null ? null : v.doubleValue();
    }

    private static Double asNullableDouble(double x) {
        return Double.isNaN(x) ? null : x;
    }

    /**
     * Safe division that returns null if divisor is null or zero.
     */
    private static Double safeDiv(Integer numerator, Integer denominator) {
        if (numerator == null || denominator == null || denominator == 0) {
            return null;
        }
        return numerator.doubleValue() / denominator.doubleValue();
    }

    /**
     * Safe division that returns null if divisor is null or zero.
     */
    private static Double safeDiv(Double numerator, Integer denominator) {
        if (numerator == null || denominator == null || denominator == 0) {
            return null;
        }
        return numerator / denominator.doubleValue();
    }

    /**
     * Safe addition that treats null as 0.
     */
    private static Integer safeAdd(Integer a, Integer b) {
        int valA = a != null ? a : 0;
        int valB = b != null ? b : 0;
        return valA + valB;
    }

    /**
     * Converts deciseconds to milliseconds. If value is null, returns null.
     * Assumes storage is in deciseconds (ds) and converts to milliseconds (ms).
     */
    private static Double toMs(Integer deciseconds) {
        if (deciseconds == null) {
            return null;
        }
        return deciseconds * 100.0; // ds to ms conversion
    }

    /**
     * Creates an empty DerivedMetrics instance with all null values.
     */
    private static DerivedMetrics createEmptyDerivedMetrics() {
        return new DerivedMetrics(null, null, null, null, null, null, null, null, null);
    }

    /**
     * Creates an empty ZScores instance with all null values.
     */
    private static ZScores createEmptyZScores() {
        return new ZScores(null, null, null, null, null);
    }

    /**
     * Calculates engagement average for z-score computation.
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
     * Calculates TTFI mean for z-score computation.
     */
    private static double calculateTtfiMean(InteractionMetrics scroll) {
        if (scroll == null || scroll.ttfiSumMs() == null || scroll.ttfiCount() == null || scroll.ttfiCount() == 0) {
            return Double.NaN;
        }
        return scroll.ttfiSumMs().doubleValue() / scroll.ttfiCount().doubleValue();
    }

    /**
     * Calculates quality visit rate for z-score computation.
     */
    private static double calculateQualityVisitRate(Engagement engagement) {
        if (engagement == null || engagement.qualityVisits() == null || engagement.views() == null || engagement.views() == 0) {
            return Double.NaN;
        }
        return engagement.qualityVisits().doubleValue() / engagement.views().doubleValue();
    }

    /**
     * Calculates social CTR for z-score computation.
     */
    private static double calculateSocialCtr(Engagement engagement) {
        if (engagement == null || engagement.socialClicks() == null || engagement.views() == null || engagement.views() == 0) {
            return Double.NaN;
        }
        return engagement.socialClicks().doubleValue() / engagement.views().doubleValue();
    }

    /**
     * Calculates z-score for a value against a primitive baseline array.
     * Single-pass (Welford) computation for mean and sample variance.
     * Returns null if current value is null or baseline has fewer than 2 valid points.
     */
    private static Double calculateZScore(Double currentValue, double[] baselineValues) {
        if (currentValue == null || baselineValues == null || baselineValues.length < 2) {
            return null;
        }

        int n = 0;
        double mean = 0.0;
        double m2 = 0.0;

        for (double x : baselineValues) {
            n++;
            double delta = x - mean;
            mean += delta / n;
            double delta2 = x - mean;
            m2 += delta * delta2;
        }

        if (n < 2) {
            return null;
        }

        double variance = m2 / (n - 1);
        double std = Math.sqrt(Math.max(variance, 0.0));

        if (std == 0.0) {
            return 0.0;
        }

        double zScore = (currentValue - mean) / std;
        return clampZScore(zScore);
    }

    /**
     * Calculates inverted z-score for "lower is better" metrics like TTFI.
     * Optionally applies log transformation for TTFI.
     */
    private static Double calculateInvertedZScore(
            Double currentValue,
            double[] baselineValues,
            boolean useLogTransform        
    ) {

        if (currentValue == null || baselineValues == null || baselineValues.length < 2) {
            return null;
        }

        double transformedCurrent = useLogTransform ? Math.log(Math.max(currentValue, 1.0)) : currentValue;
        double[] transformedBaseline;

        if (useLogTransform) {
            transformedBaseline = new double[baselineValues.length];
            for (int i = 0; i < baselineValues.length; i++) {
                transformedBaseline[i] = Math.log(Math.max(baselineValues[i], 1.0));
            }
            
        } else {
            transformedBaseline = baselineValues;
        }

        Double zScore = calculateZScore(transformedCurrent, transformedBaseline);
        return zScore != null ? -zScore : null; // invert sign: lower is better
    }

    /**
     * Clamps z-score to [-3, +3] range for visualization.
     */
    private static Double clampZScore(double zScore) {
        return Math.max(-3.0, Math.min(3.0, zScore));
    }

    /**
     * Enhances a project metrics with ID by calculating derived metrics.
     * 
     * @param projectWithId project metrics with ID
     * @return enhanced project metrics with derived analytics
     */
    public static EnhancedProjectMetricsWithId enhanceProjectMetrics(ProjectMetricsWithId projectWithId) {
        if (projectWithId == null) {
            return null;
        }

        ProjectMetrics projectMetrics = new ProjectMetrics(
            projectWithId.viewTime(),
            projectWithId.exposures(),
            projectWithId.codeViews(),
            projectWithId.liveViews()
        );

        ProjectDerivedMetrics derived = calculateProjectDerivedMetrics(projectMetrics);
        
        return EnhancedProjectMetricsWithId.from(projectWithId.id(), projectMetrics, derived);
    }
}