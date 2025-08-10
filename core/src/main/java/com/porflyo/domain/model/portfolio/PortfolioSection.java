package com.porflyo.domain.model.portfolio;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Serdeable
@Introspected
public record PortfolioSection(
  @NotBlank String sectionType,
  @NotNull Object content,
  List<String> media
){}