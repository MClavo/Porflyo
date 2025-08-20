package com.porflyo.dto;

import java.util.List;

import com.porflyo.model.portfolio.PortfolioSection;

public record PublicPortfolioView(
    String portfolioId,             // Used for Metrics
    String template,
    String title,
    String description,
    List<PortfolioSection> sections
) { }
