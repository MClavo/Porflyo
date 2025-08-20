package com.porflyo.mapper;

import java.util.Map;
import java.util.Optional;

import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.model.portfolio.PortfolioSection;

import java.util.List;

/**
 * Static mapper for converting request attributes to PortfolioPatchDto.
 */
public class PortfolioPatchDtoMapper {

    public static PortfolioPatchDto toPatch(Map<String, Object> attributes) {
        return new PortfolioPatchDto(
            extractOptionalString(attributes, "template"),
            extractOptionalString(attributes, "title"),
            extractOptionalString(attributes, "description"),
            extractOptionalSections(attributes, "sections"),
            extractOptionalInteger(attributes, "modelVersion")
        );
    }

    @SuppressWarnings("unchecked")
    private static Optional<List<PortfolioSection>> extractOptionalSections(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        if (value instanceof List) {
            return Optional.of((List<PortfolioSection>) value);
        }
        return Optional.empty();
    }

    private static Optional<String> extractOptionalString(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        return value instanceof String ? Optional.of((String) value) : Optional.empty();
    }

    private static Optional<Integer> extractOptionalInteger(Map<String, Object> attributes, String key) {
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
