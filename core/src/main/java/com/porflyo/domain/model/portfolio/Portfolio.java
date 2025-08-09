package com.porflyo.domain.model.portfolio;

import java.time.Instant;
import java.util.List;

import com.porflyo.domain.model.ids.ContentBlockId;
import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.Slug;
import com.porflyo.domain.model.ids.UserId;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record Portfolio(
    @NotNull @Valid PortfolioId id,
    @NotNull @Valid UserId ownerId,

    @NotBlank String title,
    String description,

    @NotBlank String templateKey,

    // Ordered block IDs that compose the portfolio
    @NotNull @Valid List<ContentBlockId> blockOrder,

    // Schema version for future data migrations
    @Min(1) int modelVersion,

    // Optional: reserved slug before publishing
    @Valid Slug desiredSlug,

    @NotNull Instant createdAt,
    @NotNull Instant updatedAt
) {}