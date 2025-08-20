package com.porflyo.services;

import java.util.List;

import com.porflyo.ports.input.SavedSectionUseCase;
import com.porflyo.ports.output.SavedSectionRepository;
import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.SavedSection;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
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
