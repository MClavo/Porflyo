package com.porflyo.mapper;

import java.util.ArrayList;
import java.util.UUID;

import com.porflyo.dto.PortfolioCreateDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;

import jakarta.inject.Singleton;

/**
 * Mapper for converting PortfolioCreateDto to Portfolio domain object.
 */
@Singleton
public class PortfolioCreateDtoMapper {

    public Portfolio toDomain(PortfolioCreateDto dto, UserId userId) {
        return new Portfolio(
            new PortfolioId(UUID.randomUUID().toString()),
            userId,
            dto.template(),
            dto.title(),
            dto.description(),
            dto.sections() != null ? dto.sections() : new ArrayList<>(),
            new ArrayList<>(), // Empty media list for new portfolios
            1, // Model version
            null, // No reserved slug initially
            false // Not published initially
        );
    }
}
