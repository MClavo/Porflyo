package com.porflyo.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.porflyo.domain.model.portfolio.PortfolioSection;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * PatchPortfolioDto is used to update an existing portfolio.
 * It contains fields that can be modified, such as title, description, sections, and media.
 */
public record PortfolioDetailsDto(
    Optional<String> template,
    Optional<String> title,
    Optional<String> description,
    Optional<List<PortfolioSection>> sections,
    Optional<List<String>> media,
    Optional<@Min(1) Integer> modelVersion,
    @NotNull Instant timestamp
) {}
