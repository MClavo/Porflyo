package com.porflyo.ports;

import java.time.LocalDate;
import java.util.List;

import com.porflyo.dto.DetailSlot;
import com.porflyo.dto.PortfolioMetricsBundle;
import com.porflyo.dto.PortfolioMetricsSnapshot;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;

public interface MetricsRepository {

    /**
     * Returns aggregate PortfolioMetrics for the last {@code monthsBack} months.
     * Also returns (separately) the detail slots: heatmaps and per-project metrics for each day.
     * The implementation may return the aggregates and slots in separate arrays or as part of a snapshot.
     *
     * @param portfolioId target portfolio
     * @param monthsBack months to go back
     * @return array of aggregate PortfolioMetrics (most-recent first)
     */
    PortfolioMetrics[] getPortfolioMetrics(PortfolioId portfolioId, int monthsBack);


    /**
     * Returns aggregates for a specific month (monthsBack = 0 means current month).
     */
    PortfolioMetrics[] getPortfolioMetricsOneMonth(PortfolioId portfolioId, int monthsBack);

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
    PortfolioMetricsBundle getPortfolioMetricsWithSlots(PortfolioId portfolioId, int monthsBack);

    /**
     * Returns today's aggregate and today's details (heatmap + project metrics for today).
     *
     * @param portfolioId target portfolio
     * @param today current date
     * @return snapshot containing today's aggregate and today's details
     */
    PortfolioMetricsSnapshot getTodayMetricsWithDetails(PortfolioId portfolioId, LocalDate today);


    /**
     * Returns today's details (heatmap + project metrics for today).
     *
     * @param portfolioId target portfolio
     * @return today's detail slot, or null if not found
     */
    DetailSlot getTodayDetailSlot(PortfolioId portfolioId);


    /**
     * Save today's details (one heatmap and the list of project metrics for today).
     * The repository implementation is responsible for rotating the 10 slots and compacting storage.
     *
     * @param portfolioId target portfolio
     * @param heatmap today's heatmap
     * @param projectMetricsForToday list of project metrics for today
     * @return the saved detail slot
     */
    DetailSlot saveTodayDetailSlot(
        PortfolioId portfolioId,
        PortfolioHeatmap heatmap,
        List<ProjectMetricsWithId> projectMetricsForToday
    );

    /**
     * Upsert the aggregate PortfolioMetrics for today.
     * The repository implementation is responsible for creating or updating the record as needed.
     *
     * @param portfolioId target portfolio
     * @param aggregate today's aggregate metrics
     */
    void upsertTodayPortfolioMetrics(
        PortfolioId portfolioId,
        PortfolioMetrics aggregate
    );


    void deleteAll(PortfolioId portfolioId);
}
