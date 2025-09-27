package com.porflyo.dto;

import java.util.List;

import com.porflyo.model.ids.PortfolioId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Enhanced portfolio metrics bundle that includes computed derived metrics and z-scores.
 * This replaces PortfolioMetricsBundle for API responses that need analytics.
 */
@Serdeable
@Introspected
public record EnhancedPortfolioMetricsBundle(
    PortfolioId portfolioId,
    List<EnhancedPortfolioMetrics> aggregates,  
    List<DetailSlot> slots          // detail slots (heatmap + project metrics)
) {}