package com.porflyo.dto;

import java.time.LocalDate;
import java.util.List;

import com.porflyo.model.metrics.PortfolioHeatmap;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Enhanced detail slot that includes project metrics with derived analytics.
 * This extends the basic DetailSlot with computed project-level metrics.
 */
@Serdeable
@Introspected
public record EnhancedDetailSlot(
    LocalDate date,
    PortfolioHeatmap heatmap,
    List<EnhancedProjectMetricsWithId> projects
) {}