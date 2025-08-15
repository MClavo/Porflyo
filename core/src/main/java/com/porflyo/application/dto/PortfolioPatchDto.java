package com.porflyo.application.dto;

import java.util.List;
import java.util.Optional;

import com.porflyo.domain.model.portfolio.PortfolioSection;

/**
 * PatchPortfolioDto is used to update an existing portfolio.
 * It contains fields that can be modified, such as title, description, sections, and media.
 */
public record PortfolioPatchDto(
    Optional<String> template,
    Optional<String> title,
    Optional<String> description,
    Optional<List<PortfolioSection>> sections,
    Optional<Integer> modelVersion
) {}
