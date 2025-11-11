package com.porflyo.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.PortfolioCreateDto;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.usecase.MediaUseCase;

@DisplayName("PortfolioCreateDtoMapper (unit)")
class PortfolioCreateDtoMapperTest {

    private MediaUseCase mediaUseCase;
    private PortfolioCreateDtoMapper mapper;
    private final UserId userId = new UserId("user123");

    @BeforeEach
    void setUp() {
        mediaUseCase = mock(MediaUseCase.class);
        mapper = new PortfolioCreateDtoMapper(mediaUseCase);
        
        // Mock para que devuelva una key cuando se le pase una URL
        when(mediaUseCase.extractKeyFromUrl(anyString())).thenAnswer(invocation -> {
            String url = invocation.getArgument(0);
            if (url == null) return null;
            // Simular extracción de key: si la URL contiene "key123", devolver "key123"
            return url.contains("key123") ? "key123" : "extracted-key";
        });
    }

    @Test
    @DisplayName("should map create dto to domain when valid input")
    void should_map_create_dto_to_domain_when_valid_input() {
        // given
        PortfolioSection section = new PortfolioSection("about", "About Me", "I am a developer", List.of());
        PortfolioCreateDto dto = new PortfolioCreateDto("modern", "My Portfolio", "Test description", List.of(section));

        // when
        Portfolio portfolio = mapper.toDomain(dto, userId);

        // then
        assertThat(portfolio.userId()).isEqualTo(userId);
        assertThat(portfolio.template()).isEqualTo("modern");
        assertThat(portfolio.title()).isEqualTo("My Portfolio");
        assertThat(portfolio.description()).isEqualTo("Test description");
        assertThat(portfolio.sections()).hasSize(1);
        assertThat(portfolio.sections().get(0)).isEqualTo(section);
        assertThat(portfolio.media()).isEmpty();
        assertThat(portfolio.modelVersion()).isEqualTo(1);
        assertThat(portfolio.reservedSlug()).isNull();
        assertThat(portfolio.isPublished()).isFalse();
        assertThat(portfolio.id()).isNotNull();
    }

    @Test
    @DisplayName("should handle null sections when mapping")
    void should_handle_null_sections_when_mapping() {
        // given
        PortfolioCreateDto dto = new PortfolioCreateDto("modern", "My Portfolio", "Test description", null);

        // when
        Portfolio portfolio = mapper.toDomain(dto, userId);

        // then
        assertThat(portfolio.sections()).isEmpty();
    }

    @Test
    @DisplayName("should handle empty sections when mapping")
    void should_handle_empty_sections_when_mapping() {
        // given
        PortfolioCreateDto dto = new PortfolioCreateDto("modern", "My Portfolio", "Test description", List.of());

        // when
        Portfolio portfolio = mapper.toDomain(dto, userId);

        // then
        assertThat(portfolio.sections()).isEmpty();
    }

    @Test
    @DisplayName("should convert URLs to keys in sections media")
    void should_convert_urls_to_keys_in_sections_media() {
        // given
        String mediaUrl = "https://bucket.s3.amazonaws.com/key123";
        PortfolioSection section = new PortfolioSection("gallery", "My Gallery", "Photos", List.of(mediaUrl));
        PortfolioCreateDto dto = new PortfolioCreateDto("modern", "My Portfolio", "Test description", List.of(section));

        // when
        Portfolio portfolio = mapper.toDomain(dto, userId);

        // then
        assertThat(portfolio.sections()).hasSize(1);
        assertThat(portfolio.sections().get(0).media()).containsExactly("key123");
    }

    @Test
    @DisplayName("should handle null media in sections")
    void should_handle_null_media_in_sections() {
        // given
        PortfolioSection section = new PortfolioSection("about", "About Me", "I am a developer", null);
        PortfolioCreateDto dto = new PortfolioCreateDto("modern", "My Portfolio", "Test description", List.of(section));

        // when
        Portfolio portfolio = mapper.toDomain(dto, userId);

        // then
        assertThat(portfolio.sections()).hasSize(1);
        assertThat(portfolio.sections().get(0).media()).isNull();
    }
}
