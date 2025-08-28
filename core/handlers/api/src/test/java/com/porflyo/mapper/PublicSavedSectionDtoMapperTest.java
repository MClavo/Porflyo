package com.porflyo.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.PublicSavedSectionDto;
import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.SavedSection;
import com.porflyo.ports.input.MediaUseCase;

class PublicSavedSectionDtoMapperTest {

    private MediaUseCase mediaUseCase;
    private PublicSavedSectionDtoMapper mapper;

    @BeforeEach
    void setUp() {
        mediaUseCase = mock(MediaUseCase.class);
        mapper = new PublicSavedSectionDtoMapper(mediaUseCase);
        
        // Mock para que devuelva una URL cuando se le pase una key
        when(mediaUseCase.resolveUrl(anyString())).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            if (key == null) return null;
            return "https://bucket.s3.amazonaws.com/" + key;
        });
    }

    @Test
    void should_mapSavedSectionToDto_when_validSavedSection() {
        // given
        SectionId sectionId = new SectionId("section-123");
        UserId userId = new UserId("user-123");
        PortfolioSection portfolioSection = new PortfolioSection(
                "hero",
                "Welcome to my portfolio",
                "I'm a software developer",
                List.of("hero-image.jpg")
        );
        SavedSection savedSection = new SavedSection(
                sectionId,
                userId,
                "Hero Section",
                portfolioSection,
                1
        );

        // when
        PublicSavedSectionDto result = mapper.toDto(savedSection);

        // then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo("section-123");
        assertThat(result.name()).isEqualTo("Hero Section");
        assertThat(result.section().sectionType()).isEqualTo("hero");
        assertThat(result.section().title()).isEqualTo("Welcome to my portfolio");
        assertThat(result.section().content()).isEqualTo("I'm a software developer");
        // Verificar que las keys se convirtieron a URLs
        assertThat(result.section().media()).containsExactly("https://bucket.s3.amazonaws.com/hero-image.jpg");
        assertThat(result.version()).isEqualTo(1);
    }

    @Test
    void should_mapSavedSectionToDto_when_aboutSection() {
        // given
        SectionId sectionId = new SectionId("section-456");
        UserId userId = new UserId("user-123");
        PortfolioSection portfolioSection = new PortfolioSection(
                "about",
                "About Me",
                "Experienced developer with passion for clean code",
                List.of()
        );
        SavedSection savedSection = new SavedSection(
                sectionId,
                userId,
                "About Section",
                portfolioSection,
                2
        );

        // when
        PublicSavedSectionDto result = mapper.toDto(savedSection);

        // then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo("section-456");
        assertThat(result.name()).isEqualTo("About Section");
        assertThat(result.section().sectionType()).isEqualTo("about");
        assertThat(result.section().title()).isEqualTo("About Me");
        assertThat(result.section().media()).isEmpty();
        assertThat(result.version()).isEqualTo(2);
    }

    @Test
    void should_mapSavedSectionToDto_when_projectsSection() {
        // given
        SectionId sectionId = new SectionId("section-789");
        UserId userId = new UserId("user-123");
        PortfolioSection portfolioSection = new PortfolioSection(
                "projects",
                "My Projects",
                "Collection of my best work",
                List.of("project1.jpg", "project2.jpg", "demo.mp4")
        );
        SavedSection savedSection = new SavedSection(
                sectionId,
                userId,
                "Projects Section",
                portfolioSection,
                3
        );

        // when
        PublicSavedSectionDto result = mapper.toDto(savedSection);

        // then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo("section-789");
        assertThat(result.name()).isEqualTo("Projects Section");
        assertThat(result.section().sectionType()).isEqualTo("projects");
        assertThat(result.section().title()).isEqualTo("My Projects");
        assertThat(result.section().content()).isEqualTo("Collection of my best work");
        // Verificar que las keys se convirtieron a URLs
        assertThat(result.section().media()).containsExactly(
            "https://bucket.s3.amazonaws.com/project1.jpg", 
            "https://bucket.s3.amazonaws.com/project2.jpg", 
            "https://bucket.s3.amazonaws.com/demo.mp4"
        );
        assertThat(result.version()).isEqualTo(3);
    }

    @Test
    void should_mapSavedSectionToDto_when_nullMediaList() {
        // given
        SectionId sectionId = new SectionId("section-null");
        UserId userId = new UserId("user-123");
        PortfolioSection portfolioSection = new PortfolioSection(
                "contact",
                "Contact Me",
                "Get in touch",
                null
        );
        SavedSection savedSection = new SavedSection(
                sectionId,
                userId,
                "Contact Section",
                portfolioSection,
                1
        );

        // when
        PublicSavedSectionDto result = mapper.toDto(savedSection);

        // then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo("section-null");
        assertThat(result.name()).isEqualTo("Contact Section");
        assertThat(result.section().sectionType()).isEqualTo("contact");
        assertThat(result.section().media()).isNull();
        assertThat(result.version()).isEqualTo(1);
    }
}
