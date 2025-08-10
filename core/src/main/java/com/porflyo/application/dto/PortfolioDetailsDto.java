package com.porflyo.application.dto;

import java.time.Instant;
import java.util.List;

import com.porflyo.domain.model.portfolio.PortfolioSection;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * PatchPortfolioDto is used to update an existing portfolio.
 * It contains fields that can be modified, such as title, description, sections, and media.
 */
public record PortfolioDetailsDto(
    @NotBlank String template,
    @Nullable String title,
    @Nullable String description,
    @Nullable List<PortfolioSection> sections,
    @Nullable List<String> media,
    @Nullable @Min(1) int modelVersion,
    @NotNull Instant timestamp
) {}
