package com.porflyo.model.portfolio;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Serdeable
@Introspected
public record PortfolioItem(
    @NotBlank String sectionType,
    @NotBlank String itemType,
    @NotNull String content,
    List<String> media
) {}