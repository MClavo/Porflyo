package com.porflyo.application.services;

import java.util.List;

import com.porflyo.application.ports.input.SavedSectionUseCase;
import com.porflyo.application.ports.output.SavedSectionRepository;
import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.PortfolioSection;
import com.porflyo.domain.model.portfolio.SavedSection;

import jakarta.inject.Inject;

public class SavedSectionService implements SavedSectionUseCase {

    private final SavedSectionRepository sRepository;

    @Inject
    public SavedSectionService(SavedSectionRepository savedSectionRepository) {
        this.sRepository = savedSectionRepository;
    }

    @Override
    public SavedSection create(UserId userId, String name, PortfolioSection section) { 
       SavedSection savedSection = new SavedSection(
            SectionId.newKsuid(),
            userId,
            name,
            section,
            1
        );

        return sRepository.save(savedSection);
    }

    @Override
    public void delete(UserId userId, SectionId sectionId) { 
        sRepository.delete(userId, sectionId);
    }

    @Override
    public List<SavedSection> listByOwner(UserId userId) { 
        return sRepository.findByUserId(userId);
    }

}
