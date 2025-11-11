package com.porflyo.utils.zscore;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ZScoreCalculator")
class ZScoreCalculatorTest {

    @Test
    @DisplayName("should calculate z-score when baseline has sufficient data")
    void should_calculate_zscore_when_baseline_sufficient() {
        // given
        Double currentValue = 15.0;
        double[] baseline = {10.0, 12.0, 8.0, 14.0, 11.0}; // mean = 11, std ≈ 2.24

        // when
        Double result = ZScoreCalculator.calculate(currentValue, baseline);

        // then
        assertThat(result).isCloseTo(1.79, org.assertj.core.data.Offset.offset(0.1)); // (15-11)/2.24
    }

    @Test
    @DisplayName("should return null when current value is null")
    void should_return_null_when_current_value_null() {
        // given
        double[] baseline = {10.0, 12.0, 8.0, 14.0, 11.0};

        // when
        Double result = ZScoreCalculator.calculate(null, baseline);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("should return null when baseline is null")
    void should_return_null_when_baseline_null() {
        // given
        Double currentValue = 15.0;

        // when
        Double result = ZScoreCalculator.calculate(currentValue, null);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("should return null when baseline has insufficient data")
    void should_return_null_when_baseline_insufficient() {
        // given
        Double currentValue = 15.0;
        double[] baseline = {10.0}; // only one value

        // when
        Double result = ZScoreCalculator.calculate(currentValue, baseline);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("should return zero when standard deviation is zero")  
    void should_return_zero_when_standard_deviation_zero() {
        // given
        Double currentValue = 10.0;
        double[] baseline = {10.0, 10.0, 10.0}; // all same values, std = 0

        // when
        Double result = ZScoreCalculator.calculate(currentValue, baseline);

        // then
        assertThat(result).isEqualTo(0.0);
    }

    @Test
    @DisplayName("should clamp z-score to valid range")
    void should_clamp_zscore_to_valid_range() {
        // given
        Double currentValue = 100.0;
        double[] baseline = {10.0, 11.0, 9.0}; // mean ≈ 10, very small std

        // when
        Double result = ZScoreCalculator.calculate(currentValue, baseline);

        // then
        assertThat(result).isEqualTo(3.0); // should be clamped to max
    }

    @Test
    @DisplayName("should calculate inverted z-score without log transform")
    void should_calculate_inverted_zscore_without_log() {
        // given
        Double currentValue = 8.0; // lower value (better for inverted metric)
        double[] baseline = {10.0, 12.0, 14.0, 11.0}; // mean = 11.75

        // when
        Double result = ZScoreCalculator.calculateInverted(currentValue, baseline, false);

        // then
        assertThat(result).isPositive(); // inverted, so lower value gives positive z-score
    }

    @Test
    @DisplayName("should calculate inverted z-score with log transform")
    void should_calculate_inverted_zscore_with_log() {
        // given
        Double currentValue = 500.0; // TTFI value in ms
        double[] baseline = {800.0, 900.0, 750.0, 850.0}; // higher TTFI values

        // when
        Double result = ZScoreCalculator.calculateInverted(currentValue, baseline, true);

        // then
        assertThat(result).isPositive(); // lower TTFI is better, so positive z-score
    }

    @Test
    @DisplayName("should handle log transform edge cases")
    void should_handle_log_transform_edge_cases() {
        // given
        Double currentValue = 0.5; // value less than 1
        double[] baseline = {0.8, 0.3, 0.7}; // some values less than 1

        // when
        Double result = ZScoreCalculator.calculateInverted(currentValue, baseline, true);

        // then
        assertThat(result).isNotNull(); // should handle values < 1 by using max(x, 1)
    }

    @Test
    @DisplayName("should return null for inverted z-score when insufficient data")
    void should_return_null_for_inverted_zscore_when_insufficient_data() {
        // given
        Double currentValue = 15.0;
        double[] baseline = {10.0}; // insufficient data

        // when
        Double result = ZScoreCalculator.calculateInverted(currentValue, baseline, false);

        // then
        assertThat(result).isNull();
    }
}