package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.porflyo.application.ports.output.SavedSectionRepository;
import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.PortfolioSection;
import com.porflyo.domain.model.portfolio.SavedSection;
import com.porflyo.testing.data.PortfolioTestData;
import com.porflyo.testing.data.TestData;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.inject.Inject;

@MicronautTest(environments = {"integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
@DisplayName("DynamoDB SavedSection Repository Integration Tests")
public class DdbSavedSectionRepositoryIntegrationTest implements TestPropertyProvider {

    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> dynamodb = new GenericContainer<>(DockerImageName.parse("amazon/dynamodb-local:latest"))
            .withExposedPorts(8000)
            .withCommand("-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory");

    @Inject
    SavedSectionRepository repository;

    @Override
    public Map<String, String> getProperties() {
        if (!dynamodb.isRunning()) {
            dynamodb.start();
        }
        String dynamoUrl = "http://" + dynamodb.getHost() + ":" + dynamodb.getMappedPort(8000);
        return Map.of(
            "dynamodb.endpoint", dynamoUrl,
            "dynamodb.region", "us-east-1",
            "micronaut.test.resources.enabled", "false"
        );
    }

    private final UserId userId = TestData.DEFAULT_USER_ID;
    private final SectionId sectionId = PortfolioTestData.DEFAULT_SECTION_ID;

    @BeforeEach
    void cleanUserSections() {
        // Remove any residue for this user using the repository itself
        List<SavedSection> existing = repository.findByUserId(userId);
        for (SavedSection s : existing) {
            repository.delete(userId, s.id());
        }
    }

    @Test
    @DisplayName("Should return empty list when user has no saved sections")
    void shouldReturnEmpty_whenUserHasNoSavedSections() {
        // When
        List<SavedSection> sections = repository.findByUserId(userId);

        // Then
        assertTrue(sections.isEmpty(), "Expected no saved sections for the user");
    }

    @Test
    @DisplayName("Should save and list one saved section for user")
    void shouldSaveAndListOne_whenUserSavesSection() {
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
    void shouldHandleMultiple_whenSavingMoreThanOne() {
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
    void shouldDelete_whenExistingSection() {
        // Given
        repository.save(PortfolioTestData.DEFAULT_SAVED_SECTION);
        assertFalse(repository.findByUserId(userId).isEmpty(), "Precondition: one section exists");

        // When
        repository.delete(userId, sectionId);

        // Then
        List<SavedSection> sections = repository.findByUserId(userId);
        assertTrue(sections.isEmpty(), "User should have no saved sections after deletion");
    }
}
