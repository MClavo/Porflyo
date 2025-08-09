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
    @NotNull @Valid UserId userId,

    @NotBlank String title,
    String description,
    @NotBlank String template,

    // Ordered block IDs that compose the portfolio
    @NotNull @Valid List<ContentBlockId> blockOrder,

    // Schema version for future data migrations
    @Min(1) int modelVersion,

    // Slug proposed by the user for their public URL. May be null untill publication
    @Valid Slug desiredSlug,

    @NotNull Instant createdAt,
    @NotNull Instant updatedAt
) {
    public Portfolio {
        // Normalise null collections to empty to avoid NPE in callers.
        if (blockOrder == null) {
            throw new IllegalArgumentException("blockOrder cannot be null");
        }
        // Ensure an immutable copy for safety. The actual implementation can
        // decide whether to wrap or copy; List.copyOf avoids accidental
        // modification.
        blockOrder = List.copyOf(blockOrder);
    }

}