package com.porflyo.ports;

import java.util.List;
import java.util.Optional;

import com.porflyo.dto.DetailSlot;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.ProjectMetricsWithId;

/**
 *Repository interface for managing {@link PortfolioHeatmap} and
 * {@link ProjectMetricsWithId} entities.
 * <p>
 * Provides methods to save, retrieve, and delete today's metrics as well as all stored metrics
 * for a given portfolio.
 *
 */
public interface SlotMetricsRepository {

    /**
     * Saves today's metrics: heatmap and per-project metrics for today.
     *
     * @param heatmap today's heatmap
     * @param projects today's per-project metrics
     */
    void saveTodayMetrics(
        PortfolioId portfolioId,
        PortfolioHeatmap heatmap,
        List<ProjectMetricsWithId> projects);

    /**
     * Retrieves all stored metrics (detail slots) for the given portfolio ID.
     *
     * @param portfolioId the unique identifier of the portfolio
     * @return a list of {@link DetailSlot} containing all stored metrics for the portfolio
     */
    List<DetailSlot> getAllMetrics(PortfolioId portfolioId);

    /**
     * Retrieves today's metrics (detail slot) for the given portfolio ID.
     *
     * @param portfolioId the unique identifier of the portfolio
     * @return an {@link Optional} containing the {@link DetailSlot} for today if available, or an empty {@link Optional} if not found
     */
    Optional<DetailSlot> getTodayMetrics(PortfolioId portfolioId);

    /**
     * Deletes all metrics associated with the specified portfolio ID.
     * 
     * @param portfolioId The ID of the portfolio whose metrics are to be deleted.
     */
    void deleteAllMetrics(PortfolioId portfolioId);

}
