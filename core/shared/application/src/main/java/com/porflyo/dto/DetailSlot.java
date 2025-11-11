package com.porflyo.dto;

import java.time.LocalDate;
import java.util.List;

import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.ProjectMetricsWithId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record DetailSlot(
    LocalDate date,
    PortfolioHeatmap heatmap,
    List<ProjectMetricsWithId> projects
) {}
