package com.porflyo.application.ports.input;

import java.util.List;

import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.PortfolioSection;
import com.porflyo.domain.model.portfolio.SavedSection;


public interface SavedSectionUseCase {
    
    /**
     * Creates and saves a section.
     */
    SavedSection create(UserId userId, String name, PortfolioSection section);
  
    void delete(UserId userId, SectionId sectionId);

    List<SavedSection> listByOwner(UserId userId);
}
