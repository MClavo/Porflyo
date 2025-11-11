package com.porflyo.dto;

import java.time.LocalDate;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.DerivedMetrics;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ZScores;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Enhanced portfolio metrics that includes raw metrics, derived metrics, and z-scores.
 * This is used for API responses that need computed analytics.
 */
@Serdeable
@Introspected
public record EnhancedPortfolioMetrics(
    PortfolioId portfolioId,
    LocalDate date,
    Engagement engagement,
    InteractionMetrics scroll,
    ProjectMetrics cumProjects,
    DerivedMetrics derived,
    ZScores zScores
) {
    /**
     * Creates an enhanced metrics from base portfolio metrics and computed analytics.
     */
    public static EnhancedPortfolioMetrics from(
            PortfolioMetrics baseMetrics,
            DerivedMetrics derived,
            ZScores zScores
    ) {
        return new EnhancedPortfolioMetrics(
            baseMetrics.portfolioId(),
            baseMetrics.date(),
            baseMetrics.engagement(),
            baseMetrics.scroll(),
            baseMetrics.cumProjects(),
            derived,
            zScores
        );
    }
}