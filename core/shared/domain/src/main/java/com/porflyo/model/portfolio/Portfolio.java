package com.porflyo.model.portfolio;

import java.util.List;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;

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
    
    @NotBlank String template,
    String title,
    String description,
    @NotNull @Valid List<PortfolioSection> sections,
    @NotNull List<String> media,

    // Schema version for future data migrations
    @Min(1) Integer modelVersion,

    // Slug reserved by the user for their public URL. May be null untill publication
    Slug reservedSlug,
    Boolean isPublished
) {}