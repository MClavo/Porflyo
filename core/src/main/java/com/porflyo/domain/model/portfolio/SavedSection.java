package com.porflyo.domain.model.portfolio;

import java.time.Instant;
import java.util.List;

import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.ids.UserId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Serdeable
@Introspected
public record SavedSection(
  @NotNull SectionId id,
  @NotNull UserId userId,
  @NotBlank String sectionType,
  @NotBlank String title,
  @NotNull Object content,
  List<String> media,
  @Min(1) int version,
  @NotNull Instant createdAt,
  @NotNull Instant updatedAt
) {}