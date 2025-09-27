package com.porflyo.utils.facade;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.DerivedMetrics;
import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ZScores;

@DisplayName("PortfolioAnalyticsFacade")
class PortfolioAnalyticsFacadeTest {

    private final PortfolioId portfolioId = new PortfolioId("test-portfolio");

    @Test
    @DisplayName("should calculate derived metrics through facade")
    void should_calculate_derived_metrics_through_facade() {
        // given
        Devices devices = new Devices(80, 20);
        Engagement engagement = new Engagement(null, 100, 60, 4, 8, devices);
        InteractionMetrics scroll = new InteractionMetrics(4500, 180, 85000, 95);
        ProjectMetrics cumProjects = new ProjectMetrics(920, 310, 12, 8);

        // when
        DerivedMetrics result = PortfolioAnalyticsFacade.calculateDerivedMetrics(engagement, scroll, cumProjects);

        // then
        assertThat(result).isNotNull();
        assertThat(result.desktopPct()).isEqualTo(0.8);
        assertThat(result.mobileTabletPct()).isEqualTo(0.2);
        assertThat(result.engagementAvg()).isEqualTo(45.0);
        assertThat(result.emailConversion()).isEqualTo(0.04);
    }

    @Test
    @DisplayName("should calculate z-scores through facade")
    void should_calculate_zscores_through_facade() {
        // given
        PortfolioMetrics currentMetrics = createMetrics(LocalDate.of(2025, 9, 26), 100, 4500);
        List<PortfolioMetrics> baselineMetrics = List.of(
            currentMetrics, // will be filtered out
            createMetrics(LocalDate.of(2025, 9, 25), 90, 4000),
            createMetrics(LocalDate.of(2025, 9, 24), 110, 5000),
            createMetrics(LocalDate.of(2025, 9, 23), 85, 3800)
        );

        // when
        ZScores result = PortfolioAnalyticsFacade.calculateZScores(currentMetrics, baselineMetrics, 10);

        // then
        assertThat(result).isNotNull();
        assertThat(result.visits()).isNotNull(); // should calculate some z-score
        assertThat(result.engagement()).isNotNull();
        assertThat(result.ttfi()).isNotNull();
    }

    @Test
    @DisplayName("should handle null inputs gracefully in derived metrics")
    void should_handle_null_inputs_gracefully_in_derived_metrics() {
        // when
        DerivedMetrics result = PortfolioAnalyticsFacade.calculateDerivedMetrics(null, null, null);

        // then
        assertThat(result).isNotNull();
        assertThat(result.desktopPct()).isNull();
        assertThat(result.engagementAvg()).isNull();
    }

    @Test
    @DisplayName("should handle null inputs gracefully in z-scores")
    void should_handle_null_inputs_gracefully_in_zscores() {
        // when
        ZScores result = PortfolioAnalyticsFacade.calculateZScores(null, null, 10);

        // then
        assertThat(result).isNotNull();
        assertThat(result.visits()).isNull();
        assertThat(result.engagement()).isNull();
        assertThat(result.ttfi()).isNull();
        assertThat(result.qualityVisitRate()).isNull();
        assertThat(result.socialCtr()).isNull();
    }

    @Test
    @DisplayName("should handle insufficient baseline data gracefully")
    void should_handle_insufficient_baseline_data_gracefully() {
        // given
        PortfolioMetrics currentMetrics = createMetrics(LocalDate.of(2025, 9, 26), 100, 4500);
        List<PortfolioMetrics> baselineMetrics = List.of(currentMetrics); // only current day

        // when
        ZScores result = PortfolioAnalyticsFacade.calculateZScores(currentMetrics, baselineMetrics, 10);

        // then
        assertThat(result).isNotNull();
        assertThat(result.visits()).isNull(); // insufficient baseline data
        assertThat(result.engagement()).isNull();
        assertThat(result.ttfi()).isNull();
    }

    private PortfolioMetrics createMetrics(LocalDate date, Integer views, Integer scoreTotal) {
        Devices devices = new Devices(views * 7 / 10, views * 3 / 10);
        Engagement engagement = new Engagement(null, views, views * 6 / 10, views / 25, views / 12, devices);
        InteractionMetrics scroll = new InteractionMetrics(scoreTotal, scoreTotal / 25, 85000, 95);
        ProjectMetrics cumProjects = new ProjectMetrics(views * 80, views * 3, views / 8, views / 12);
        
        return new PortfolioMetrics(portfolioId, date, engagement, scroll, cumProjects);
    }
}