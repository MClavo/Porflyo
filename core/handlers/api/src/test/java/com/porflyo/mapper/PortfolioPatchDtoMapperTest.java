package com.porflyo.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.model.portfolio.PortfolioSection;

@DisplayName("PortfolioPatchDtoMapper (unit)")
class PortfolioPatchDtoMapperTest {

    @Test
    @DisplayName("should map attributes to patch dto when all fields present")
    void should_map_attributes_to_patch_dto_when_all_fields_present() {
        // given
        PortfolioSection section = new PortfolioSection("about", "About Me", "I am a developer", List.of());
        Map<String, Object> attributes = Map.of(
            "template", "modern",
            "title", "Updated Title",
            "description", "Updated description",
            "sections", List.of(section),
            "modelVersion", 2
        );

        // when
        PortfolioPatchDto patch = PortfolioPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(patch.template()).isPresent();
        assertThat(patch.template().get()).isEqualTo("modern");
        assertThat(patch.title()).isPresent();
        assertThat(patch.title().get()).isEqualTo("Updated Title");
        assertThat(patch.description()).isPresent();
        assertThat(patch.description().get()).isEqualTo("Updated description");
        assertThat(patch.sections()).isPresent();
        assertThat(patch.sections().get()).hasSize(1);
        assertThat(patch.modelVersion()).isPresent();
        assertThat(patch.modelVersion().get()).isEqualTo(2);
    }

    @Test
    @DisplayName("should map attributes to patch dto when partial fields present")
    void should_map_attributes_to_patch_dto_when_partial_fields_present() {
        // given
        Map<String, Object> attributes = Map.of(
            "title", "Updated Title",
            "description", "Updated description"
        );

        // when
        PortfolioPatchDto patch = PortfolioPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(patch.template()).isEmpty();
        assertThat(patch.title()).isPresent();
        assertThat(patch.title().get()).isEqualTo("Updated Title");
        assertThat(patch.description()).isPresent();
        assertThat(patch.description().get()).isEqualTo("Updated description");
        assertThat(patch.sections()).isEmpty();
        assertThat(patch.modelVersion()).isEmpty();
    }

    @Test
    @DisplayName("should map attributes to patch dto when empty map")
    void should_map_attributes_to_patch_dto_when_empty_map() {
        // given
        Map<String, Object> attributes = Map.of();

        // when
        PortfolioPatchDto patch = PortfolioPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(patch.template()).isEmpty();
        assertThat(patch.title()).isEmpty();
        assertThat(patch.description()).isEmpty();
        assertThat(patch.sections()).isEmpty();
        assertThat(patch.modelVersion()).isEmpty();
    }

    @Test
    @DisplayName("should handle number types for model version")
    void should_handle_number_types_for_model_version() {
        // given
        Map<String, Object> attributes = Map.of(
            "modelVersion", 3.0 // Double instead of Integer
        );

        // when
        PortfolioPatchDto patch = PortfolioPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(patch.modelVersion()).isPresent();
        assertThat(patch.modelVersion().get()).isEqualTo(3);
    }

    @Test
    @DisplayName("should ignore invalid types for fields")
    void should_ignore_invalid_types_for_fields() {
        // given
        Map<String, Object> attributes = Map.of(
            "title", 123, // Integer instead of String
            "modelVersion", "invalid", // String instead of Number
            "sections", "not a list" // String instead of List
        );

        // when
        PortfolioPatchDto patch = PortfolioPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(patch.title()).isEmpty();
        assertThat(patch.modelVersion()).isEmpty();
        assertThat(patch.sections()).isEmpty();
    }
}
