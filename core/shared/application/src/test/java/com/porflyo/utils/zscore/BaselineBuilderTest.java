package com.porflyo.utils.zscore;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.utils.zscore.BaselineBuilder.BaselineArrays;

@DisplayName("BaselineBuilder")
class BaselineBuilderTest {

    private final PortfolioId portfolioId = new PortfolioId("test-portfolio");
    private final LocalDate currentDate = LocalDate.of(2025, 9, 26);

    @Test
    @DisplayName("should build baseline arrays excluding current date")
    void should_build_baseline_arrays_excluding_current_date() {
        // given
        List<PortfolioMetrics> metrics = List.of(
            createMetrics(currentDate, 100, 4500, 85000, 95), // current day - should be excluded
            createMetrics(currentDate.minusDays(1), 90, 4000, 80000, 88),
            createMetrics(currentDate.minusDays(2), 110, 5000, 90000, 102)
        );

        // when
        BaselineArrays result = BaselineBuilder.build(metrics, currentDate, 5);

        // then
        assertThat(result).isNotNull();
        assertThat(result.views).hasSize(2); // current date excluded
        assertThat(result.views).containsExactly(90.0, 110.0);
        assertThat(result.engagementAvg).containsExactly(4000.0/90.0, 5000.0/110.0);
    }

    @Test
    @DisplayName("should return null when baseline metrics is null")
    void should_return_null_when_baseline_metrics_null() {
        // when
        BaselineArrays result = BaselineBuilder.build(null, currentDate, 5);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("should return null when baseline metrics is empty")
    void should_return_null_when_baseline_metrics_empty() {
        // when
        BaselineArrays result = BaselineBuilder.build(List.of(), currentDate, 5);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("should return null when insufficient data after filtering")
    void should_return_null_when_insufficient_data_after_filtering() {
        // given - only one metric that is not the current date
        List<PortfolioMetrics> metrics = List.of(
            createMetrics(currentDate, 100, 4500, 85000, 95), // current day - excluded
            createMetrics(currentDate.minusDays(1), 90, 4000, 80000, 88) // only one baseline point
        );

        // when
        BaselineArrays result = BaselineBuilder.build(metrics, currentDate, 5);

        // then
        assertThat(result).isNull(); // need at least 2 baseline points
    }

    @Test
    @DisplayName("should limit baseline to window size")
    void should_limit_baseline_to_window_size() {
        // given - more metrics than window size
        List<PortfolioMetrics> metrics = List.of(
            createMetrics(currentDate.minusDays(1), 90, 4000, 80000, 88),
            createMetrics(currentDate.minusDays(2), 110, 5000, 90000, 102),
            createMetrics(currentDate.minusDays(3), 85, 3800, 78000, 85),
            createMetrics(currentDate.minusDays(4), 95, 4200, 82000, 92),
            createMetrics(currentDate.minusDays(5), 105, 4800, 88000, 98)
        );

        // when
        BaselineArrays result = BaselineBuilder.build(metrics, currentDate, 3); // limit to 3

        // then
        assertThat(result).isNotNull();
        assertThat(result.views).hasSize(3); // limited by window size
        assertThat(result.views).containsExactly(90.0, 110.0, 85.0); // first 3 after filtering
    }

    @Test
    @DisplayName("should handle null values in metrics gracefully")
    void should_handle_null_values_in_metrics_gracefully() {
        // given
        List<PortfolioMetrics> metrics = List.of(
            createMetrics(currentDate.minusDays(1), null, null, null, null), // all nulls
            createMetrics(currentDate.minusDays(2), 110, 5000, 90000, 102),
            createMetrics(currentDate.minusDays(3), 85, null, 78000, 85) // partial nulls
        );

        // when
        BaselineArrays result = BaselineBuilder.build(metrics, currentDate, 5);

        // then
        assertThat(result).isNotNull();
        assertThat(result.views).hasSize(2); // nulls filtered out
        assertThat(result.views).containsExactly(110.0, 85.0);
        assertThat(result.engagementAvg).hasSize(1); // only one valid engagement calculation
        assertThat(result.ttfi).hasSize(2); // two valid TTFI calculations
    }

    @Test
    @DisplayName("should handle zero views gracefully")
    void should_handle_zero_views_gracefully() {
        // given
        List<PortfolioMetrics> metrics = List.of(
            createMetrics(currentDate.minusDays(1), 0, 4000, 80000, 88), // zero views
            createMetrics(currentDate.minusDays(2), 110, 5000, 90000, 102)
        );

        // when
        BaselineArrays result = BaselineBuilder.build(metrics, currentDate, 5);

        // then
        assertThat(result).isNotNull();
        assertThat(result.views).hasSize(2); // zero is a valid value
        assertThat(result.views).containsExactly(0.0, 110.0);
        assertThat(result.engagementAvg).hasSize(1); // zero views filtered out from engagement calculation
    }

    private PortfolioMetrics createMetrics(LocalDate date, Integer views, Integer scoreTotal, 
                                         Integer ttfiSumMs, Integer ttfiCount) {
        Devices devices = new Devices(views != null ? views * 7 / 10 : null, 
                                    views != null ? views * 3 / 10 : null);
        Engagement engagement = new Engagement(null, views, 
                                             views != null ? views * 6 / 10 : null, 
                                             views != null ? views / 25 : null, 
                                             views != null ? views / 12 : null, 
                                             devices);
        InteractionMetrics scroll = new InteractionMetrics(scoreTotal, 
                                                          scoreTotal != null ? scoreTotal / 25 : null, 
                                                          ttfiSumMs, ttfiCount);
        ProjectMetrics cumProjects = new ProjectMetrics(
                                                       views != null ? views * 80 : null, 
                                                       views != null ? views * 3 : null, 
                                                       views != null ? views / 8 : null, 
                                                       views != null ? views / 12 : null);
        
        return new PortfolioMetrics(portfolioId, date, engagement, scroll, cumProjects);
    }
}