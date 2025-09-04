package com.porflyo.dto;

import java.util.List;

import com.porflyo.model.portfolio.PortfolioSection;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating a new portfolio draft.
 */
@Serdeable
@Introspected
public record PortfolioCreateDto(
    @NotBlank String template,
    String title,
    String description,
    @NotNull @Valid List<PortfolioSection> sections
) {}
