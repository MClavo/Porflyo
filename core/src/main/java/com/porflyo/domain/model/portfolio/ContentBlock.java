package com.porflyo.domain.model.portfolio;

import java.util.List;

import com.porflyo.domain.model.ids.ContentBlockId;
import com.porflyo.domain.model.ids.MediaKey;
import com.porflyo.domain.model.ids.UserId;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ContentBlock(
    @NotNull @Valid ContentBlockId id,
    @NotNull @Valid UserId userId,
    @NotNull String type,               // Delegate to the frontend to handle
    @NotNull Object content,            // Keep compact; Micronaut serde can handle Map/String
    List<@Valid MediaKey> mediaKeys,    // Keep track what to delete
    @Min(1) int version,                // block versioning
    @NotNull String createdAt,
    @NotNull String updatedAt
) {}

