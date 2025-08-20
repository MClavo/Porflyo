package com.porflyo.ports.input;

import java.util.List;

import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.SavedSection;


public interface SavedSectionUseCase {
    
    /**
     * Creates and saves a section.
     */
    SavedSection create(UserId userId, String name, PortfolioSection section);
  
    void delete(UserId userId, SectionId sectionId);

    List<SavedSection> listByOwner(UserId userId);
}
