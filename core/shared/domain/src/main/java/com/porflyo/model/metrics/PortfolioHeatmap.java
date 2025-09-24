package com.porflyo.model.metrics;

import java.time.LocalDate;

import com.porflyo.model.ids.PortfolioId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record PortfolioHeatmap(
    PortfolioId portfolioId,
    LocalDate date,
    String version,
    Integer columns,
    Integer rows,
    Integer[] Indexes,
    Integer[] Values,
    Integer[] Counts
) {}
