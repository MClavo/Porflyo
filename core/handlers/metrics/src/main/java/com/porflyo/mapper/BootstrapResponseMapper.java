package com.porflyo.mapper;

import java.util.ArrayList;
import java.util.List;

import com.porflyo.dto.DetailSlot;
import com.porflyo.dto.EnhancedPortfolioMetrics;
import com.porflyo.dto.common.DailyDerivedDto;
import com.porflyo.dto.common.DailyEntryDto;
import com.porflyo.dto.common.DailyRawDto;
import com.porflyo.dto.common.DeviceMixDto;
import com.porflyo.dto.common.HeatmapCellDto;
import com.porflyo.dto.common.HeatmapDto;
import com.porflyo.dto.common.HeatmapMetaDto;
import com.porflyo.dto.common.ProjectRawDto;
import com.porflyo.dto.common.SlotEntryDto;
import com.porflyo.dto.response.BootstrapResponseDto;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.ProjectMetricsWithId;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Mapper for bootstrap response.
 */
@Singleton
public class BootstrapResponseMapper {

    private final MetricsCommonMapper commonMapper;

    @Inject
    public BootstrapResponseMapper(MetricsCommonMapper commonMapper) {
        this.commonMapper = commonMapper;
    }

    /**
     * Maps to bootstrap response DTO.
     */
    public BootstrapResponseDto map(
            List<EnhancedPortfolioMetrics> enhancedMetrics,
            List<DetailSlot> slots,
            Integer baselineWindowDays
    ) {
        return new BootstrapResponseDto(
            commonMapper.createMeta(baselineWindowDays),
            mapDailyEntries(enhancedMetrics),
            mapSlots(slots)
        );
    }

    private List<DailyEntryDto> mapDailyEntries(List<EnhancedPortfolioMetrics> enhancedMetrics) {
        return enhancedMetrics.stream()
            .map(this::mapDailyEntry)
            .toList();
    }

    private DailyEntryDto mapDailyEntry(EnhancedPortfolioMetrics enhanced) {
        return new DailyEntryDto(
            commonMapper.formatDate(enhanced.date()),
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
            new DeviceMixDto(enhanced.derived().desktopPct(), enhanced.derived().mobileTabletPct()),
            enhanced.derived().engagementAvg(),
            enhanced.derived().avgScrollTimeMs(),
            enhanced.derived().avgCardViewTimeMs(),
            enhanced.derived().ttfiMeanMs(),
            enhanced.derived().emailConversion()
        );
    }

    private List<SlotEntryDto> mapSlots(List<DetailSlot> slots) {
        return slots.stream()
            .map(this::mapSlot)
            .toList();
    }

    private SlotEntryDto mapSlot(DetailSlot slot) {
        return new SlotEntryDto(
            commonMapper.formatDate(slot.date()),
            mapProjects(slot.projects()),
            mapHeatmap(slot.heatmap())
        );
    }

    private List<ProjectRawDto> mapProjects(List<ProjectMetricsWithId> projects) {
        return projects.stream()
            .map(p -> new ProjectRawDto(
                p.id(),
                p.exposures(),
                p.viewTime(),
                p.codeViews(),
                p.liveViews()
            ))
            .toList();
    }

    private HeatmapDto mapHeatmap(PortfolioHeatmap heatmap) {
        List<HeatmapCellDto> cells = new ArrayList<>();
        
        for (int i = 0; i < heatmap.Indexes().size(); i++) {
            cells.add(new HeatmapCellDto(
                heatmap.Indexes().get(i),
                heatmap.Values().get(i),
                heatmap.Counts().get(i)
            ));
        }
        
        return new HeatmapDto(
            new HeatmapMetaDto(
                50, // rows - typical viewport rows
                heatmap.columns(),
                cells.size() // k - number of cells
            ),
            cells
        );
    }
}