package com.porflyo.utils.facade;

import java.util.List;

import com.porflyo.model.metrics.DerivedMetrics;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ZScores;
import com.porflyo.utils.derived.PortfolioDerivedCalculator;
import com.porflyo.utils.zscore.PortfolioZScoreCalculator;

/**
 * Facade for portfolio analytics calculations.
 * Provides a unified interface for derived metrics and z-scores computation.
 * This simplifies the API for clients and allows for easy replacement of underlying implementations.
 */
public final class PortfolioAnalyticsFacade {

    private PortfolioAnalyticsFacade() {}

    /**
     * Calculates derived metrics for a portfolio day from raw metrics.
     * 
     * @param engagement engagement metrics for the day
     * @param scroll interaction metrics for the day
     * @param cumProjects cumulative project metrics for the day
     * @return calculated derived metrics
     */
    public static DerivedMetrics calculateDerivedMetrics(
            Engagement engagement,
            InteractionMetrics scroll,
            ProjectMetrics cumProjects
    ) {
        return PortfolioDerivedCalculator.calculate(engagement, scroll, cumProjects);
    }

    /**
     * Calculates z-scores for a current day's metrics against a baseline window of previous days.
     * 
     * @param currentMetrics metrics for the current day
     * @param baselineMetrics list of metrics from previous days (including current day)
     * @param windowDays number of days to use for baseline calculation
     * @return calculated z-scores
     */
    public static ZScores calculateZScores(
            PortfolioMetrics currentMetrics,
            List<PortfolioMetrics> baselineMetrics,
            int windowDays
    ) {
        return PortfolioZScoreCalculator.calculate(currentMetrics, baselineMetrics, windowDays);
    }
}