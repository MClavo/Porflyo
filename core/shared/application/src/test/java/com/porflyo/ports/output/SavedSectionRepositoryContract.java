package com.porflyo.ports.output;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.data.PortfolioTestData;
import com.porflyo.data.TestData;
import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.SavedSection;

public abstract class SavedSectionRepositoryContract {
    
    protected SavedSectionRepository repository;

    protected SavedSectionRepositoryContract(SavedSectionRepository repository) {
        this.repository = repository;
    }


    private final UserId userId = TestData.DEFAULT_USER_ID;
    private final SectionId sectionId = PortfolioTestData.DEFAULT_SECTION_ID;

    @BeforeEach
    protected void cleanUserSections() {
        // Remove any residue for this user using the repository itself
        List<SavedSection> existing = repository.findByUserId(userId);
        for (SavedSection s : existing) {
            repository.delete(userId, s.id());
        }
    }

    @Test
    @DisplayName("Should return empty list when user has no saved sections")
    protected void shouldReturnEmpty_whenUserHasNoSavedSections() {
        // When
        List<SavedSection> sections = repository.findByUserId(userId);

        // Then
        assertTrue(sections.isEmpty(), "Expected no saved sections for the user");
    }

    @Test
    @DisplayName("Should save and list one saved section for user")
    protected void shouldSaveAndListOne_whenUserSavesSection() {
        // Given
        SavedSection toSave = PortfolioTestData.DEFAULT_SAVED_SECTION;

        // When
        repository.save(toSave);
        List<SavedSection> sections = repository.findByUserId(userId);

        // Then
        assertEquals(1, sections.size(), "User should have exactly one saved section");
        SavedSection s = sections.get(0);
        assertEquals(toSave.id(), s.id());
        assertEquals(toSave.userId(), s.userId());
        assertEquals(toSave.name(), s.name());
        assertEquals(toSave.version(), s.version());
        assertEquals(toSave.section().title(), s.section().title());
        assertEquals(toSave.section().content(), s.section().content());
        assertEquals(toSave.section().media(), s.section().media());
    }

    @Test
    @DisplayName("Should handle multiple saved sections for the same user")
    protected void shouldHandleMultiple_whenSavingMoreThanOne() {
        // Given
        SavedSection s1 = PortfolioTestData.DEFAULT_SAVED_SECTION;

        // Create a second section with a different SectionId/content (no helpers, just a small variation)
        SectionId sectionId2 = new SectionId("section-456");
        PortfolioSection sec2 = new PortfolioSection(
                "text",
                "Another Test Section",
                "Another test section content.",
                List.of("m3.png", "m4.png")
        );
        SavedSection s2 = new SavedSection(
                sectionId2,
                userId,
                "My Other Saved Section",
                sec2,
                1
        );

        // When
        repository.save(s1);
        repository.save(s2);
        List<SavedSection> sections = repository.findByUserId(userId);

        // Then
        assertEquals(2, sections.size(), "User should have two saved sections");
        assertTrue(sections.stream().anyMatch(s -> s.id().equals(s1.id())), "Should contain first section");
        assertTrue(sections.stream().anyMatch(s -> s.id().equals(s2.id())), "Should contain second section");
    }

    @Test
    @DisplayName("Should delete a saved section")
    protected void shouldDelete_whenExistingSection() {
        // Given
        SavedSection saved = repository.save(PortfolioTestData.DEFAULT_SAVED_SECTION);
        List<SavedSection> preDelete = repository.findByUserId(userId);
        assertFalse(preDelete.isEmpty(), "Precondition: one section exists");

        // When
        repository.delete(userId, saved.id());

        // Then
        List<SavedSection> sections = repository.findByUserId(userId);
        assertTrue(sections.isEmpty(), "User should have no saved sections after deletion");
    }

}
