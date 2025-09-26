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
import com.porflyo.dto.HeatmapSnapshot;
import com.porflyo.dto.PortfolioMetricsBundle;
import com.porflyo.dto.PortfolioMetricsSnapshot;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.ports.PortfolioMetricsRepository;
import com.porflyo.ports.SlotMetricsRepository;
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
            ProjectMetrics cumProjects){

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
     * Returns aggregate PortfolioMetrics for the last {@code monthsBack} months.
     * Also returns (separately) the detail slots: heatmaps and per-project metrics for each day.
     * The implementation may return the aggregates and slots in separate arrays or as part of a snapshot.
     *
     * @param portfolioId target portfolio
     * @param monthsBack months to go back
     * @return array of aggregate PortfolioMetrics (most-recent first)
     */
    public List<PortfolioMetrics> getPortfolioMetrics(PortfolioId portfolioId, int monthsBack){
        return portfolioMetricsRepository.findPortfolioMetrics(portfolioId, monthsBack);
    }


    /**
     * Returns aggregates for a specific month (monthsBack = 0 means current month).
     */
    public List<PortfolioMetrics> getPortfolioMetricsOneMonth(PortfolioId portfolioId, int monthsBack){
        return portfolioMetricsRepository.findPortfolioMetricsOneMonth(portfolioId, monthsBack);
    }

    /**
     * Returns aggregate PortfolioMetrics for the last {@code monthsBack} months.
     * Also returns (separately) the detail slots: heatmaps and per-project metrics for each day.
     * The implementation may return the aggregates and slots in separate arrays or as part of a snapshot.
     *
     * @param portfolioId target portfolio
     * @param monthsBack months to go back
     * @return array of {@link PortfolioMetrics}, and list of detail slots {@link DetailSlot}, 
     * each containing a heatmap and project metrics for that day
     */
    public PortfolioMetricsBundle getPortfolioMetricsWithSlots(PortfolioId portfolioId, int monthsBack){
        List<PortfolioMetrics> aggregates = portfolioMetricsRepository.findPortfolioMetrics(portfolioId, monthsBack);
        List<DetailSlot> slots = slotMetricsRepository.getAllMetrics(portfolioId);

        return new PortfolioMetricsBundle(portfolioId, aggregates, slots);
    }

    /**
     * Returns today's aggregate and today's details (heatmap + project metrics for today).
     *
     * @param portfolioId target portfolio
     * @return snapshot containing today's aggregate and today's details
     */
    public PortfolioMetricsSnapshot getTodayMetricsWithDetails(PortfolioId portfolioId){
        PortfolioMetrics aggregate = portfolioMetricsRepository.getTodayMetrics(portfolioId).orElse(null);
        DetailSlot details = slotMetricsRepository.getTodayMetrics(portfolioId).orElse(null);

        return new PortfolioMetricsSnapshot(portfolioId, aggregate, details);
    }


    // ────────────────────────── Delete ──────────────────────────

    public void deleteAll(PortfolioId portfolioId){
        portfolioMetricsRepository.deleteAllMetrics(portfolioId);
        slotMetricsRepository.deleteAllMetrics(portfolioId);
    }


    // ────────────────────────── Helpers ──────────────────────────

    /**
     * Updates the project metrics list by combining existing and new data.
     */
    private List<ProjectMetricsWithId> updateProjects(List<ProjectMetricsWithId> existingProjects, List<ProjectMetricsWithId> newProjects) {
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
