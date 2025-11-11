package com.porflyo.dto;

import java.util.List;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioMetrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record PortfolioMetricsBundle(
    PortfolioId portfolioId,
    List<PortfolioMetrics> aggregates,  
    List<DetailSlot> slots          // detail slots (heatmap + project metrics)
) {}
