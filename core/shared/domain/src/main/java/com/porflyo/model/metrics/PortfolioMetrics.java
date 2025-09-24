package com.porflyo.model.metrics;

import java.time.LocalDate;

import com.porflyo.model.ids.PortfolioId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record PortfolioMetrics(
    PortfolioId portfolioId,
    LocalDate date,
    Engagement engagement,
    ScrollMetrics scroll,
    ProjectMetrics cumProjects
) {}
