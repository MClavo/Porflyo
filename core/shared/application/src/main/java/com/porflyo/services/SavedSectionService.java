package com.porflyo.services;

import java.util.List;

import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.SavedSection;
import com.porflyo.ports.input.SavedSectionUseCase;
import com.porflyo.ports.output.MediaCountRepository;
import com.porflyo.ports.output.QuotaRepository;
import com.porflyo.ports.output.SavedSectionRepository;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class SavedSectionService implements SavedSectionUseCase {

    private final MediaCountRepository mediaCountRepository;
    private final SavedSectionRepository sRepository;
    private final QuotaRepository quotaRepository;

    @Inject
    public SavedSectionService(MediaCountRepository mediaCountRepository, SavedSectionRepository savedSectionRepository, QuotaRepository quotaRepository) {
        this.mediaCountRepository = mediaCountRepository;
        this.sRepository = savedSectionRepository;
        this.quotaRepository = quotaRepository;
    }

    @Override
    public SavedSection create(UserId userId, String name, PortfolioSection section) { 
        mediaCountRepository.increment(userId, section.media());
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
        SavedSection deletedSection = sRepository.delete(userId, sectionId);
        mediaCountRepository.decrementAndReturnDeletables(userId, deletedSection.section().media());
        quotaRepository.updateSavedSectionCount(userId, -1);
    }

    @Override
    public List<SavedSection> listByOwner(UserId userId) { 
        return sRepository.findByUserId(userId);
    }

}
