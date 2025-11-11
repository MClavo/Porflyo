package com.porflyo.mapper;

import static com.porflyo.handler.data.MetricsTestData.*;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.DetailSlot;
import com.porflyo.dto.EnhancedPortfolioMetrics;
import com.porflyo.dto.EnhancedPortfolioMetricsBundle;
import com.porflyo.dto.response.DailyAggregateDto;
import com.porflyo.dto.response.MetricsResponseDto;
import com.porflyo.dto.response.SlotDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.DerivedMetrics;
import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;
import com.porflyo.model.metrics.ZScores;

@DisplayName("Metrics Response Mapper Tests")
class MetricsResponseMapperTest {

    private MetricsResponseMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new MetricsResponseMapper();
    }

    @Test
    @DisplayName("should_map_complete_bundle_to_response_dto_successfully")
    void should_map_complete_bundle_to_response_dto_successfully() {
        // Given
        PortfolioId portfolioId = new PortfolioId(TEST_PORTFOLIO_ID);
        LocalDate date = LocalDate.of(2025, 11, 10);
        
        Engagement engagement = new Engagement(
            ENHANCED_ACTIVE_TIME,
            ENHANCED_VIEWS,
            ENHANCED_QUALITY_VISITS,
            ENHANCED_EMAIL_COPIES,
            ENHANCED_SOCIAL_CLICKS,
            new Devices(ENHANCED_DESKTOP_VIEWS, ENHANCED_MOBILE_VIEWS)
        );
        
        InteractionMetrics scroll = new InteractionMetrics(
            ENHANCED_SCORE_TOTAL,
            ENHANCED_SCROLL_TIME_TOTAL,
            ENHANCED_TFFI_SUM_MS,
            ENHANCED_TFFI_COUNT
        );
        
        ProjectMetrics cumProjects = new ProjectMetrics(
            ENHANCED_PROJECT_VIEW_TIME,
            ENHANCED_PROJECT_EXPOSURES,
            ENHANCED_PROJECT_CODE_VIEWS,
            ENHANCED_PROJECT_LIVE_VIEWS
        );
        
        DerivedMetrics derived = new DerivedMetrics(
            ENHANCED_DESKTOP_PCT,
            ENHANCED_MOBILE_PCT,
            ENHANCED_ENGAGEMENT_AVG,
            ENHANCED_AVG_SCROLL_TIME_MS,
            ENHANCED_AVG_CARD_VIEW_TIME_MS,
            ENHANCED_TFFI_MEAN_MS,
            ENHANCED_EMAIL_CONVERSION,
            null,
            null
        );
        
        ZScores zScores = new ZScores(
            ENHANCED_Z_VISITS,
            ENHANCED_Z_ENGAGEMENT,
            ENHANCED_Z_TFFI,
            null,
            null
        );
        
        EnhancedPortfolioMetrics enhanced = new EnhancedPortfolioMetrics(
            portfolioId, date, engagement, scroll, cumProjects, derived, zScores
        );
        
        PortfolioHeatmap heatmap = new PortfolioHeatmap(
            "1.0",
            512,
            List.of(7318, 2954, 6302),
            List.of(384, 117, 849),
            List.of(7, 7, 8)
        );
        
        List<ProjectMetricsWithId> projects = List.of(
            new ProjectMetricsWithId(3, 3368, 98, 0, 1),
            new ProjectMetricsWithId(4, 1751, 60, 1, 1)
        );
        
        DetailSlot slot = new DetailSlot(date, heatmap, projects);
        
        EnhancedPortfolioMetricsBundle bundle = new EnhancedPortfolioMetricsBundle(
            portfolioId,
            List.of(enhanced),
            List.of(slot)
        );
        
        // When
        MetricsResponseDto result = mapper.toMetricsResponseDto(bundle);
        
        // Then
        assertNotNull(result);
        assertNotNull(result.meta());
        assertEquals("2025.09.26-r1", result.meta().calcVersion());
        assertEquals(28, result.meta().baseline().windowDays());
        assertEquals("ds", result.meta().units().timeBase());
        assertEquals("ms", result.meta().units().displayTime());
        
        // Verify daily aggregates
        assertEquals(1, result.dailyAgg().size());
        DailyAggregateDto dailyAgg = result.dailyAgg().get(0);
        assertEquals("2025-11-10", dailyAgg.date());
        
        // Verify raw metrics
        assertEquals(ENHANCED_VIEWS, dailyAgg.raw().views());
        assertEquals(ENHANCED_ACTIVE_TIME, dailyAgg.raw().activeTime());
        assertEquals(ENHANCED_EMAIL_COPIES, dailyAgg.raw().emailCopies());
        assertEquals(ENHANCED_DESKTOP_VIEWS, dailyAgg.raw().desktopViews());
        assertEquals(ENHANCED_MOBILE_VIEWS, dailyAgg.raw().mobileTabletViews());
        assertEquals(ENHANCED_SCORE_TOTAL, dailyAgg.raw().sumScrollScore());
        assertEquals(ENHANCED_SCROLL_TIME_TOTAL, dailyAgg.raw().sumScrollTime());
        
        // Verify derived metrics
        assertEquals(ENHANCED_DESKTOP_PCT, dailyAgg.derived().deviceMix().desktopPct());
        assertEquals(ENHANCED_MOBILE_PCT, dailyAgg.derived().deviceMix().mobileTabletPct());
        assertEquals(ENHANCED_ENGAGEMENT_AVG, dailyAgg.derived().engagementAvg());
        assertEquals(48.5, dailyAgg.derived().avgSessionTime()); // 194 / 4
        
        // Verify z-scores
        assertEquals(ENHANCED_Z_VISITS, dailyAgg.zScores().visits());
        assertEquals(ENHANCED_Z_ENGAGEMENT, dailyAgg.zScores().engagement());
        
        // Verify slots
        assertEquals(1, result.slots().size());
        SlotDto slotDto = result.slots().get(0);
        assertEquals("2025-11-10", slotDto.date());
        assertEquals(2, slotDto.projects().size());
        assertEquals(3, slotDto.heatmap().cells().size());
        assertEquals(512, slotDto.heatmap().meta().rows());
    }

    @Test
    @DisplayName("should_return_empty_lists_when_bundle_has_no_data")
    void should_return_empty_lists_when_bundle_has_no_data() {
        // Given
        PortfolioId portfolioId = new PortfolioId(EMPTY_PORTFOLIO_ID);
        EnhancedPortfolioMetricsBundle bundle = new EnhancedPortfolioMetricsBundle(
            portfolioId,
            List.of(),
            List.of()
        );
        
        // When
        MetricsResponseDto result = mapper.toMetricsResponseDto(bundle);
        
        // Then
        assertNotNull(result);
        assertNotNull(result.meta());
        assertEquals(0, result.dailyAgg().size());
        assertEquals(0, result.slots().size());
    }
}

