package com.porflyo.dto;

import java.time.LocalDate;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioMetrics;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record PortfolioMetricsSnapshot(
    PortfolioId portfolioId,
    LocalDate date,
    PortfolioMetrics aggregate,
    DetailSlot todaySlot
) {}