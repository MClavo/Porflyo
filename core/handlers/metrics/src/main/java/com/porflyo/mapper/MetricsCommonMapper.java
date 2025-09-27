package com.porflyo.mapper;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import com.porflyo.dto.common.BaselineDto;
import com.porflyo.dto.common.MetaDto;
import com.porflyo.dto.common.UnitsDto;
import com.porflyo.model.metrics.ZScores;

import jakarta.inject.Singleton;

/**
 * Mapper for common metadata and utility methods.
 */
@Singleton
public class MetricsCommonMapper {
    
    private static final String CALC_VERSION = "2025.09.26-r1";
    private static final String TIMEZONE = "Europe/Madrid";
    private static final String TIME_BASE = "ds";
    private static final String DISPLAY_TIME = "ms";

    /**
     * Creates common metadata for all metric responses.
     */
    public MetaDto createMeta(Integer baselineWindowDays) {
        String generatedAt = ZonedDateTime.now(ZoneId.of(TIMEZONE))
            .format(DateTimeFormatter.ISO_INSTANT);
            
        return new MetaDto(
            CALC_VERSION,
            generatedAt,
            TIMEZONE,
            new UnitsDto(TIME_BASE, DISPLAY_TIME),
            new BaselineDto(baselineWindowDays)
        );
    }

    /**
     * Formats LocalDate to string.
     */
    public String formatDate(LocalDate date) {
        return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    /**
     * Maps ZScores to Map<String, Double>.
     */
    public Map<String, Double> mapZScores(ZScores zScores) {
        if (zScores == null) {
            return new HashMap<>();
        }
        
        Map<String, Double> result = new HashMap<>();
        if (zScores.visits() != null) result.put("visits", zScores.visits());
        if (zScores.engagement() != null) result.put("engagement", zScores.engagement());
        if (zScores.ttfi() != null) result.put("ttfi", zScores.ttfi());
        
        return result;
    }
}