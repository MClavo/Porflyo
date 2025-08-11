package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.porflyo.application.ports.output.SavedSectionRepository;
import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.SavedSection;
import com.porflyo.testing.data.SectionTestData;
import com.porflyo.testing.data.TestData;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.inject.Inject;

@MicronautTest(environments = {"integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
public class DdbSavedSectionRepositoryIntegrationTest implements TestPropertyProvider {
    
    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> dynamodb = new GenericContainer<>(DockerImageName.parse("amazon/dynamodb-local:latest"))
            .withExposedPorts(8000)
            .withCommand("-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory");

    @Inject 
    SavedSectionRepository repo;

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

    private final UserId id1 = TestData.DEFAULT_USER_ID;
    private final SectionId sectionId1 = SectionTestData.DEFAULT_SECTION_ID;
    private final SavedSection section1 = SectionTestData.DEFAULT_SAVED_SECTION;

    @Test
    void crudRoundTrip() {
        // Save section
        SavedSection savedSection = repo.save(id1, section1);
        assertNotNull(savedSection);
        assertEquals(sectionId1, savedSection.id());
        assertEquals(section1.name(), savedSection.name());

        // Find by user ID
        List<SavedSection> sections = repo.findByUserId(id1);
        assertFalse(sections.isEmpty());
        assertTrue(sections.stream().anyMatch(s -> s.id().equals(sectionId1)));

        // Find by section ID
        List<SavedSection> foundSection = repo.findByUserId(id1);
        assertFalse(foundSection.isEmpty());
        assertEquals(section1.name(), foundSection.get(0).name());

        // Delete section
        repo.delete(id1, sectionId1);
        List<SavedSection> deletedSection = repo.findByUserId(id1);
        assertTrue(deletedSection.isEmpty());
    }

}
