package com.porflyo.dto;

import java.util.List;

import com.porflyo.model.portfolio.PortfolioSection;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * DTO for public portfolio data returned to clients.
 * Contains non-sensitive information about a portfolio.
 */
@Serdeable
@Introspected
public record PublicPortfolioDto(
    String id,
    String template,
    String title,
    String description,
    List<PortfolioSection> sections,
    List<String> media,
    Integer modelVersion,
    String reservedSlug,
    Boolean isPublished
) {}
