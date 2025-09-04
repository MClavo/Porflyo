package com.porflyo.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.porflyo.dto.PortfolioCreateDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.usecase.MediaUseCase;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Mapper for converting PortfolioCreateDto to Portfolio domain object.
 */
@Singleton
public class PortfolioCreateDtoMapper {

    private final MediaUseCase mediaUseCase;

    @Inject
    public PortfolioCreateDtoMapper(MediaUseCase mediaUseCase) {
        this.mediaUseCase = mediaUseCase;
    }

    public Portfolio toDomain(PortfolioCreateDto dto, UserId userId) {
        List<PortfolioSection> sectionsWithKeys = convertSectionsUrlsToKeys(dto.sections());
        
        return new Portfolio(
            new PortfolioId(UUID.randomUUID().toString()),
            userId,
            dto.template(),
            dto.title(),
            dto.description(),
            sectionsWithKeys,
            new ArrayList<>(), // Empty media list for new portfolios
            1, // Model version
            null, // No reserved slug initially
            false // Not published initially
        );
    }

    private List<PortfolioSection> convertSectionsUrlsToKeys(List<PortfolioSection> sections) {
        if (sections == null) return new ArrayList<>();
        
        return sections.stream()
                .map(this::convertSectionUrlsToKeys)
                .toList();
    }

    private PortfolioSection convertSectionUrlsToKeys(PortfolioSection section) {
        return new PortfolioSection(
            section.sectionType(),
            section.title(),
            section.content(),
            convertUrlsToKeys(section.media())
        );
    }

    private List<String> convertUrlsToKeys(List<String> urls) {
        if (urls == null) return null;
        
        return urls.stream()
                .map(url -> url != null ? mediaUseCase.extractKeyFromUrl(url) : null)
                .toList();
    }
}
