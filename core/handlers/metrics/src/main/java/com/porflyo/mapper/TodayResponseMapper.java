package com.porflyo.mapper;

import com.porflyo.dto.DetailSlot;
import com.porflyo.dto.EnhancedPortfolioMetrics;
import com.porflyo.dto.common.DailyDerivedDto;
import com.porflyo.dto.common.DailyRawDto;
import com.porflyo.dto.response.TodayDailyDto;
import com.porflyo.dto.response.TodayResponseDto;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Mapper for today response.
 */
@Singleton
public class TodayResponseMapper {

    private final MetricsCommonMapper commonMapper;
    private final BootstrapResponseMapper bootstrapMapper;

    @Inject
    public TodayResponseMapper(
            MetricsCommonMapper commonMapper,
            BootstrapResponseMapper bootstrapMapper) {
        this.commonMapper = commonMapper;
        this.bootstrapMapper = bootstrapMapper;
    }

    /**
     * Maps to today response DTO.
     */
    public TodayResponseDto map(
            EnhancedPortfolioMetrics todayMetrics,
            DetailSlot todaySlot,
            Integer baselineWindowDays
    ) {
        return new TodayResponseDto(
            commonMapper.createMeta(baselineWindowDays),
            commonMapper.formatDate(todayMetrics.date()),
            mapTodayDaily(todayMetrics),
            mapSlot(todaySlot)
        );
    }

    private TodayDailyDto mapTodayDaily(EnhancedPortfolioMetrics enhanced) {
        return new TodayDailyDto(
            mapRawData(enhanced),
            mapDerivedData(enhanced),
            commonMapper.mapZScores(enhanced.zScores())
        );
    }

    private DailyRawDto mapRawData(EnhancedPortfolioMetrics enhanced) {
        return new DailyRawDto(
            enhanced.engagement().views(),
            enhanced.engagement().emailCopies(),
            enhanced.engagement().devices().desktopViews(),
            enhanced.engagement().devices().mobileTabletViews(),
            enhanced.scroll().scoreTotal(),
            enhanced.scroll().scrollTimeTotal(),
            enhanced.engagement().qualityVisits(),
            enhanced.cumProjects().viewTime(),
            enhanced.cumProjects().exposures(),
            enhanced.scroll().ttfiSumMs(),
            enhanced.scroll().ttfiCount(),
            enhanced.engagement().socialClicks()
        );
    }

    private DailyDerivedDto mapDerivedData(EnhancedPortfolioMetrics enhanced) {
        if (enhanced.derived() == null) {
            return null;
        }
        
        return new DailyDerivedDto(
            new com.porflyo.dto.common.DeviceMixDto(enhanced.derived().desktopPct(), enhanced.derived().mobileTabletPct()),
            enhanced.derived().engagementAvg(),
            enhanced.derived().avgScrollTimeMs(),
            enhanced.derived().avgCardViewTimeMs(),
            enhanced.derived().ttfiMeanMs(),
            enhanced.derived().emailConversion()
        );
    }

    private com.porflyo.dto.common.SlotEntryDto mapSlot(DetailSlot slot) {
        return new com.porflyo.dto.common.SlotEntryDto(
            commonMapper.formatDate(slot.date()),
            mapProjects(slot.projects()),
            mapHeatmap(slot.heatmap())
        );
    }

    private java.util.List<com.porflyo.dto.common.ProjectRawDto> mapProjects(java.util.List<com.porflyo.model.metrics.ProjectMetricsWithId> projects) {
        return projects.stream()
            .map(p -> new com.porflyo.dto.common.ProjectRawDto(
                p.id(),
                p.exposures(),
                p.viewTime(),
                p.codeViews(),
                p.liveViews()
            ))
            .toList();
    }

    private com.porflyo.dto.common.HeatmapDto mapHeatmap(com.porflyo.model.metrics.PortfolioHeatmap heatmap) {
        java.util.List<com.porflyo.dto.common.HeatmapCellDto> cells = new java.util.ArrayList<>();
        
        for (int i = 0; i < heatmap.Indexes().size(); i++) {
            cells.add(new com.porflyo.dto.common.HeatmapCellDto(
                heatmap.Indexes().get(i),
                heatmap.Values().get(i),
                heatmap.Counts().get(i)
            ));
        }
        
        return new com.porflyo.dto.common.HeatmapDto(
            new com.porflyo.dto.common.HeatmapMetaDto(
                heatmap.rows(),
                cells.size() // k - number of cells
            ),
            cells
        );
    }
}