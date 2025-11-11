package com.porflyo.mapper;

import java.util.List;

import com.porflyo.dto.PublicPortfolioDto;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.usecase.MediaUseCase;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Mapper for converting Portfolio domain object to PublicPortfolioDto.
 */
@Singleton
public class PublicPortfolioDtoMapper {

    private final MediaUseCase mediaUseCase;

    @Inject
    public PublicPortfolioDtoMapper(MediaUseCase mediaUseCase) {
        this.mediaUseCase = mediaUseCase;
    }

    public PublicPortfolioDto toDto(Portfolio portfolio) {
        return new PublicPortfolioDto(
            portfolio.id().value(),
            portfolio.template(),
            portfolio.title(),
            portfolio.description(),
            convertSectionsKeysToUrls(portfolio.sections()),
            convertKeysToUrls(portfolio.media()),
            portfolio.modelVersion(),
            portfolio.reservedSlug() != null ? portfolio.reservedSlug().value() : null,
            portfolio.isPublished()
        );
    }

    private List<PortfolioSection> convertSectionsKeysToUrls(List<PortfolioSection> sections) {
        if (sections == null) return null;
        
        return sections.stream()
                .map(this::convertSectionKeysToUrls)
                .toList();
    }

    private PortfolioSection convertSectionKeysToUrls(PortfolioSection section) {
        return new PortfolioSection(
            section.sectionType(),
            section.title(),
            section.content(),
            convertKeysToUrls(section.media())
        );
    }

    private List<String> convertKeysToUrls(List<String> keys) {
        if (keys == null) return null;
        
        return keys.stream()
                .map(key -> key != null ? mediaUseCase.resolveUrl(key) : null)
                .toList();
    }
}
