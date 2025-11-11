package com.porflyo.ports;

import java.util.List;
import java.util.Optional;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioMetrics;

/**
 * Repository interface for managing {@link PortfolioMetrics} entities.
 * <p>
 * Provides methods to save, retrieve, and delete portfolio metrics data,
 * supporting operations such as storing today's metrics, fetching historical
 * metrics over a specified period.
 *
 */
public interface PortfolioMetricsRepository {
    
    /**
     * Saves the given PortfolioMetrics for today.
     * If metrics for today already exist, they will be overwritten.
     * 
     * @param metrics The PortfolioMetrics to save.
     */
    void saveTodayMetrics(PortfolioMetrics metrics);
    
    /**
     * Retrieves portfolio metrics for the given portfolio ID over the past specified months.
     * 
     * @param portfolioId The ID of the portfolio.
     * @param monthsBack The number of months back to retrieve metrics for.
     * @return A list of PortfolioMetrics.
     */
    List<PortfolioMetrics> findPortfolioMetrics(PortfolioId portfolioId, int monthsBack);

    /**
     * Retrieves one month of portfolio metrics for the given portfolio ID over the past specified months.
     * 
     * @param portfolioId The ID of the portfolio.
     * @param monthsBack The number of months back to retrieve metrics for.
     * @return A list of PortfolioMetrics for one month.
     */
    List<PortfolioMetrics> findPortfolioMetricsOneMonth(PortfolioId portfolioId, int monthsBack);

    
    /**
     * Retrieves the portfolio metrics for the current day.
     *
     * @param portfolioId the unique identifier of the portfolio
     * @return an {@link Optional} containing the {@link PortfolioMetrics} for today if available, or an empty {@link Optional} if not found
     */
    Optional<PortfolioMetrics> getTodayMetrics(PortfolioId portfolioId);


    /**
     * Deletes all metrics associated with the specified portfolio ID.
     * 
     * @param portfolioId The ID of the portfolio whose metrics are to be deleted.
     */
    void deleteAllMetrics(PortfolioId portfolioId);
}
