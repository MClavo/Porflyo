package com.porflyo.usecase;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.configuration.MetricsConfig;
import com.porflyo.dto.DetailSlot;
import com.porflyo.dto.EnhancedDetailSlot;
import com.porflyo.dto.EnhancedPortfolioMetrics;
import com.porflyo.dto.EnhancedPortfolioMetricsBundle;
import com.porflyo.dto.EnhancedPortfolioMetricsSnapshot;
import com.porflyo.dto.EnhancedProjectMetricsWithId;
import com.porflyo.dto.HeatmapSnapshot;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.DerivedMetrics;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;
import com.porflyo.model.metrics.ZScores;
import com.porflyo.ports.PortfolioMetricsRepository;
import com.porflyo.ports.SlotMetricsRepository;
import com.porflyo.utils.derived.ProjectDerivedCalculator;
import com.porflyo.utils.facade.PortfolioAnalyticsFacade;
import com.porflyo.utils.HeatmapUtils;
import com.porflyo.utils.PortfolioMetricsUtils;

import jakarta.inject.Inject;

public class MetricsUseCase {
    private static final Logger log = LoggerFactory.getLogger(MetricsUseCase.class);
    private final PortfolioMetricsRepository portfolioMetricsRepository;
    private final SlotMetricsRepository slotMetricsRepository;
    private final MetricsConfig metricsConfig;

    @Inject
    public MetricsUseCase(
            PortfolioMetricsRepository portfolioMetricsRepository,
            SlotMetricsRepository slotMetricsRepository,
            MetricsConfig metricsConfig
    ) {

        this.portfolioMetricsRepository = portfolioMetricsRepository;
        this.slotMetricsRepository = slotMetricsRepository;
        this.metricsConfig = metricsConfig;
    }


    // ────────────────────────── Create ──────────────────────────

    /**
     * Save the aggregate PortfolioMetrics for today.
     * The repository implementation is responsible for creating or updating the record as needed.
     *
     * @param portfolioId target portfolio
     * @param engagement today's engagement metrics
     * @param scroll today's scroll metrics
     * @param cumProjects today's cumulative project metrics
     */
    public void saveTodayPortfolioMetrics(
            PortfolioId portfolioId,
            Engagement engagement,
            InteractionMetrics scroll,
            ProjectMetrics cumProjects
    ){

        Optional<PortfolioMetrics> existing = portfolioMetricsRepository.getTodayMetrics(portfolioId);
        PortfolioMetrics toSave;

        if (existing.isPresent()) {
            toSave = PortfolioMetricsUtils.updatePortfolioMetrics(
                    existing.get(),
                    engagement,
                    scroll,
                    cumProjects);
            
            log.debug("Updating existing metrics for portfolio {} on date {}", portfolioId, existing.get().date());

        } else {
            toSave = new PortfolioMetrics(portfolioId, LocalDate.now(), engagement, scroll, cumProjects);
        }

        portfolioMetricsRepository.saveTodayMetrics(toSave);
        log.debug("Saved today's portfolio metrics for portfolio {}", toSave.portfolioId());
    }


    /**
     * Save today's details (one heatmap and the list of project metrics for today).
     * The repository implementation is responsible for rotating the 10 slots and compacting storage.
     *
     * @param portfolioId target portfolio
     * @param heatmap today's heatmap
     * @param projects list of project metrics for today
     * @return the saved detail slot
     */
    public void saveTodayDetailSlot(
        PortfolioId portfolioId,
        HeatmapSnapshot heatmap,
        List<ProjectMetricsWithId> projects
    ) {
        Optional<DetailSlot> dbSlot = slotMetricsRepository.getTodayMetrics(portfolioId);
        PortfolioHeatmap heatmapToSave;
        List<ProjectMetricsWithId> projectsToSave;

        if (dbSlot.isEmpty()) {
            heatmapToSave = convertToPortfolioHeatmap(heatmap);
            projectsToSave = projects;
            
            log.debug("Created new slot for portfolio {}", portfolioId);
        
        } else {
            heatmapToSave = HeatmapUtils.updateHeatmap(dbSlot.get().heatmap(), heatmap, metricsConfig.heatmapCellCount());
            projectsToSave = updateProjects(dbSlot.get().projects(), projects);

            log.debug("Updated existing slot for portfolio {}", portfolioId);
        }

        slotMetricsRepository.saveTodayMetrics(portfolioId, heatmapToSave, projectsToSave);
    }


    // ────────────────────────── Read ──────────────────────────

    /**
     * Returns portfolio metrics with derived metrics and z-scores for the last {@code monthsBack} months.
     * This method calculates derived metrics and z-scores on-the-fly for each day.
     *
     * @param portfolioId target portfolio
     * @param monthsBack months to go back
     * @return list of portfolio metrics with computed analytics
     */
    public List<EnhancedPortfolioMetrics> getPortfolioMetrics(PortfolioId portfolioId, int monthsBack) {
        List<PortfolioMetrics> rawMetrics = portfolioMetricsRepository.findPortfolioMetrics(portfolioId, monthsBack);
        return enhanceMetricsWithAnalytics(rawMetrics);
    }

    /**
     * Returns portfolio metrics with derived metrics and z-scores for the last {@code monthsBack} months.
     * Also returns detail slots (heatmaps and per-project metrics) with enhanced project-level derived metrics.
     *
     * @param portfolioId target portfolio
     * @param monthsBack months to go back
     * @return bundle with computed analytics including project-level metrics
     */
    public EnhancedPortfolioMetricsBundle getPortfolioMetricsWithSlots(PortfolioId portfolioId, int monthsBack) {
        List<PortfolioMetrics> rawMetrics = portfolioMetricsRepository.findPortfolioMetrics(portfolioId, monthsBack);
        List<DetailSlot> slots = slotMetricsRepository.getAllMetrics(portfolioId);
        
        List<EnhancedPortfolioMetrics> enhancedMetrics = enhanceMetricsWithAnalytics(rawMetrics);
        List<EnhancedDetailSlot> enhancedSlots = enhanceDetailSlots(slots);
        
        // Convert enhanced slots back to regular DetailSlot shape for backward compatibility
        List<DetailSlot> regularSlots = enhancedSlots.stream()
            .map(es -> new DetailSlot(es.date(), es.heatmap(), 
                es.projects().stream()
                    .map(ep -> new ProjectMetricsWithId(ep.id(), ep.viewTime(), ep.exposures(), ep.codeViews(), ep.liveViews()))
                    .collect(Collectors.toList())))
            .collect(Collectors.toList());
        
        return new EnhancedPortfolioMetricsBundle(portfolioId, enhancedMetrics, regularSlots);
    }

    /**
     * Returns portfolio metrics for a specific month with derived metrics and z-scores.
     *
     * @param portfolioId target portfolio
     * @param monthsBack months to go back (0 = current month)
     * @return list of portfolio metrics with computed analytics for the specified month
     */
    public List<EnhancedPortfolioMetrics> getPortfolioMetricsOneMonth(PortfolioId portfolioId, int monthsBack) {
        List<PortfolioMetrics> rawMetrics = portfolioMetricsRepository.findPortfolioMetricsOneMonth(portfolioId, monthsBack);
        return enhanceMetricsWithAnalytics(rawMetrics);
    }

    /**
     * Returns today's aggregate and today's details with computed derived metrics and z-scores.
     *
     * @param portfolioId target portfolio
     * @return snapshot containing today's aggregate with analytics and today's details
     */
    public EnhancedPortfolioMetricsSnapshot getTodayMetricsWithDetails(PortfolioId portfolioId) {
        PortfolioMetrics aggregate = portfolioMetricsRepository.getTodayMetrics(portfolioId).orElse(null);
        DetailSlot details = slotMetricsRepository.getTodayMetrics(portfolioId).orElse(null);
        
        EnhancedPortfolioMetrics enhancedAggregate = null;
        if (aggregate != null) {
            // Get baseline metrics for z-score calculation
            List<PortfolioMetrics> baselineMetrics = portfolioMetricsRepository.findPortfolioMetrics(
                portfolioId, 
                1 // Get current month for baseline calculation
            );
            
            DerivedMetrics derived = PortfolioAnalyticsFacade.calculateDerivedMetrics(
                aggregate.engagement(), 
                aggregate.scroll(), 
                aggregate.cumProjects()
            );
            
            ZScores zScores = PortfolioAnalyticsFacade.calculateZScores(
                aggregate, 
                baselineMetrics, 
                metricsConfig.baselineWindowDays()
            );
            
            enhancedAggregate = EnhancedPortfolioMetrics.from(aggregate, derived, zScores);
        }
        
        return new EnhancedPortfolioMetricsSnapshot(portfolioId, enhancedAggregate, details);
    }


    // ────────────────────────── Delete ──────────────────────────

    public void deleteAll(PortfolioId portfolioId){
        portfolioMetricsRepository.deleteAllMetrics(portfolioId);
        slotMetricsRepository.deleteAllMetrics(portfolioId);
    }


    // ────────────────────────── Helpers ──────────────────────────

    /**
     * Enhances a list of raw portfolio metrics with derived metrics and z-scores.
     * This method is optimized to calculate analytics efficiently in a single pass.
     *
     * @param rawMetrics list of raw portfolio metrics sorted by date (most recent first)
     * @return list of enhanced portfolio metrics with computed analytics
     */
    private List<EnhancedPortfolioMetrics> enhanceMetricsWithAnalytics(List<PortfolioMetrics> rawMetrics) {
        if (rawMetrics == null || rawMetrics.isEmpty()) {
            return Collections.emptyList();
        }

        List<EnhancedPortfolioMetrics> enhancedMetrics = new ArrayList<>(rawMetrics.size());
        
        // Process each metric and calculate derived metrics and z-scores
        for (int i = 0; i < rawMetrics.size(); i++) {
            PortfolioMetrics currentMetric = rawMetrics.get(i);
            
            // Calculate derived metrics
            DerivedMetrics derived = PortfolioAnalyticsFacade.calculateDerivedMetrics(
                currentMetric.engagement(),
                currentMetric.scroll(), 
                currentMetric.cumProjects()
            );
            
            // Calculate z-scores using a baseline window of previous days
            // Get baseline from the rest of the list (excluding current index)
            List<PortfolioMetrics> baselineMetrics = rawMetrics.stream()
                .skip(i + 1) // Skip current and more recent metrics
                .limit(metricsConfig.baselineWindowDays())
                .collect(Collectors.toList());
                
            ZScores zScores = PortfolioAnalyticsFacade.calculateZScores(
                currentMetric,
                baselineMetrics,
                metricsConfig.baselineWindowDays()
            );
            
            enhancedMetrics.add(EnhancedPortfolioMetrics.from(currentMetric, derived, zScores));
        }
        
        log.debug("Enhanced {} portfolio metrics with derived metrics and z-scores", enhancedMetrics.size());
        return enhancedMetrics;
    }

    /**
     * Enhances detail slots by calculating derived metrics for each project.
     *
     * @param detailSlots list of raw detail slots
     * @return list of enhanced detail slots with project-level derived metrics
     */
    private List<EnhancedDetailSlot> enhanceDetailSlots(List<DetailSlot> detailSlots) {
        if (detailSlots == null || detailSlots.isEmpty()) {
            return Collections.emptyList();
        }

        return detailSlots.stream()
            .map(slot -> {
                List<EnhancedProjectMetricsWithId> enhancedProjects = slot.projects().stream()
                    .map(ProjectDerivedCalculator::enhance)
                    .collect(Collectors.toList());
                
                return new EnhancedDetailSlot(slot.date(), slot.heatmap(), enhancedProjects);
            })
            .collect(Collectors.toList());
    }

    /**
     * Updates the project metrics list by combining existing and new data.
     */
    private List<ProjectMetricsWithId> updateProjects(
            List<ProjectMetricsWithId> existingProjects,
            List<ProjectMetricsWithId> newProjects
    ) {
        List<ProjectMetricsWithId> existing = existingProjects == null ? Collections.emptyList() : existingProjects;
        List<ProjectMetricsWithId> news = newProjects == null ? Collections.emptyList() : newProjects;

        Map<Integer, ProjectMetricsWithId> merged = new LinkedHashMap<>();

        // Put existing projects first (preserve their order)
        for (ProjectMetricsWithId p : existing) {
            merged.put(p.id(), p);
        }

        // Merge or append new projects. Single-level nesting inside the loop only.
        for (ProjectMetricsWithId np : news) {
            Integer id = np.id();
            
            ProjectMetricsWithId ep = merged.get(id);
            if (ep == null) {
                merged.put(id, np);
                continue;
            }

            Integer viewTime = safe(ep.viewTime()) + safe(np.viewTime());
            Integer exposures = safe(ep.exposures()) + safe(np.exposures());
            Integer codeViews = safe(ep.codeViews()) + safe(np.codeViews());
            Integer liveViews = safe(ep.liveViews()) + safe(np.liveViews());

            merged.put(id, new ProjectMetricsWithId(id, viewTime, exposures, codeViews, liveViews));
        }

        log.debug("Merged {} existing and {} new projects into {} total projects", existing.size(), news.size(), merged.size());
        return new ArrayList<>(merged.values());
    }

    private static int safe(Integer v) {
        return v == null ? 0 : v;
    }
    
    /**
     * Converts HeatmapSnapshot to PortfolioHeatmap for repository storage.
     * Since HeatmapSnapshot doesn't have Counts, we assume count = 1 for each index (single user visit).
     */
    private PortfolioHeatmap convertToPortfolioHeatmap(HeatmapSnapshot snapshot) {
        // Create counts list with 1 for each index (representing single user visits)
        List<Integer> counts = snapshot.Indexes().stream().map(i -> 1).collect(Collectors.toList());

        return new PortfolioHeatmap(
            snapshot.version(),
            snapshot.columns(),
            snapshot.Indexes(),
            snapshot.Values(),
            counts
        );
    }
}
