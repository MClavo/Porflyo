package com.porflyo.services;

import java.util.List;

import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.SavedSection;
import com.porflyo.ports.input.SavedSectionUseCase;
import com.porflyo.ports.output.QuotaRepository;
import com.porflyo.ports.output.SavedSectionRepository;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class SavedSectionService implements SavedSectionUseCase {

    private final SavedSectionRepository sRepository;
    private final QuotaRepository quotaRepository;

    @Inject
    public SavedSectionService(SavedSectionRepository savedSectionRepository, QuotaRepository quotaRepository) {
        this.sRepository = savedSectionRepository;
        this.quotaRepository = quotaRepository;
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

        quotaRepository.updateSavedSectionCount(userId, 1);
        return sRepository.save(savedSection);
    }

    @Override
    public void delete(UserId userId, SectionId sectionId) {
        quotaRepository.updateSavedSectionCount(userId, -1);
        sRepository.delete(userId, sectionId);
    }

    @Override
    public List<SavedSection> listByOwner(UserId userId) { 
        return sRepository.findByUserId(userId);
    }

}
