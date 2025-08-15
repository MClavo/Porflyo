package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.porflyo.application.dto.PortfolioPatchDto;
import com.porflyo.application.ports.output.PortfolioRepository;
import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.Portfolio;
import com.porflyo.domain.model.portfolio.PortfolioSection;
import com.porflyo.domain.model.portfolio.Slug;
import com.porflyo.testing.data.PortfolioTestData;
import com.porflyo.testing.data.TestData;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.inject.Inject;

@MicronautTest(environments = {"integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
@DisplayName("DynamoDB Portfolio Repository Integration Tests")
public class DdbPortfolioRepositoryIntegrationTest implements TestPropertyProvider {

    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> dynamodb = new GenericContainer<>(DockerImageName.parse("amazon/dynamodb-local:latest"))
            .withExposedPorts(8000)
            .withCommand("-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory");

    @Inject 
    PortfolioRepository repository;

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

    // Test data
    private final UserId testUserId = TestData.DEFAULT_USER_ID;
    private final PortfolioId testPortfolioId = PortfolioTestData.DEFAULT_PORTFOLIO_ID;
    private final Portfolio testPortfolio = PortfolioTestData.DEFAULT_PORTFOLIO;

    @BeforeEach
    void cleanUp() {
        // Clean up any existing data before each test
        try {
            repository.delete(testUserId, testPortfolioId);
        } catch (Exception e) {
            // Ignore if portfolio doesn't exist
        }
    }

    @Test
    @DisplayName("Should return empty when portfolio does not exist")
    void shouldReturnEmptyWhenPortfolioNotFound() {
        // Given
        UserId nonExistentUserId = new UserId("non-existent-user");
        PortfolioId nonExistentPortfolioId = new PortfolioId("non-existent-portfolio");

        // When & Then
        assertTrue(repository.findById(nonExistentUserId, nonExistentPortfolioId).isEmpty(),
                "Should return empty when portfolio doesn't exist");
        assertTrue(repository.findByUserId(nonExistentUserId).isEmpty(),
                "Should return empty list when user has no portfolios");
    }

    @Test
    @DisplayName("Should save and retrieve portfolio correctly")
    void shouldSaveAndRetrievePortfolio() {
        // Given
        Portfolio portfolioToSave = testPortfolio;

        // When
        repository.save(portfolioToSave);

        // Then
        Optional<Portfolio> retrievedById = repository.findById(testUserId, testPortfolioId);
        assertTrue(retrievedById.isPresent(), "Portfolio should be found by ID");
        
        Portfolio saved = retrievedById.get();
        assertEquals(portfolioToSave.id(), saved.id());
        assertEquals(portfolioToSave.userId(), saved.userId());
        assertEquals(portfolioToSave.title(), saved.title());
        assertEquals(portfolioToSave.description(), saved.description());
        assertEquals(portfolioToSave.template(), saved.template());
        assertEquals(portfolioToSave.sections(), saved.sections());
        assertEquals(portfolioToSave.modelVersion(), saved.modelVersion());
        assertEquals(portfolioToSave.reservedSlug(), saved.reservedSlug());
        assertEquals(portfolioToSave.isPublished(), saved.isPublished());

        // Test findByUserId
        List<Portfolio> userPortfolios = repository.findByUserId(testUserId);
        assertEquals(1, userPortfolios.size(), "User should have exactly one portfolio");
        assertEquals(portfolioToSave.id(), userPortfolios.get(0).id());
    }

    @Test
    @DisplayName("Should correctly compress and decompress portfolio data")
    void shouldPreserveDataIntegrityThroughCompressionDecompression() {
        // Given
        repository.save(testPortfolio);

        // When
        Portfolio retrieved = repository.findById(testUserId, testPortfolioId).orElseThrow();

        // Then
        assertEquals(testPortfolio.description(), retrieved.description(),
                "Description should remain unchanged after compression/decompression");
        assertEquals(testPortfolio.sections(), retrieved.sections(),
                "Sections should remain unchanged after compression/decompression");
        
        // Verify sections content in detail
        List<PortfolioSection> originalSections = testPortfolio.sections();
        List<PortfolioSection> retrievedSections = retrieved.sections();
        
        assertEquals(originalSections.size(), retrievedSections.size());
        for (int i = 0; i < originalSections.size(); i++) {
            PortfolioSection original = originalSections.get(i);
            PortfolioSection retrievedSection = retrievedSections.get(i);
            
            assertEquals(original.sectionType(), retrievedSection.sectionType());
            assertEquals(original.title(), retrievedSection.title());
            assertEquals(original.content(), retrievedSection.content());
            assertEquals(original.media(), retrievedSection.media());
        }
    }

    @Test
    @DisplayName("Should patch portfolio fields successfully")
    void shouldPatchPortfolioFields() {
        // Given
        repository.save(testPortfolio);
        
        String updatedTitle = "Updated Portfolio Title";
        String updatedDescription = "Updated portfolio description";
        String updatedTemplate = "Updated Template";
        int updatedModelVersion = 2;

        PortfolioPatchDto patch = new PortfolioPatchDto(
                Optional.of(updatedTemplate),
                Optional.of(updatedTitle),
                Optional.of(updatedDescription),
                Optional.of(testPortfolio.sections()),
                Optional.of(updatedModelVersion)
        );

        // When
        Portfolio patchedPortfolio = repository.patch(testUserId, testPortfolioId, patch);

        // Then
        assertNotNull(patchedPortfolio, "Patched portfolio should not be null");
        assertEquals(updatedTitle, patchedPortfolio.title());
        assertEquals(updatedDescription, patchedPortfolio.description());
        assertEquals(updatedTemplate, patchedPortfolio.template());
        assertEquals(updatedModelVersion, patchedPortfolio.modelVersion());

        // Verify changes persist when retrieved again
        Portfolio retrieved = repository.findById(testUserId, testPortfolioId).orElseThrow();
        assertEquals(updatedTitle, retrieved.title());
        assertEquals(updatedDescription, retrieved.description());
        assertEquals(updatedTemplate, retrieved.template());
        assertEquals(updatedModelVersion, retrieved.modelVersion());
    }

    @Test
    @DisplayName("Should update slug and visibility correctly")
    void shouldUpdateSlugAndVisibility() {
        // Given
        repository.save(testPortfolio);
        
        Slug newSlug = new Slug("new-portfolio-slug");
        boolean newVisibility = false;

        // When
        Portfolio updatedPortfolio = repository.setUrlAndVisibility(testUserId, testPortfolioId, newSlug, newVisibility);

        // Then
        assertNotNull(updatedPortfolio, "Updated portfolio should not be null");
        assertEquals(newSlug, updatedPortfolio.reservedSlug());
        assertEquals(newVisibility, updatedPortfolio.isPublished());

        // Verify changes persist when retrieved again
        Portfolio retrieved = repository.findById(testUserId, testPortfolioId).orElseThrow();
        assertEquals(newSlug, retrieved.reservedSlug());
        assertEquals(newVisibility, retrieved.isPublished());
        
        // Verify other fields remain unchanged
        assertEquals(testPortfolio.title(), retrieved.title());
        assertEquals(testPortfolio.description(), retrieved.description());
        assertEquals(testPortfolio.template(), retrieved.template());
    }

    @Test
    @DisplayName("Should delete portfolio successfully")
    void shouldDeletePortfolio() {
        // Given
        repository.save(testPortfolio);
        
        // Verify portfolio exists
        assertTrue(repository.findById(testUserId, testPortfolioId).isPresent(),
                "Portfolio should exist before deletion");

        // When
        repository.delete(testUserId, testPortfolioId);

        // Then
        assertTrue(repository.findById(testUserId, testPortfolioId).isEmpty(),
                "Portfolio should not exist after deletion");
        assertTrue(repository.findByUserId(testUserId).isEmpty(),
                "User should have no portfolios after deletion");
    }

    @Test
    @DisplayName("Should handle multiple portfolios for same user")
    void shouldHandleMultiplePortfoliosForSameUser() {
        // Given
        Portfolio portfolio1 = testPortfolio;
        
        PortfolioId portfolio2Id = new PortfolioId("portfolio-456");
        Portfolio portfolio2 = new Portfolio(
                portfolio2Id,
                testUserId,
                "Template 2",
                "Second Portfolio",
                "Second portfolio description",
                testPortfolio.sections(),
                testPortfolio.media(),
                1,
                new Slug("second-portfolio"),
                false
        );

        // When
        repository.save(portfolio1);
        repository.save(portfolio2);

        // Then
        List<Portfolio> userPortfolios = repository.findByUserId(testUserId);
        assertEquals(2, userPortfolios.size(), "User should have two portfolios");
        
        // Verify both portfolios can be found individually
        assertTrue(repository.findById(testUserId, testPortfolioId).isPresent());
        assertTrue(repository.findById(testUserId, portfolio2Id).isPresent());

        // Clean up second portfolio
        repository.delete(testUserId, portfolio2Id);
    }

    @Test
    @DisplayName("Should handle partial patch updates")
    void shouldHandlePartialPatchUpdates() {
        // Given
        repository.save(testPortfolio);
        
        String originalTitle = testPortfolio.title();
        String originalDescription = testPortfolio.description();
        String updatedTemplate = "Only Template Updated";

        // Patch only template
        PortfolioPatchDto partialPatch = new PortfolioPatchDto(
                Optional.of(updatedTemplate),
                Optional.empty(),
                Optional.empty(),
                Optional.empty(),
                Optional.empty()
        );

        // When
        Portfolio patchedPortfolio = repository.patch(testUserId, testPortfolioId, partialPatch);

        // Then
        assertEquals(updatedTemplate, patchedPortfolio.template());
        assertEquals(originalTitle, patchedPortfolio.title());
        assertEquals(originalDescription, patchedPortfolio.description());
        
        // Verify unchanged fields
        assertEquals(testPortfolio.modelVersion(), patchedPortfolio.modelVersion());
        assertEquals(testPortfolio.reservedSlug(), patchedPortfolio.reservedSlug());
        assertEquals(testPortfolio.isPublished(), patchedPortfolio.isPublished());
    }
}

