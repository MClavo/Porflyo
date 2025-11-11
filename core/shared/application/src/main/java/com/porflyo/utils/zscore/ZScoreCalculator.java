package com.porflyo.utils.zscore;

import com.porflyo.utils.numeric.NumericUtils;

/**
 * Calculator for z-scores using primitive arrays and Welford's algorithm.
 * Provides efficient single-pass computation for mean and variance.
 */
public final class ZScoreCalculator {

    private ZScoreCalculator() {}

    /**
     * Calculates z-score for a value against a primitive baseline array.
     * Uses Welford's algorithm for single-pass computation of mean and sample variance.
     * 
     * @param currentValue the current value to calculate z-score for
     * @param baselineValues array of baseline values
     * @return z-score clamped to [-3, +3] range, or null if insufficient data
     */
    public static Double calculate(Double currentValue, double[] baselineValues) {
        if (currentValue == null || baselineValues == null || baselineValues.length < 2) {
            return null;
        }

        // Welford's algorithm for single-pass mean and variance calculation
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

        double variance = m2 / (n - 1); // Sample variance
        double std = Math.sqrt(Math.max(variance, 0.0));

        if (std == 0.0) {
            return 0.0;
        }

        double zScore = (currentValue - mean) / std;
        return NumericUtils.clampZScore(zScore);
    }

    /**
     * Calculates inverted z-score for "lower is better" metrics like TTFI.
     * Optionally applies log transformation before z-score calculation.
     * 
     * @param currentValue the current value to calculate z-score for
     * @param baselineValues array of baseline values
     * @param useLogTransform whether to apply log transformation (recommended for TTFI)
     * @return inverted z-score clamped to [-3, +3] range, or null if insufficient data
     */
    public static Double calculateInverted(Double currentValue, double[] baselineValues, boolean useLogTransform) {
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

        Double zScore = calculate(transformedCurrent, transformedBaseline);
        return zScore != null ? -zScore : null; // Invert sign: lower is better
    }
}