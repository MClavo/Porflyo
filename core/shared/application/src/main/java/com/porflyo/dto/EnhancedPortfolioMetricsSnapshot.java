package com.porflyo.dto;

import com.porflyo.model.ids.PortfolioId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Enhanced portfolio metrics snapshot that includes computed derived metrics and z-scores.
 * This replaces PortfolioMetricsSnapshot for API responses that need analytics.
 */
@Serdeable
@Introspected
public record EnhancedPortfolioMetricsSnapshot(
    PortfolioId portfolioId,
    EnhancedPortfolioMetrics aggregate,  
    DetailSlot details          // detail slot (heatmap + project metrics)
) {}