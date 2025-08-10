package com.porflyo.domain.model.portfolio;

import java.time.Instant;
import java.util.List;

import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.Slug;
import com.porflyo.domain.model.ids.UserId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Serdeable
@Introspected
public record Portfolio(
    @NotNull @Valid PortfolioId id,
    @NotNull @Valid UserId userId,

    @NotBlank String title,
    String description,
    @NotBlank String template,

    @NotNull @Valid List<PortfolioSection> sections,
    @NotNull List<String> media,

    // Schema version for future data migrations
    @Min(1) int modelVersion,

    // Slug proposed by the user for their public URL. May be null untill publication
    Slug desiredSlug,
    Boolean isPublished,

    @NotNull Instant createdAt,
    @NotNull Instant updatedAt
) {}