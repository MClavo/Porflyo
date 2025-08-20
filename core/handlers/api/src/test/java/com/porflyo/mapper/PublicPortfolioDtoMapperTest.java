package com.porflyo.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.PublicPortfolioDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.Slug;

@DisplayName("PublicPortfolioDtoMapper (unit)")
class PublicPortfolioDtoMapperTest {

    private final PublicPortfolioDtoMapper mapper = new PublicPortfolioDtoMapper();

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
        assertThat(dto.sections().get(0)).isEqualTo(section);
        assertThat(dto.media()).containsExactly("media1", "media2");
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
}
