package com.porflyo.application.ports.output;

import java.util.List;

import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.SavedSection;

import jakarta.validation.constraints.NotNull;

public interface SavedSectionRepository {

  @NotNull SavedSection save(SavedSection section);

  void delete(UserId userId, SectionId sectionId);

  List<SavedSection> findByUserId(UserId userId);
}