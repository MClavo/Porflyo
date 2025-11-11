package com.porflyo.mapper;

import java.util.List;

import com.porflyo.dto.PublicSavedSectionDto;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.SavedSection;
import com.porflyo.usecase.MediaUseCase;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Mapper for converting SavedSection domain object to PublicSavedSectionDto.
 */
@Singleton
public class PublicSavedSectionDtoMapper {

    private final MediaUseCase mediaUseCase;

    @Inject
    public PublicSavedSectionDtoMapper(MediaUseCase mediaUseCase) {
        this.mediaUseCase = mediaUseCase;
    }

    public PublicSavedSectionDto toDto(SavedSection savedSection) {
        List<String> mediaUrls = null;
        if (savedSection.section().media() != null) {
            mediaUrls = savedSection.section().media().stream()
                .map(m -> mediaUseCase.resolveUrl(m))
                .toList();
        }

        PortfolioSection sanitizedSection = new PortfolioSection(
            savedSection.section().sectionType(),
            savedSection.section().title(),
            savedSection.section().content(),
            mediaUrls
        );

        return new PublicSavedSectionDto(
            savedSection.id().value(),
            savedSection.name(),
            sanitizedSection,
            savedSection.version()
        );
    }
}
