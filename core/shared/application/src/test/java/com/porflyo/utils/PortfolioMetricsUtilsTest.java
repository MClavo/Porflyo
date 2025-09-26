package com.porflyo.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.InteractionMetrics;

import java.time.LocalDate;

@DisplayName("PortfolioMetricsUtils (unit)")
class PortfolioMetricsUtilsTest {

    @Test
    @DisplayName("should create updated metrics when previous is null")
    void should_create_updated_metrics_when_previous_null() {
        // given
        PortfolioId pid = new PortfolioId("p1");
        // previous metrics are now represented as zero-valued metrics instead of null
        PortfolioMetrics previous = new PortfolioMetrics(pid, LocalDate.now(),
                new Engagement(0, 0, 0, 0, 0, new Devices(0, 0)), new InteractionMetrics(0, 0, 0, 0),
                new ProjectMetrics(0, 0, 0, 0));

        Engagement incomingEng = new Engagement(100, 5, 2, 1, 1, new Devices(3, 2));
        InteractionMetrics incomingScroll = new InteractionMetrics(50, 100, 200, 400);
        ProjectMetrics incomingProj = new ProjectMetrics(300, 120, 10, 5);

        // when
        PortfolioMetrics result = PortfolioMetricsUtils.updatePortfolioMetrics(previous, incomingEng, incomingScroll,
                incomingProj);

        // then
        assertThat(result.portfolioId()).isEqualTo(pid);
        assertThat(result.engagement().activeTime()).isEqualTo(100);
        assertThat(result.engagement().views()).isEqualTo(5);
        assertThat(result.scroll().avgScore()).isEqualTo(50);
        assertThat(result.cumProjects().viewTime()).isEqualTo(300);
    }

    @Test
    @DisplayName("should sum engagement and devices")
    void should_sum_engagement_and_devices() {
        // given
        PortfolioId pid = new PortfolioId("p2");
        PortfolioMetrics prev = new PortfolioMetrics(pid, LocalDate.now(),
                new Engagement(120, 10, 1, 1, 1, new Devices(5, 4)), new InteractionMetrics(40, 80, 150, 300),
                new ProjectMetrics(500, 100, 20, 10));

        Engagement incEng = new Engagement(80, 3, 2, 1, 1, new Devices(2, 1));
        InteractionMetrics incScroll = new InteractionMetrics(60, 90, 160, 320);
        ProjectMetrics incProj = new ProjectMetrics(200, 140, 5, 2);

        // when
        PortfolioMetrics out = PortfolioMetricsUtils.updatePortfolioMetrics(prev, incEng, incScroll, incProj);

        // then
        assertThat(out.engagement().activeTime()).isEqualTo(200); // 120 + 80
        assertThat(out.engagement().views()).isEqualTo(13); // 10 + 3
        assertThat(out.engagement().devices().desktopViews()).isEqualTo(7); // 5 + 2
        assertThat(out.cumProjects().viewTime()).isEqualTo(700); // 500 + 200
    }

    @Test
    @DisplayName("should apply EMA for TTFI and scroll averages and max for max fields")
    void should_apply_ema_and_max_correctly() {
        // given
        PortfolioId pid = new PortfolioId("p3");
        PortfolioMetrics prev = new PortfolioMetrics(pid, LocalDate.now(),
                new Engagement(0, 0, 0, 1, 1, new Devices(0, 0)), new InteractionMetrics(100, 200, 1000, 2000),
                new ProjectMetrics(1000, 200, 50, 10));

        Engagement incEng = new Engagement(0, 0, 0, 1, 1, new Devices(0, 0));
        InteractionMetrics incScroll = new InteractionMetrics(50, 250, 900, 2500);
        ProjectMetrics incProj = new ProjectMetrics(0, 400, 0, 0);

        // when
        PortfolioMetrics out = PortfolioMetricsUtils.updatePortfolioMetrics(prev, incEng, incScroll, incProj);

        // Now we expect simple sums (no EMA/max behavior)
        assertThat(out.scroll().avgScore()).isEqualTo(150); // 100 + 50
        assertThat(out.scroll().avgScrollTime()).isEqualTo(450); // 200 + 250
        assertThat(out.scroll().ttfiSumMs()).isEqualTo(1900); // 1000 + 900
        assertThat(out.cumProjects().exposures()).isEqualTo(600); // 200 + 400
    }

    @Test
    @DisplayName("should handle null incoming fields gracefully")
    void should_handle_null_incoming_fields() {
        // given
        PortfolioId pid = new PortfolioId("p4");
        PortfolioMetrics prev = new PortfolioMetrics(pid, LocalDate.now(),
                new Engagement(50, 2, 1, 1, 1, new Devices(1, 1)), new InteractionMetrics(30, 60, 120, 240),
                new ProjectMetrics(200, 80, 5, 2));

        // incoming with zeros (previously tests passed nulls; current implementation
        // sums values)
        Engagement incEng = new Engagement(0, 0, 0, 0, 0, new Devices(0, 0));
        InteractionMetrics incScroll = new InteractionMetrics(0, 0, 0, 0);
        ProjectMetrics incProj = new ProjectMetrics(0, 0, 0, 0);

        // when
        PortfolioMetrics out = PortfolioMetricsUtils.updatePortfolioMetrics(prev, incEng, incScroll, incProj);

        // then - previous values should be preserved where incoming is null
        assertThat(out.engagement().activeTime()).isEqualTo(50);
        assertThat(out.scroll().avgScore()).isEqualTo(30);
        assertThat(out.cumProjects().viewTime()).isEqualTo(200);
    }

}
