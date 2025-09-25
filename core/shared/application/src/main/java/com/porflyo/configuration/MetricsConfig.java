package com.porflyo.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;

@ConfigurationProperties("metrics")
public record MetricsConfig(
    int heatmapCellCount
) {}
