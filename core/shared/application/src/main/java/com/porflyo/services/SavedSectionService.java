package com.porflyo.services;

import java.util.List;

import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.SavedSection;
import com.porflyo.ports.input.MediaUseCase;
import com.porflyo.ports.input.SavedSectionUseCase;
import com.porflyo.ports.output.MediaCountRepository;
import com.porflyo.ports.output.QuotaRepository;
import com.porflyo.ports.output.SavedSectionRepository;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class SavedSectionService implements SavedSectionUseCase {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SavedSectionService.class);

    private final MediaCountRepository mediaCountRepository;
    private final MediaUseCase mediaUseCase;
    private final SavedSectionRepository sRepository;
    private final QuotaRepository quotaRepository;

    @Inject
    public SavedSectionService(MediaCountRepository mediaCountRepository, MediaUseCase mediaUseCase, SavedSectionRepository savedSectionRepository, QuotaRepository quotaRepository) {
        this.mediaCountRepository = mediaCountRepository;
        this.mediaUseCase = mediaUseCase;
        this.sRepository = savedSectionRepository;
        this.quotaRepository = quotaRepository;
    }

    @Override
    public SavedSection create(UserId userId, String name, PortfolioSection section) { 
        List<String> sectionMediaKeys = section.media().stream()
            .map(mediaUseCase::extractKeyFromUrl)
            .filter(key -> key != null && !key.trim().isEmpty()) // Filter out null and empty keys
            .toList();

        log.debug("Extracted media keys for user {}: {}", userId.value(), sectionMediaKeys);

        mediaCountRepository.increment(userId, sectionMediaKeys);

        PortfolioSection sanitizedSection = new PortfolioSection(
            section.sectionType(),
            section.title(),
            section.content(),
            sectionMediaKeys
        );

        SavedSection savedSection = new SavedSection(
            SectionId.newKsuid(),
            userId,
            name,
            sanitizedSection,
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
