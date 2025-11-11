package com.porflyo.mapper;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.porflyo.dto.DetailSlot;
import com.porflyo.dto.EnhancedPortfolioMetrics;
import com.porflyo.dto.EnhancedPortfolioMetricsBundle;
import com.porflyo.dto.response.BaselineDto;
import com.porflyo.dto.response.DailyAggregateDto;
import com.porflyo.dto.response.DerivedMetricsDto;
import com.porflyo.dto.response.DeviceMixDto;
import com.porflyo.dto.response.HeatmapCellDto;
import com.porflyo.dto.response.HeatmapDto;
import com.porflyo.dto.response.HeatmapMetaDto;
import com.porflyo.dto.response.MetaResponseDto;
import com.porflyo.dto.response.MetricsResponseDto;
import com.porflyo.dto.response.ProjectSlotDto;
import com.porflyo.dto.response.RawMetricsDto;
import com.porflyo.dto.response.SlotDto;
import com.porflyo.dto.response.UnitsDto;
import com.porflyo.dto.response.ZScoresDto;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.ProjectMetricsWithId;

import jakarta.inject.Singleton;

/**
 * Mapper for converting EnhancedPortfolioMetricsBundle to MetricsResponseDto.
 * Transforms the domain bundle into the DTO format expected by the API response.
 */
@Singleton
public class MetricsResponseMapper {
    
    private static final String CALC_VERSION = "2025.09.26-r1";
    private static final String TIME_BASE = "ds";
    private static final String DISPLAY_TIME = "ms";
    private static final Integer BASELINE_WINDOW_DAYS = 28;
    
    /**
     * Converts EnhancedPortfolioMetricsBundle to MetricsResponseDto.
     */
    public MetricsResponseDto toMetricsResponseDto(EnhancedPortfolioMetricsBundle bundle) {
        MetaResponseDto meta = buildMeta();
        
        List<DailyAggregateDto> dailyAgg = bundle.aggregates().stream()
            .map(this::toDailyAggregateDto)
            .collect(Collectors.toList());
        
        List<SlotDto> slots = bundle.slots().stream()
            .map(this::toSlotDto)
            .collect(Collectors.toList());
        
        return new MetricsResponseDto(meta, dailyAgg, slots);
    }
    
    /**
     * Builds the meta section of the response.
     */
    private MetaResponseDto buildMeta() {
        String generatedAt = LocalDate.now().toString();
        String timezone = ZoneId.systemDefault().getId();
        UnitsDto units = new UnitsDto(TIME_BASE, DISPLAY_TIME);
        BaselineDto baseline = new BaselineDto(BASELINE_WINDOW_DAYS);
        
        return new MetaResponseDto(CALC_VERSION, generatedAt, timezone, units, baseline);
    }
    
    /**
     * Converts EnhancedPortfolioMetrics to DailyAggregateDto.
     */
    private DailyAggregateDto toDailyAggregateDto(EnhancedPortfolioMetrics enhanced) {
        String date = enhanced.date().toString();
        
        RawMetricsDto raw = new RawMetricsDto(
            enhanced.engagement().views(),
            enhanced.engagement().activeTime(),
            enhanced.engagement().emailCopies(),
            enhanced.engagement().devices().desktopViews(),
            enhanced.engagement().devices().mobileTabletViews(),
            enhanced.scroll().scoreTotal(),
            enhanced.scroll().scrollTimeTotal(),
            enhanced.engagement().qualityVisits(),
            enhanced.cumProjects().viewTime(),
            enhanced.cumProjects().exposures(),
            enhanced.cumProjects().codeViews(),
            enhanced.cumProjects().liveViews(),
            enhanced.scroll().ttfiSumMs(),
            enhanced.scroll().ttfiCount(),
            enhanced.engagement().socialClicks()
        );
        
        DerivedMetricsDto derived = new DerivedMetricsDto(
            new DeviceMixDto(
                enhanced.derived().desktopPct(),
                enhanced.derived().mobileTabletPct()
            ),
            enhanced.derived().engagementAvg(),
            enhanced.derived().avgScrollTimeMs(),
            calculateAvgSessionTime(enhanced),
            enhanced.derived().avgCardViewTimeMs(),
            enhanced.derived().ttfiMeanMs(),
            enhanced.derived().emailConversion()
        );
        
        ZScoresDto zScores = new ZScoresDto(
            enhanced.zScores().visits(),
            enhanced.zScores().engagement(),
            enhanced.zScores().ttfi()
        );
        
        return new DailyAggregateDto(date, raw, derived, zScores);
    }
    
    /**
     * Calculates average session time from engagement metrics.
     * Formula: activeTime / views
     */
    private Double calculateAvgSessionTime(EnhancedPortfolioMetrics enhanced) {
        int views = enhanced.engagement().views();
        if (views == 0) {
            return 0.0;
        }
        return (double) enhanced.engagement().activeTime() / views;
    }
    
    /**
     * Converts DetailSlot to SlotDto.
     */
    private SlotDto toSlotDto(DetailSlot slot) {
        String date = slot.date().toString();
        
        List<ProjectSlotDto> projects = slot.projects().stream()
            .map(this::toProjectSlotDto)
            .collect(Collectors.toList());
        
        HeatmapDto heatmap = toHeatmapDto(slot.heatmap());
        
        return new SlotDto(date, projects, heatmap);
    }
    
    /**
     * Converts ProjectMetricsWithId to ProjectSlotDto.
     */
    private ProjectSlotDto toProjectSlotDto(ProjectMetricsWithId project) {
        return new ProjectSlotDto(
            project.id(),
            project.exposures(),
            project.viewTime(),
            project.codeViews(),
            project.liveViews()
        );
    }
    
    /**
     * Converts PortfolioHeatmap to HeatmapDto.
     */
    private HeatmapDto toHeatmapDto(PortfolioHeatmap heatmap) {
        HeatmapMetaDto meta = new HeatmapMetaDto(
            heatmap.rows(),
            heatmap.Indexes().size()
        );
        
        List<HeatmapCellDto> cells = new ArrayList<>();
        for (int i = 0; i < heatmap.Indexes().size(); i++) {
            cells.add(new HeatmapCellDto(
                heatmap.Indexes().get(i),
                heatmap.Values().get(i),
                heatmap.Counts().get(i)
            ));
        }
        
        return new HeatmapDto(meta, cells);
    }
}
