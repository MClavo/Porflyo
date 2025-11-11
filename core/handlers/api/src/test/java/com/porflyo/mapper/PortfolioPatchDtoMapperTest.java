package com.porflyo.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.usecase.MediaUseCase;

@DisplayName("PortfolioPatchDtoMapper (unit)")
class PortfolioPatchDtoMapperTest {

    private MediaUseCase mediaUseCase;
    private PortfolioPatchDtoMapper mapper;

    @BeforeEach
    void setUp() {
        mediaUseCase = mock(MediaUseCase.class);
        mapper = new PortfolioPatchDtoMapper(mediaUseCase);
        
        // Mock para que devuelva una key cuando se le pase una URL
        when(mediaUseCase.extractKeyFromUrl(anyString())).thenAnswer(invocation -> {
            String url = invocation.getArgument(0);
            if (url == null) return null;
            // Simular extracción de key: si la URL contiene "key123", devolver "key123"
            return url.contains("key123") ? "key123" : "extracted-key";
        });
    }

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
        PortfolioPatchDto patch = mapper.toPatch(attributes);

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
        PortfolioPatchDto patch = mapper.toPatch(attributes);

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
        PortfolioPatchDto patch = mapper.toPatch(attributes);

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
        PortfolioPatchDto patch = mapper.toPatch(attributes);

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
        PortfolioPatchDto patch = mapper.toPatch(attributes);

        // then
        assertThat(patch.title()).isEmpty();
        assertThat(patch.modelVersion()).isEmpty();
        assertThat(patch.sections()).isEmpty();
    }

    @Test
    @DisplayName("should convert URLs to keys in sections media when patching")
    void should_convert_urls_to_keys_in_sections_media_when_patching() {
        // given
        String mediaUrl = "https://bucket.s3.amazonaws.com/key123";
        PortfolioSection section = new PortfolioSection("gallery", "My Gallery", "Photos", List.of(mediaUrl));
        Map<String, Object> attributes = Map.of(
            "sections", List.of(section)
        );

        // when
        PortfolioPatchDto patch = mapper.toPatch(attributes);

        // then
        assertThat(patch.sections()).isPresent();
        List<PortfolioSection> sections = patch.sections().get();
        assertThat(sections).hasSize(1);
        PortfolioSection mappedSection = sections.get(0);
        assertThat(mappedSection.media()).containsExactly("key123");
    }
}
