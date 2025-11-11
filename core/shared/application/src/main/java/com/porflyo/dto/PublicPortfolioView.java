package com.porflyo.dto;

import java.util.List;

import com.porflyo.model.portfolio.PortfolioSection;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record PublicPortfolioView(
    String portfolioId,             // Used for Metrics
    String createdAt,
    String template,
    String title,
    String description,
    List<PortfolioSection> sections
) { }
