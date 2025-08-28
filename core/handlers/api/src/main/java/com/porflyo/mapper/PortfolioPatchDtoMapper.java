package com.porflyo.mapper;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.ports.input.MediaUseCase;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Mapper for converting request attributes to PortfolioPatchDto.
 */
@Singleton
public class PortfolioPatchDtoMapper {

    private final MediaUseCase mediaUseCase;

    @Inject
    public PortfolioPatchDtoMapper(MediaUseCase mediaUseCase) {
        this.mediaUseCase = mediaUseCase;
    }

    public PortfolioPatchDto toPatch(Map<String, Object> attributes) {
        return new PortfolioPatchDto(
            extractOptionalString(attributes, "template"),
            extractOptionalString(attributes, "title"),
            extractOptionalString(attributes, "description"),
            extractOptionalSectionsWithKeysConversion(attributes, "sections"),
            extractOptionalInteger(attributes, "modelVersion")
        );
    }

    @SuppressWarnings("unchecked")
    private Optional<List<PortfolioSection>> extractOptionalSectionsWithKeysConversion(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        if (value instanceof List) {
            List<PortfolioSection> sections = (List<PortfolioSection>) value;
            List<PortfolioSection> sectionsWithKeys = convertSectionsUrlsToKeys(sections);
            return Optional.of(sectionsWithKeys);
        }
        return Optional.empty();
    }

    private List<PortfolioSection> convertSectionsUrlsToKeys(List<PortfolioSection> sections) {
        if (sections == null) return null;
        
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

    private Optional<String> extractOptionalString(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        return value instanceof String ? Optional.of((String) value) : Optional.empty();
    }

    private Optional<Integer> extractOptionalInteger(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        if (value instanceof Integer) {
            return Optional.of((Integer) value);
        }
        if (value instanceof Number) {
            return Optional.of(((Number) value).intValue());
        }
        return Optional.empty();
    }
}
