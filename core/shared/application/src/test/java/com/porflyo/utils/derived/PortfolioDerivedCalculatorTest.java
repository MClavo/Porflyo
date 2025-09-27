package com.porflyo.utils.derived;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.model.metrics.DerivedMetrics;
import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.ProjectMetrics;

@DisplayName("PortfolioDerivedCalculator")
class PortfolioDerivedCalculatorTest {

    @Test
    @DisplayName("should calculate derived metrics when all data is present")
    void should_calculate_derived_metrics_when_all_data_present() {
        // given
        Devices devices = new Devices(80, 20); // 80 desktop, 20 mobile/tablet
        Engagement engagement = new Engagement(null, 100, 60, 4, 8, devices);
        InteractionMetrics scroll = new InteractionMetrics(4500, 180, 85000, 95); // 180 ds = 18000 ms
        ProjectMetrics cumProjects = new ProjectMetrics(920, 310, 12, 8); // 920 ds = 92000 ms

        // when
        DerivedMetrics result = PortfolioDerivedCalculator.calculate(engagement, scroll, cumProjects);

        // then
        assertThat(result.desktopPct()).isEqualTo(0.8); // 80/(80+20)
        assertThat(result.mobileTabletPct()).isEqualTo(0.2); // 20/(80+20)
        assertThat(result.engagementAvg()).isEqualTo(45.0); // 4500/100
        assertThat(result.avgScrollTimeMs()).isEqualTo(180.0); // 18000/100
        assertThat(result.avgCardViewTimeMs()).isCloseTo(296.77, org.assertj.core.data.Offset.offset(0.01)); // 92000/310
        assertThat(result.ttfiMeanMs()).isCloseTo(894.74, org.assertj.core.data.Offset.offset(0.01)); // 85000/95
        assertThat(result.emailConversion()).isEqualTo(0.04); // 4/100
        assertThat(result.qualityVisitRate()).isEqualTo(0.6); // 60/100
        assertThat(result.socialCtr()).isEqualTo(0.08); // 8/100
    }

    @Test
    @DisplayName("should return null values when engagement is null")
    void should_return_null_values_when_engagement_null() {
        // given
        InteractionMetrics scroll = new InteractionMetrics(4500, 180, 85000, 95);
        ProjectMetrics cumProjects = new ProjectMetrics(920, 310, 12, 8);

        // when
        DerivedMetrics result = PortfolioDerivedCalculator.calculate(null, scroll, cumProjects);

        // then
        assertThat(result.desktopPct()).isNull();
        assertThat(result.mobileTabletPct()).isNull();
        assertThat(result.engagementAvg()).isNull();
        assertThat(result.avgScrollTimeMs()).isNull();
        assertThat(result.avgCardViewTimeMs()).isNull();
        assertThat(result.ttfiMeanMs()).isNull();
        assertThat(result.emailConversion()).isNull();
        assertThat(result.qualityVisitRate()).isNull();
        assertThat(result.socialCtr()).isNull();
    }

    @Test
    @DisplayName("should handle null devices gracefully")
    void should_handle_null_devices_gracefully() {
        // given
        Engagement engagement = new Engagement(null, 100, 60, 4, 8, null); // no devices
        InteractionMetrics scroll = new InteractionMetrics(4500, 180, 85000, 95);
        ProjectMetrics cumProjects = new ProjectMetrics(920, 310, 12, 8);

        // when
        DerivedMetrics result = PortfolioDerivedCalculator.calculate(engagement, scroll, cumProjects);

        // then
        assertThat(result.desktopPct()).isNull();
        assertThat(result.mobileTabletPct()).isNull();
        assertThat(result.engagementAvg()).isEqualTo(45.0); // other metrics still calculated
    }

    @Test
    @DisplayName("should handle zero views gracefully")
    void should_handle_zero_views_gracefully() {
        // given
        Devices devices = new Devices(0, 0);
        Engagement engagement = new Engagement(null, 0, 0, 0, 0, devices); // zero views
        InteractionMetrics scroll = new InteractionMetrics(0, 0, 0, 0);
        ProjectMetrics cumProjects = new ProjectMetrics(0, 0, 0, 0);

        // when
        DerivedMetrics result = PortfolioDerivedCalculator.calculate(engagement, scroll, cumProjects);

        // then
        assertThat(result.desktopPct()).isNull(); // division by zero handled
        assertThat(result.mobileTabletPct()).isNull();
        assertThat(result.engagementAvg()).isNull();
        assertThat(result.emailConversion()).isNull();
    }

    @Test
    @DisplayName("should handle null scroll metrics gracefully")
    void should_handle_null_scroll_metrics_gracefully() {
        // given
        Devices devices = new Devices(80, 20);
        Engagement engagement = new Engagement(null, 100, 60, 4, 8, devices);
        ProjectMetrics cumProjects = new ProjectMetrics(920, 310, 12, 8);

        // when
        DerivedMetrics result = PortfolioDerivedCalculator.calculate(engagement, null, cumProjects);

        // then
        assertThat(result.desktopPct()).isEqualTo(0.8); // device metrics still work
        assertThat(result.engagementAvg()).isNull(); // scroll-dependent metrics are null
        assertThat(result.avgScrollTimeMs()).isNull();
        assertThat(result.ttfiMeanMs()).isNull();
    }

    @Test
    @DisplayName("should handle null project metrics gracefully")
    void should_handle_null_project_metrics_gracefully() {
        // given
        Devices devices = new Devices(80, 20);
        Engagement engagement = new Engagement(null, 100, 60, 4, 8, devices);
        InteractionMetrics scroll = new InteractionMetrics(4500, 180, 85000, 95);

        // when
        DerivedMetrics result = PortfolioDerivedCalculator.calculate(engagement, scroll, null);

        // then
        assertThat(result.desktopPct()).isEqualTo(0.8); // other metrics still work
        assertThat(result.engagementAvg()).isEqualTo(45.0);
        assertThat(result.avgCardViewTimeMs()).isNull(); // project-dependent metric is null
    }
}