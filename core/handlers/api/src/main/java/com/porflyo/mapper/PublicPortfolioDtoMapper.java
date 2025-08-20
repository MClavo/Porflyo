package com.porflyo.mapper;

import com.porflyo.dto.PublicPortfolioDto;
import com.porflyo.model.portfolio.Portfolio;

import jakarta.inject.Singleton;

/**
 * Mapper for converting Portfolio domain object to PublicPortfolioDto.
 */
@Singleton
public class PublicPortfolioDtoMapper {

    public PublicPortfolioDto toDto(Portfolio portfolio) {
        return new PublicPortfolioDto(
            portfolio.id().value(),
            portfolio.template(),
            portfolio.title(),
            portfolio.description(),
            portfolio.sections(),
            portfolio.media(),
            portfolio.modelVersion(),
            portfolio.reservedSlug() != null ? portfolio.reservedSlug().value() : null,
            portfolio.isPublished()
        );
    }
}
