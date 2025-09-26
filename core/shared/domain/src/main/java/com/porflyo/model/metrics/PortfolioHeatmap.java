package com.porflyo.model.metrics;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record PortfolioHeatmap(
    String version,
    Integer columns,
    List<Integer> Indexes,
    List<Integer> Values,
    List<Integer> Counts
) {}
