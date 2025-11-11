package com.porflyo.utils.numeric;

/**
 * Utility class for numeric operations used in metrics calculations.
 * Provides safe operations that handle null values gracefully.
 */
public final class NumericUtils {

    private NumericUtils() {}

    /**
     * Safe division that returns null if divisor is null or zero.
     */
    public static Double safeDiv(Integer numerator, Integer denominator) {
        if (numerator == null || denominator == null || denominator == 0) {
            return null;
        }
        return numerator.doubleValue() / denominator.doubleValue();
    }

    /**
     * Safe division that returns null if divisor is null or zero.
     */
    public static Double safeDiv(Double numerator, Integer denominator) {
        if (numerator == null || denominator == null || denominator == 0) {
            return null;
        }
        return numerator / denominator.doubleValue();
    }

    /**
     * Safe addition that treats null as 0.
     */
    public static Integer safeAdd(Integer a, Integer b) {
        int valA = a != null ? a : 0;
        int valB = b != null ? b : 0;
        return valA + valB;
    }

    /**
     * Converts deciseconds to milliseconds. If value is null, returns null.
     * Assumes storage is in deciseconds (ds) and converts to milliseconds (ms).
     */
    public static Double toMs(Integer deciseconds) {
        if (deciseconds == null) {
            return null;
        }
        return deciseconds * 100.0; // ds to ms conversion
    }

    /**
     * Converts Integer to Double, returning null if input is null.
     */
    public static Double asDoubleOrNull(Integer value) {
        return value == null ? null : value.doubleValue();
    }

    /**
     * Converts primitive double to nullable Double, returning null if NaN.
     */
    public static Double asNullableDouble(double value) {
        return Double.isNaN(value) ? null : value;
    }

    /**
     * Clamps z-score to [-3, +3] range for visualization.
     */
    public static Double clampZScore(double zScore) {
        return Math.max(-3.0, Math.min(3.0, zScore));
    }
}