package com.porflyo.dto;

import com.porflyo.model.portfolio.PortfolioSection;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating a new saved section.
 */
@Serdeable
@Introspected
public record SavedSectionCreateDto(
    @NotBlank String name,
    @NotNull @Valid PortfolioSection section
) {}
