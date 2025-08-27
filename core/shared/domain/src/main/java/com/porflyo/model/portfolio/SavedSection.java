package com.porflyo.model.portfolio;

import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


/**
 * Represents an item in a user's portfolio rather than a full section.
 * <p>
 * This change gives users more value by allowing them to save specific items within a section,
 * rather than the entire section itself.
 * <p>
 * {@link PortfolioSection} is not used to represent a full saved section. Instead,
 * it represents a specific item within a section that a user has chosen to save.
 * {@link PortfolioSection#title()} represents the type of item is being saved.
 * <p>
 * This is a technical debt issue that needs to be addressed in the future.
 */
@Serdeable
@Introspected
public record SavedSection(
    @NotNull SectionId id,
    @NotNull UserId userId,
    @NotBlank String name,
    @NotNull PortfolioSection section,
    @Min(1) Integer version
) {}