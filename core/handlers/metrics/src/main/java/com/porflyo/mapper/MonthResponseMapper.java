package com.porflyo.mapper;

import java.util.List;

import com.porflyo.dto.EnhancedPortfolioMetrics;
import com.porflyo.dto.common.DailyDerivedDto;
import com.porflyo.dto.common.DailyEntryDto;
import com.porflyo.dto.common.DailyRawDto;
import com.porflyo.dto.common.DeviceMixDto;
import com.porflyo.dto.response.MonthResponseDto;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Mapper for month response.
 */
@Singleton
public class MonthResponseMapper {

    private final MetricsCommonMapper commonMapper;

    @Inject
    public MonthResponseMapper(MetricsCommonMapper commonMapper) {
        this.commonMapper = commonMapper;
    }

    /**
     * Maps to month response DTO.
     */
    public MonthResponseDto map(
            List<EnhancedPortfolioMetrics> enhancedMetrics,
            Integer baselineWindowDays
    ) {
        return new MonthResponseDto(
            commonMapper.createMeta(baselineWindowDays),
            mapDailyEntries(enhancedMetrics)
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
}