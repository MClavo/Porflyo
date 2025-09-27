package com.porflyo.utils.numeric;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("NumericUtils")
class NumericUtilsTest {

    @Test
    @DisplayName("should safely divide integers and return null when divisor is null")
    void should_safely_divide_integers_return_null_when_divisor_null() {
        // when
        Double result = NumericUtils.safeDiv(100, null);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("should safely divide integers and return null when divisor is zero")
    void should_safely_divide_integers_return_null_when_divisor_zero() {
        // when
        Double result = NumericUtils.safeDiv(100, 0);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("should safely divide integers when both values are valid")
    void should_safely_divide_integers_when_valid() {
        // when
        Double result = NumericUtils.safeDiv(100, 25);

        // then
        assertThat(result).isEqualTo(4.0);
    }

    @Test
    @DisplayName("should safely divide double by integer when both values are valid")
    void should_safely_divide_double_by_integer_when_valid() {
        // when
        Double result = NumericUtils.safeDiv(150.0, 3);

        // then
        assertThat(result).isEqualTo(50.0);
    }

    @Test
    @DisplayName("should safely add integers treating null as zero")
    void should_safely_add_integers_treating_null_as_zero() {
        // when
        Integer result1 = NumericUtils.safeAdd(null, 5);
        Integer result2 = NumericUtils.safeAdd(10, null);
        Integer result3 = NumericUtils.safeAdd(null, null);

        // then
        assertThat(result1).isEqualTo(5);
        assertThat(result2).isEqualTo(10);
        assertThat(result3).isEqualTo(0);
    }

    @Test
    @DisplayName("should convert deciseconds to milliseconds")
    void should_convert_deciseconds_to_milliseconds() {
        // when
        Double result = NumericUtils.toMs(15); // 15 deciseconds

        // then
        assertThat(result).isEqualTo(1500.0); // 1500 milliseconds
    }

    @Test
    @DisplayName("should return null when converting null deciseconds")
    void should_return_null_when_converting_null_deciseconds() {
        // when
        Double result = NumericUtils.toMs(null);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("should convert integer to double or null")
    void should_convert_integer_to_double_or_null() {
        // when
        Double result1 = NumericUtils.asDoubleOrNull(42);
        Double result2 = NumericUtils.asDoubleOrNull(null);

        // then
        assertThat(result1).isEqualTo(42.0);
        assertThat(result2).isNull();
    }

    @Test
    @DisplayName("should convert NaN double to null")
    void should_convert_nan_double_to_null() {
        // when
        Double result1 = NumericUtils.asNullableDouble(42.5);
        Double result2 = NumericUtils.asNullableDouble(Double.NaN);

        // then
        assertThat(result1).isEqualTo(42.5);
        assertThat(result2).isNull();
    }

    @Test
    @DisplayName("should clamp z-score to valid range")
    void should_clamp_zscore_to_valid_range() {
        // when
        Double result1 = NumericUtils.clampZScore(2.5);
        Double result2 = NumericUtils.clampZScore(-4.0);
        Double result3 = NumericUtils.clampZScore(5.0);

        // then
        assertThat(result1).isEqualTo(2.5); // within range
        assertThat(result2).isEqualTo(-3.0); // clamped to min
        assertThat(result3).isEqualTo(3.0); // clamped to max
    }
}