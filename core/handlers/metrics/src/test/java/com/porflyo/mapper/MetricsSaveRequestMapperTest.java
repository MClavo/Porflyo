package com.porflyo.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.HeatmapSnapshot;
import com.porflyo.dto.received.HeatmapDataDto;
import com.porflyo.dto.received.MetricsSaveRequestDto;
import com.porflyo.dto.received.ProjectMetricDto;
import com.porflyo.dto.received.ScrollMetricDto;
import com.porflyo.dto.received.TopCellsDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;

@DisplayName("Metrics Save Request Mapper Tests")
class MetricsSaveRequestMapperTest {

    private MetricsSaveRequestMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new MetricsSaveRequestMapper();
    }

    @Test
    @DisplayName("should map to PortfolioId when given valid DTO")
    void shouldMapToPortfolioIdWhenGivenValidDto() {
        // Given
        MetricsSaveRequestDto dto = createSampleDto();
        
        // When
        PortfolioId result = mapper.toPortfolioId(dto);
        
        // Then
        assertNotNull(result);
        assertEquals("34nLQz9slVUWY1lClbloGKQc7ZJ", result.value());
    }

    @Test
    @DisplayName("should map to Engagement when given valid DTO")
    void shouldMapToEngagementWithDesktopViewWhenDeviceIsNotMobile() {
        // Given
        MetricsSaveRequestDto dto = createSampleDto();
        
        // When
        Engagement result = mapper.toEngagement(dto);
        
        // Then
        assertNotNull(result);
        assertEquals(47372, result.activeTime());
        assertEquals(1, result.views());
        assertEquals(1, result.qualityVisits());
        assertEquals(0, result.emailCopies());
        assertEquals(2, result.socialClicks());
        assertNotNull(result.devices());
        assertEquals(1, result.devices().desktopViews());
        assertEquals(0, result.devices().mobileTabletViews());
    }

    @Test
    @DisplayName("should map to Engagement when given valid DTO with mobile device")
    void shouldMapToEngagementWithMobileViewWhenDeviceIsMobile() {
        // Given
        MetricsSaveRequestDto dto = createMobileDto();
        
        // When
        Engagement result = mapper.toEngagement(dto);
        
        // Then
        assertNotNull(result);
        assertEquals(0, result.devices().desktopViews());
        assertEquals(1, result.devices().mobileTabletViews());
    }

    @Test
    @DisplayName("should map to Engagement with email copy when email was copied")
    void shouldMapToEngagementWithEmailCopyWhenEmailWasCopied() {
        // Given
        MetricsSaveRequestDto dto = createDtoWithEmailCopied();
        
        // When
        Engagement result = mapper.toEngagement(dto);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.emailCopies());
    }

    @Test
    @DisplayName("should map to InteractionMetrics when given valid DTO")
    void shouldMapToInteractionMetricsWhenGivenValidDto() {
        // Given
        MetricsSaveRequestDto dto = createSampleDto();
        
        // When
        InteractionMetrics result = mapper.toInteractionMetrics(dto);
        
        // Then
        assertNotNull(result);
        assertEquals(70, result.scoreTotal());
        assertEquals(17643, result.scrollTimeTotal());
        assertEquals(2100, result.ttfiSumMs()); 
        assertEquals(1, result.ttfiCount());
    }

    @Test
    @DisplayName("should map to cumulative ProjectMetrics when given multiple projects")
    void shouldMapToCumulativeProjectMetricsWhenGivenMultipleProjects() {
        // Given
        MetricsSaveRequestDto dto = createSampleDto();
        
        // When
        ProjectMetrics result = mapper.toCumulativeProjectMetrics(dto);
        
        // Then
        assertNotNull(result);
        assertEquals(30418, result.viewTime());
        assertEquals(11, result.exposures());
        assertEquals(3, result.codeViews());
        assertEquals(2, result.liveViews());
    }

    @Test
    @DisplayName("should map to HeatmapSnapshot when given heatmap data")
    void shouldMapToHeatmapSnapshotWhenGivenHeatmapData() {
        // Given
        MetricsSaveRequestDto dto = createSampleDto();
        
        // When
        HeatmapSnapshot result = mapper.toHeatmapSnapshot(dto);
        
        // Then
        assertNotNull(result);
        assertEquals("1.0", result.version());
        assertEquals(64, result.columns());
        assertEquals(13, result.Indexes().size());
        assertEquals(13, result.Values().size());
        assertEquals(5401, result.Indexes().get(0));
        assertEquals(35, result.Values().get(0));
    }

    @Test
    @DisplayName("should map to ProjectMetricsList when given multiple projects")
    void shouldMapToProjectMetricsListWhenGivenMultipleProjects() {
        // Given
        MetricsSaveRequestDto dto = createSampleDto();
        
        // When
        List<ProjectMetricsWithId> result = mapper.toProjectMetricsList(dto);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        ProjectMetricsWithId first = result.get(0);
        assertEquals(773337289, first.id());
        assertEquals(26052, first.viewTime());
        assertEquals(6, first.exposures());
        assertEquals(2, first.codeViews());
        assertEquals(0, first.liveViews());
        
        ProjectMetricsWithId second = result.get(1);
        assertEquals(998414481, second.id());
        assertEquals(4366, second.viewTime());
        assertEquals(5, second.exposures());
        assertEquals(1, second.codeViews());
        assertEquals(2, second.liveViews());
    }

    @Test
    @DisplayName("should not count as quality visit when no significant interactions")
    void shouldNotCountAsQualityVisitWhenNoSignificantInteractions() {
        // Given
        MetricsSaveRequestDto dto = new MetricsSaveRequestDto(
            "34nLQz9slVUWY1lClbloGKQc7ZJ",
            1000,
            0,
            false,
            false,
            0,
            Arrays.asList(
                new ProjectMetricDto("1", 100, 1, 0, 0),
                new ProjectMetricDto("2", 50, 0, 0, 0)
            ),
            new ScrollMetricDto(10, 5000),
            createHeatmapData()
        );

        // When
        Engagement result = mapper.toEngagement(dto);
        
        // Then
        assertNotNull(result);
        assertEquals(0, result.qualityVisits());
    }

    @Test
    @DisplayName("should count as quality visit when TTFI is positive")
    void shouldCountAsQualityVisitWhenTffiIsPositive() {
        // Given
        MetricsSaveRequestDto dto = new MetricsSaveRequestDto(
            "34nLQz9slVUWY1lClbloGKQc7ZJ",
            2000,
            800,
            false,
            false,
            0,
            Arrays.asList(
                new ProjectMetricDto("1", 100, 1, 1, 0)
            ),
            new ScrollMetricDto(10, 1000),
            createHeatmapData()
        );

        // When
        Engagement result = mapper.toEngagement(dto);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.qualityVisits());
    }

    @Test
    @DisplayName("should count as quality visit when high scroll engagement")
    void shouldCountAsQualityVisitWhenHighScrollEngagement() {
        // Given
        MetricsSaveRequestDto dto = new MetricsSaveRequestDto(
            "34nLQz9slVUWY1lClbloGKQc7ZJ",
            65000,
            0,
            false,
            false,
            0,
            Arrays.asList(
                new ProjectMetricDto("1", 60000, 10, 0, 0)
            ),
            new ScrollMetricDto(50, 60000),
            createHeatmapData()
        );

        // When
        Engagement result = mapper.toEngagement(dto);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.qualityVisits());
    }

    // Helper methods to create test DTOs

    private MetricsSaveRequestDto createSampleDto() {
        return new MetricsSaveRequestDto(
            "34nLQz9slVUWY1lClbloGKQc7ZJ",
            47372,
            2100,
            false, // desktop
            false, // email not copied
            2,
            createProjectMetrics(),
            new ScrollMetricDto(70, 17643),
            createHeatmapData()
        );
    }

    private MetricsSaveRequestDto createMobileDto() {
        return new MetricsSaveRequestDto(
            "34nLQz9slVUWY1lClbloGKQc7ZJ",
            30000,
            15000,
            true, // mobile
            false,
            1,
            createProjectMetrics(),
            new ScrollMetricDto(50, 10000),
            createHeatmapData()
        );
    }

    private MetricsSaveRequestDto createDtoWithEmailCopied() {
        return new MetricsSaveRequestDto(
            "34nLQz9slVUWY1lClbloGKQc7ZJ",
            30000,
            15000,
            false,
            true, // email copied
            1,
            createProjectMetrics(),
            new ScrollMetricDto(50, 10000),
            createHeatmapData()
        );
    }

    private List<ProjectMetricDto> createProjectMetrics() {
        return Arrays.asList(
            new ProjectMetricDto("773337289", 26052, 6, 2, 0),
            new ProjectMetricDto("998414481", 4366, 5, 1, 2)
        );
    }

    private HeatmapDataDto createHeatmapData() {
        TopCellsDto topCells = new TopCellsDto(
            Arrays.asList(5401, 5400, 207, 346, 347, 975, 276, 5465, 917, 5397, 795, 345, 6922),
            Arrays.asList(35, 31, 29, 24, 21, 19, 18, 18, 17, 17, 16, 15, 15)
        );
        return new HeatmapDataDto(64, 137, topCells);
    }
}
