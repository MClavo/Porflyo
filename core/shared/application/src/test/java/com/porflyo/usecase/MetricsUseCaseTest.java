package com.porflyo.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.porflyo.configuration.MetricsConfig;
import com.porflyo.dto.DetailSlot;
import com.porflyo.dto.HeatmapSnapshot;
import com.porflyo.dto.PortfolioMetricsBundle;
import com.porflyo.dto.PortfolioMetricsSnapshot;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;
import com.porflyo.ports.PortfolioMetricsRepository;
import com.porflyo.ports.SlotMetricsRepository;

import static com.porflyo.data.MetricsTestData.*;
import static com.porflyo.data.SlotMetricsTestData.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MetricsUseCase (unit)")
class MetricsUseCaseTest {

    @Mock PortfolioMetricsRepository portfolioMetricsRepository;
    @Mock SlotMetricsRepository slotMetricsRepository;
    @Mock MetricsConfig metricsConfig;

    @InjectMocks MetricsUseCase metricsUseCase;

    private final PortfolioId portfolioId = com.porflyo.data.MetricsTestData.DEFAULT_PORTFOLIO_ID;

    // ────────────────────────── saveTodayPortfolioMetrics ──────────────────────────

    @Test
    @DisplayName("should save today's portfolio metrics")
    void should_save_todays_portfolio_metrics() {
        // given
        PortfolioMetrics metrics = TODAY_METRICS;

        // when
        metricsUseCase.saveTodayPortfolioMetrics(portfolioId, metrics.engagement(), metrics.scroll(), metrics.cumProjects());

        // then
        then(portfolioMetricsRepository).should().saveTodayMetrics(metrics);
    }

    // ────────────────────────── saveTodayDetailSlot (new slot) ──────────────────────────

    @Test
    @DisplayName("should create new detail slot when none exists")
    void should_create_new_detail_slot_when_none_exists() {
        // given
        HeatmapSnapshot heatmapSnapshot = TODAY_HEATMAP_SNAPSHOT;
        List<ProjectMetricsWithId> projects = TODAY_PROJECT_METRICS;
        
        given(slotMetricsRepository.getTodayMetrics(portfolioId)).willReturn(Optional.empty());

        // when
        metricsUseCase.saveTodayDetailSlot(portfolioId, heatmapSnapshot, projects);

        // then
        ArgumentCaptor<PortfolioHeatmap> heatmapCaptor = ArgumentCaptor.forClass(PortfolioHeatmap.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<ProjectMetricsWithId>> projectsCaptor = ArgumentCaptor.forClass(List.class);

        then(slotMetricsRepository).should().saveTodayMetrics(any(PortfolioId.class), heatmapCaptor.capture(), projectsCaptor.capture());

        PortfolioHeatmap savedHeatmap = heatmapCaptor.getValue();
        assertThat(savedHeatmap.version()).isEqualTo("1.0.0");
        assertThat(savedHeatmap.columns()).isEqualTo(12);
        assertThat(savedHeatmap.Indexes()).isEqualTo(heatmapSnapshot.Indexes());
        assertThat(savedHeatmap.Values()).isEqualTo(heatmapSnapshot.Values());
        // Counts should all be 1 (new visits)
        assertThat(savedHeatmap.Counts()).containsOnly(1);

        List<ProjectMetricsWithId> savedProjects = projectsCaptor.getValue();
        assertThat(savedProjects).isEqualTo(projects);
    }

    // ────────────────────────── saveTodayDetailSlot (update existing) ──────────────────────────

    @Test
    @DisplayName("should update existing detail slot by merging data")
    void should_update_existing_detail_slot() {
        // given
        HeatmapSnapshot newHeatmapSnapshot = UPDATED_HEATMAP_SNAPSHOT;
        List<ProjectMetricsWithId> newProjects = UPDATED_PROJECT_METRICS;
        
        DetailSlot existingSlot = TODAY_DETAIL_SLOT;
        given(slotMetricsRepository.getTodayMetrics(portfolioId)).willReturn(Optional.of(existingSlot));
        given(metricsConfig.heatmapCellCount()).willReturn(100);

        // when
        metricsUseCase.saveTodayDetailSlot(portfolioId, newHeatmapSnapshot, newProjects);

        // then
        ArgumentCaptor<PortfolioHeatmap> heatmapCaptor = ArgumentCaptor.forClass(PortfolioHeatmap.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<ProjectMetricsWithId>> projectsCaptor = ArgumentCaptor.forClass(List.class);

        then(slotMetricsRepository).should().saveTodayMetrics(any(PortfolioId.class), heatmapCaptor.capture(), projectsCaptor.capture());

        // Verify heatmap was updated (using MetricsHeatmapUtils.updateHeatmap)
        PortfolioHeatmap updatedHeatmap = heatmapCaptor.getValue();
        assertThat(updatedHeatmap.version()).isEqualTo("1.1.0"); // Should use new version

        // Verify projects were merged
        List<ProjectMetricsWithId> updatedProjects = projectsCaptor.getValue();
        assertThat(updatedProjects).hasSize(4); // 3 existing + 1 new - no duplicates

        // Check that project 1 was updated (should have combined values)
        ProjectMetricsWithId project1 = updatedProjects.stream()
            .filter(p -> p.id().equals(1))
            .findFirst()
            .orElseThrow();
        assertThat(project1.viewTime()).isEqualTo(2700000); // 1800000 + 900000
        assertThat(project1.exposures()).isEqualTo(3700); // 2500 + 1200
        assertThat(project1.codeViews()).isEqualTo(12); // 8 + 4
        assertThat(project1.liveViews()).isEqualTo(7); // 5 + 2

        // Check that project 4 was added as new
        ProjectMetricsWithId project4 = updatedProjects.stream()
            .filter(p -> p.id().equals(4))
            .findFirst()
            .orElseThrow();
        assertThat(project4.viewTime()).isEqualTo(1800000);
        assertThat(project4.exposures()).isEqualTo(2000);
    }

    @Test
    @DisplayName("should handle null values in project metrics when updating")
    void should_handle_null_values_in_project_metrics() {
        // given
        List<ProjectMetricsWithId> existingProjects = List.of(
            new ProjectMetricsWithId(1, 1000000, 2000, 5, 3)
        );
        List<ProjectMetricsWithId> newProjects = NULL_VALUES_PROJECT_METRICS;
        
        DetailSlot existingSlot = new DetailSlot(
            TODAY_DETAIL_SLOT.date(),
            TODAY_DETAIL_SLOT.heatmap(),
            existingProjects
        );
        
        given(slotMetricsRepository.getTodayMetrics(portfolioId)).willReturn(Optional.of(existingSlot));
        given(metricsConfig.heatmapCellCount()).willReturn(100);

        // when
        metricsUseCase.saveTodayDetailSlot(portfolioId, TODAY_HEATMAP_SNAPSHOT, newProjects);

        // then - verify the method was called with updated data
        then(slotMetricsRepository).should().saveTodayMetrics(any(PortfolioId.class), any(PortfolioHeatmap.class), any());
        
        // Note: The detailed testing of updateProjects logic should be done separately
        // as it's a complex private method. Here we just verify the orchestration works.
    }

    // ────────────────────────── Read Operations ──────────────────────────

    @Test
    @DisplayName("should get portfolio metrics for specified months")
    void should_get_portfolio_metrics_for_months() {
        // given
        List<PortfolioMetrics> expectedMetrics = List.of(TODAY_METRICS, CURRENT_MONTH_DAY_20);
        given(portfolioMetricsRepository.findPortfolioMetrics(portfolioId, 3)).willReturn(expectedMetrics);

        // when
        List<PortfolioMetrics> result = metricsUseCase.getPortfolioMetrics(portfolioId, 3);

        // then
        assertThat(result).isSameAs(expectedMetrics);
        then(portfolioMetricsRepository).should().findPortfolioMetrics(portfolioId, 3);
    }

    @Test
    @DisplayName("should get portfolio metrics for one month")
    void should_get_portfolio_metrics_one_month() {
        // given
        List<PortfolioMetrics> expectedMetrics = CURRENT_MONTH_METRICS;
        given(portfolioMetricsRepository.findPortfolioMetricsOneMonth(portfolioId, 0)).willReturn(expectedMetrics);

        // when
        List<PortfolioMetrics> result = metricsUseCase.getPortfolioMetricsOneMonth(portfolioId, 0);

        // then
        assertThat(result).isSameAs(expectedMetrics);
        then(portfolioMetricsRepository).should().findPortfolioMetricsOneMonth(portfolioId, 0);
    }

    @Test
    @DisplayName("should get portfolio metrics with slots")
    void should_get_portfolio_metrics_with_slots() {
        // given
        List<PortfolioMetrics> expectedMetrics = CURRENT_MONTH_METRICS;
        List<DetailSlot> expectedSlots = List.of(TODAY_DETAIL_SLOT, CURRENT_MONTH_DAY_20_DETAIL_SLOT);
        
        given(portfolioMetricsRepository.findPortfolioMetrics(portfolioId, 2)).willReturn(expectedMetrics);
        given(slotMetricsRepository.getAllMetrics(portfolioId)).willReturn(expectedSlots);

        // when
        PortfolioMetricsBundle result = metricsUseCase.getPortfolioMetricsWithSlots(portfolioId, 2);

        // then
        assertThat(result.portfolioId()).isEqualTo(portfolioId);
        assertThat(result.aggregates()).isSameAs(expectedMetrics);
        assertThat(result.slots()).isSameAs(expectedSlots);
    }

    @Test
    @DisplayName("should get today's metrics with details")
    void should_get_todays_metrics_with_details() {
        // given
        PortfolioMetrics expectedAggregate = TODAY_METRICS;
        DetailSlot expectedDetails = TODAY_DETAIL_SLOT;
        
        given(portfolioMetricsRepository.getTodayMetrics(portfolioId)).willReturn(Optional.of(expectedAggregate));
        given(slotMetricsRepository.getTodayMetrics(portfolioId)).willReturn(Optional.of(expectedDetails));

        // when
        PortfolioMetricsSnapshot result = metricsUseCase.getTodayMetricsWithDetails(portfolioId);

        // then
        assertThat(result.portfolioId()).isEqualTo(portfolioId);
        assertThat(result.aggregate()).isEqualTo(expectedAggregate);
        assertThat(result.todaySlot()).isEqualTo(expectedDetails);
    }

    @Test
    @DisplayName("should handle missing today's data gracefully")
    void should_handle_missing_todays_data() {
        // given
        given(portfolioMetricsRepository.getTodayMetrics(portfolioId)).willReturn(Optional.empty());
        given(slotMetricsRepository.getTodayMetrics(portfolioId)).willReturn(Optional.empty());

        // when
        PortfolioMetricsSnapshot result = metricsUseCase.getTodayMetricsWithDetails(portfolioId);

        // then
        assertThat(result.portfolioId()).isEqualTo(portfolioId);
        assertThat(result.aggregate()).isNull();
        assertThat(result.todaySlot()).isNull();
    }

    // ────────────────────────── Delete Operations ──────────────────────────

    @Test
    @DisplayName("should delete all metrics for portfolio")
    void should_delete_all_metrics_for_portfolio() {
        // when
        metricsUseCase.deleteAll(portfolioId);

        // then
        then(portfolioMetricsRepository).should().deleteAllMetrics(portfolioId);
        then(slotMetricsRepository).should().deleteAllMetrics(portfolioId);
    }

    // ────────────────────────── Edge Cases ──────────────────────────

    @Test
    @DisplayName("should handle empty heatmap snapshot when creating new slot")
    void should_handle_empty_heatmap_when_creating_new_slot() {
        // given
        HeatmapSnapshot emptySnapshot = EMPTY_HEATMAP_SNAPSHOT;
        List<ProjectMetricsWithId> projects = TODAY_PROJECT_METRICS;
        
        given(slotMetricsRepository.getTodayMetrics(portfolioId)).willReturn(Optional.empty());

        // when
        metricsUseCase.saveTodayDetailSlot(portfolioId, emptySnapshot, projects);

        // then
        ArgumentCaptor<PortfolioHeatmap> heatmapCaptor = ArgumentCaptor.forClass(PortfolioHeatmap.class);

        then(slotMetricsRepository).should().saveTodayMetrics(any(PortfolioId.class), heatmapCaptor.capture(), eq(projects));

        PortfolioHeatmap savedHeatmap = heatmapCaptor.getValue();
        assertThat(savedHeatmap.Indexes()).isEmpty();
        assertThat(savedHeatmap.Values()).isEmpty();
        assertThat(savedHeatmap.Counts()).isEmpty();
    }

    @Test
    @DisplayName("should handle empty project metrics when creating new slot")
    void should_handle_empty_project_metrics_when_creating_new_slot() {
        // given
        HeatmapSnapshot heatmapSnapshot = TODAY_HEATMAP_SNAPSHOT;
        List<ProjectMetricsWithId> emptyProjects = EMPTY_PROJECT_METRICS;
        
        given(slotMetricsRepository.getTodayMetrics(portfolioId)).willReturn(Optional.empty());

        // when
        metricsUseCase.saveTodayDetailSlot(portfolioId, heatmapSnapshot, emptyProjects);

        // then
        then(slotMetricsRepository).should().saveTodayMetrics(any(PortfolioId.class), any(PortfolioHeatmap.class), eq(emptyProjects));
    }
}
