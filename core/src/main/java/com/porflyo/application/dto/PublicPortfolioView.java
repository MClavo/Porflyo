package com.porflyo.application.dto;

import java.util.List;

import com.porflyo.domain.model.portfolio.PortfolioSection;

public record PublicPortfolioView(
    String portfolioId,             // Used for Metrics
    String template,
    String title,
    String description,
    List<PortfolioSection> sections
) { }
