package com.porflyo.mapper;

import com.porflyo.dto.PublicSavedSectionDto;
import com.porflyo.model.portfolio.SavedSection;

import jakarta.inject.Singleton;

/**
 * Mapper for converting SavedSection domain object to PublicSavedSectionDto.
 */
@Singleton
public class PublicSavedSectionDtoMapper {

    public PublicSavedSectionDto toDto(SavedSection savedSection) {
        return new PublicSavedSectionDto(
            savedSection.id().value(),
            savedSection.name(),
            savedSection.section(),
            savedSection.version()
        );
    }
}
