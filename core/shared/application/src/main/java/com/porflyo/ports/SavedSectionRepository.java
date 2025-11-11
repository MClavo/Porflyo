package com.porflyo.ports;

import java.util.List;

import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.SavedSection;

import jakarta.validation.constraints.NotNull;

public interface SavedSectionRepository {

  @NotNull SavedSection save(SavedSection section);

  List<SavedSection> findByUserId(UserId userId);
  
  SavedSection delete(UserId userId, SectionId sectionId);
}