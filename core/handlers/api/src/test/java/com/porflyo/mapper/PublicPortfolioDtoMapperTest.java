package com.porflyo.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.PublicPortfolioDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.Slug;
import com.porflyo.ports.input.MediaUseCase;

@DisplayName("PublicPortfolioDtoMapper (unit)")
class PublicPortfolioDtoMapperTest {

    private MediaUseCase mediaUseCase;
    private PublicPortfolioDtoMapper mapper;

    @BeforeEach
    void setUp() {
        mediaUseCase = mock(MediaUseCase.class);
        mapper = new PublicPortfolioDtoMapper(mediaUseCase);
        
        // Mock para que devuelva una URL cuando se le pase una key
        when(mediaUseCase.resolveUrl(anyString())).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            if (key == null) return null;
            return "https://bucket.s3.amazonaws.com/" + key;
        });
    }

    @Test
    @DisplayName("should map portfolio to dto when portfolio has all fields")
    void should_map_portfolio_to_dto_when_portfolio_has_all_fields() {
        // given
        PortfolioSection section = new PortfolioSection("about", "About Me", "I am a developer", List.of("media1"));
        Portfolio portfolio = new Portfolio(
            new PortfolioId("portfolio123"),
            new UserId("user123"),
            "modern",
            "My Portfolio",
            "Test description",
            List.of(section),
            List.of("media1", "media2"),
            1,
            new Slug("my-portfolio"),
            true
        );

        // when
        PublicPortfolioDto dto = mapper.toDto(portfolio);

        // then
        assertThat(dto.id()).isEqualTo("portfolio123");
        assertThat(dto.template()).isEqualTo("modern");
        assertThat(dto.title()).isEqualTo("My Portfolio");
        assertThat(dto.description()).isEqualTo("Test description");
        assertThat(dto.sections()).hasSize(1);
        
        // Verificar que las keys se convirtieron a URLs en las secciones
        PortfolioSection mappedSection = dto.sections().get(0);
        assertThat(mappedSection.sectionType()).isEqualTo("about");
        assertThat(mappedSection.title()).isEqualTo("About Me");
        assertThat(mappedSection.content()).isEqualTo("I am a developer");
        assertThat(mappedSection.media()).containsExactly("https://bucket.s3.amazonaws.com/media1");
        
        // Verificar que las keys se convirtieron a URLs en la lista principal de media
        assertThat(dto.media()).containsExactly("https://bucket.s3.amazonaws.com/media1", "https://bucket.s3.amazonaws.com/media2");
        assertThat(dto.modelVersion()).isEqualTo(1);
        assertThat(dto.reservedSlug()).isEqualTo("my-portfolio");
        assertThat(dto.isPublished()).isTrue();
    }

    @Test
    @DisplayName("should map portfolio to dto when portfolio has null slug")
    void should_map_portfolio_to_dto_when_portfolio_has_null_slug() {
        // given
        Portfolio portfolio = new Portfolio(
            new PortfolioId("portfolio123"),
            new UserId("user123"),
            "modern",
            "My Portfolio",
            "Test description",
            List.of(),
            List.of(),
            1,
            null, // null slug
            false
        );

        // when
        PublicPortfolioDto dto = mapper.toDto(portfolio);

        // then
        assertThat(dto.reservedSlug()).isNull();
        assertThat(dto.isPublished()).isFalse();
    }

    @Test
    @DisplayName("should map portfolio to dto when portfolio has empty collections")
    void should_map_portfolio_to_dto_when_portfolio_has_empty_collections() {
        // given
        Portfolio portfolio = new Portfolio(
            new PortfolioId("portfolio123"),
            new UserId("user123"),
            "modern",
            "My Portfolio",
            "Test description",
            List.of(), // empty sections
            List.of(), // empty media
            1,
            new Slug("my-portfolio"),
            true
        );

        // when
        PublicPortfolioDto dto = mapper.toDto(portfolio);

        // then
        assertThat(dto.sections()).isEmpty();
        assertThat(dto.media()).isEmpty();
    }

    @Test
    @DisplayName("should convert keys to URLs in sections media")
    void should_convert_keys_to_urls_in_sections_media() {
        // given
        PortfolioSection section = new PortfolioSection("gallery", "My Gallery", "Photos", List.of("key123", "key456"));
        Portfolio portfolio = new Portfolio(
            new PortfolioId("portfolio123"),
            new UserId("user123"),
            "modern",
            "My Portfolio",
            "Test description",
            List.of(section),
            List.of("key789"),
            1,
            new Slug("my-portfolio"),
            true
        );

        // when
        PublicPortfolioDto dto = mapper.toDto(portfolio);

        // then
        assertThat(dto.sections()).hasSize(1);
        PortfolioSection mappedSection = dto.sections().get(0);
        assertThat(mappedSection.media()).containsExactly(
            "https://bucket.s3.amazonaws.com/key123",
            "https://bucket.s3.amazonaws.com/key456"
        );
        assertThat(dto.media()).containsExactly("https://bucket.s3.amazonaws.com/key789");
    }

    @Test
    @DisplayName("should handle null media in sections")
    void should_handle_null_media_in_sections() {
        // given
        PortfolioSection section = new PortfolioSection("about", "About Me", "I am a developer", null);
        Portfolio portfolio = new Portfolio(
            new PortfolioId("portfolio123"),
            new UserId("user123"),
            "modern",
            "My Portfolio",
            "Test description",
            List.of(section),
            List.of(),
            1,
            new Slug("my-portfolio"),
            true
        );

        // when
        PublicPortfolioDto dto = mapper.toDto(portfolio);

        // then
        assertThat(dto.sections()).hasSize(1);
        assertThat(dto.sections().get(0).media()).isNull();
    }
}
