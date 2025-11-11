package com.porflyo.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.porflyo.dto.HeatmapSnapshot;
import com.porflyo.dto.received.HeatmapDataDto;
import com.porflyo.dto.received.MetricsSaveRequestDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;

import jakarta.inject.Singleton;

/**
 * Mapper for converting MetricsSaveRequestDto to domain objects.
 * Transforms the DTO received from the frontend into the domain classes
 * required by MetricsUseCase methods.
 */
@Singleton
public class MetricsSaveRequestMapper {

    /**
     * Extracts the portfolio ID from the request DTO.
     */
    public PortfolioId toPortfolioId(MetricsSaveRequestDto dto) {
        return new PortfolioId(dto.portfolioId());
    }

    /**
     * Maps the request DTO to an Engagement domain object.
     * 
     * Note: The JSON contains activeTimeMs which represents a single session.
     * For daily aggregates, this will be summed with existing values in the use case.
     */
    public Engagement toEngagement(MetricsSaveRequestDto dto) {
        // Single session - use 1 for views and qualityVisits
        // emailCopied is boolean in JSON, convert to count (0 or 1)
        return new Engagement(
            dto.activeTimeMs(),
            1,  // views - this is one session
            isQualityVisit(dto) ? 1 : 0,  // qualityVisits - computed from request
            dto.emailCopied() ? 1 : 0,  // emailCopies
            dto.socialClicks(),
            toDevices(dto)
        );
    }

    /**
     * Maps the request DTO to a Devices domain object.
     */
    private Devices toDevices(MetricsSaveRequestDto dto) {
        return new Devices(
            dto.isMobile() ? 0 : 1,  // desktopViews
            dto.isMobile() ? 1 : 0   // mobileTabletViews
        );
    }

    private boolean isQualityVisit(MetricsSaveRequestDto dto) {
        if (dto.tffiMs() > 0 || (dto.scrollMetrics().score() >= 50 && dto.scrollMetrics().scrollTimeMs() >= 60000)) {
            return true;

        } 

        return false;
    }

    /**
     * Maps the scroll metrics from the request DTO to an InteractionMetrics domain object.
     * 
     * Note: This represents a single session's scroll metrics.
     * The use case will aggregate these with existing daily values.
     */
    public InteractionMetrics toInteractionMetrics(MetricsSaveRequestDto dto) {
        return new InteractionMetrics(
            dto.scrollMetrics().score(),
            dto.scrollMetrics().scrollTimeMs(),
            dto.tffiMs(),
            1
        );
    }

    /**
     * Maps the cumulative project metrics from the request DTO to a ProjectMetrics domain object.
     * This represents the cumulative totals across all projects.
     */
    public ProjectMetrics toCumulativeProjectMetrics(MetricsSaveRequestDto dto) {
        int totalViewTime = dto.projectMetrics().stream()
            .mapToInt(p -> p.viewTime())
            .sum();
        
        int totalExposures = dto.projectMetrics().stream()
            .mapToInt(p -> p.exposures())
            .sum();
        
        int totalCodeViews = dto.projectMetrics().stream()
            .mapToInt(p -> p.codeViews())
            .sum();
        
        int totalLiveViews = dto.projectMetrics().stream()
            .mapToInt(p -> p.liveViews())
            .sum();

        return new ProjectMetrics(
            totalViewTime,
            totalExposures,
            totalCodeViews,
            totalLiveViews
        );
    }

    /**
     * Maps the heatmap data from the request DTO to a HeatmapSnapshot.
     */
    public HeatmapSnapshot toHeatmapSnapshot(MetricsSaveRequestDto dto) {
        HeatmapDataDto heatmapData = dto.heatmapData();
        
        return new HeatmapSnapshot(
            "1.0",  // version
            heatmapData.cols(),
            heatmapData.topCells().indices(),
            heatmapData.topCells().values()
        );
    }

    /**
     * Maps the individual project metrics from the request DTO to a list of ProjectMetricsWithId.
     */
    public List<ProjectMetricsWithId> toProjectMetricsList(MetricsSaveRequestDto dto) {
        return dto.projectMetrics().stream()
            .map(projectDto -> new ProjectMetricsWithId(
                Integer.parseInt(projectDto.id()),
                projectDto.viewTime(),
                projectDto.exposures(),
                projectDto.codeViews(),
                projectDto.liveViews()
            ))
            .collect(Collectors.toList());
    }
}
