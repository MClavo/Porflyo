package com.porflyo.dto;

import com.porflyo.model.portfolio.PortfolioSection;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * DTO for public saved section data returned to clients.
 */
@Serdeable
@Introspected
public record PublicSavedSectionDto(
    String id,
    String name,
    PortfolioSection section,
    Integer version
) {}
