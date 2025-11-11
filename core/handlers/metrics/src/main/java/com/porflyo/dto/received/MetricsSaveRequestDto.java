package com.porflyo.dto.received;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for saving portfolio metrics.
 * Maps to the JSON structure received from the frontend.
 */
@Serdeable
@Introspected
public record MetricsSaveRequestDto(
    @NotBlank String portfolioId,
    @NotNull Integer activeTimeMs,
    @NotNull Integer tffiMs,
    @NotNull Boolean isMobile,
    @NotNull Boolean emailCopied,
    @NotNull Integer socialClicks,
    @NotNull @Valid List<ProjectMetricDto> projectMetrics,
    @NotNull @Valid ScrollMetricDto scrollMetrics,
    @NotNull @Valid HeatmapDataDto heatmapData
) {}
