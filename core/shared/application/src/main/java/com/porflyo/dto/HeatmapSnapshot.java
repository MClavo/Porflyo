package com.porflyo.dto;

import java.util.List;

import com.porflyo.model.ids.PortfolioId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record HeatmapSnapshot(
    PortfolioId portfolioId,
    String version,
    Integer columns,
    List<Integer> Indexes,
    List<Integer> Values
) {}
