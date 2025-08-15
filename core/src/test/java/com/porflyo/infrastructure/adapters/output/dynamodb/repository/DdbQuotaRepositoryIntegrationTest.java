package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.porflyo.domain.model.ids.UserId;
import com.porflyo.infrastructure.configuration.QuotaConfig;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.inject.Inject;

@MicronautTest(environments = {"integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
@DisplayName("DynamoDB Quota Repository Integration Tests")
public class DdbQuotaRepositoryIntegrationTest implements TestPropertyProvider {

    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> dynamodb = new GenericContainer<>(DockerImageName.parse("amazon/dynamodb-local:latest"))
            .withExposedPorts(8000)
            .withCommand("-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory");

    @Inject DdbQuotaRepository repository;
    @Inject QuotaConfig quotaConfig;

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

    // Generate a fresh user per test to avoid cross-test residue
    private UserId newUserId() {
        return new UserId("user-it-" + UUID.randomUUID());
    }

    @BeforeEach
    void beforeEach() {
        // No global cleanup required because we use a new UserId per test
    }

    @Test
    @DisplayName("Should return null when quota item does not exist")
    void shouldReturnNull_whenQuotaItemNotFound() {
        // Given
        UserId user = newUserId();

        // When
        Integer savedSections = repository.getSavedSectionCount(user);
        Integer portfolios = repository.getPortfolioCount(user);

        // Then
        assertNull(savedSections, "SavedSectionCount should be null when item is missing");
        assertNull(portfolios, "PortfolioCount should be null when item is missing");
    }

    @Test
    @DisplayName("Should create quota item with zeroed counters")
    void shouldCreateQuotaItemWithZeroes_whenCreate() {
        // Given
        UserId user = newUserId();

        // When
        repository.create(user);

        // Then
        assertEquals(0, repository.getSavedSectionCount(user));
        assertEquals(0, repository.getPortfolioCount(user));
    }

    @Test
    @DisplayName("Should increment savedSectionCount within limits")
    void shouldIncrementSavedSectionCountWithinLimits_whenUpdateSavedSectionCount() {
        // Given
        UserId user = newUserId();
        repository.create(user);

        // When
        int c1 = repository.updateSavedSectionCount(user, 1);
        int c2 = repository.updateSavedSectionCount(user, 2);

        // Then
        assertEquals(1, c1, "First increment should set count to 1");
        assertEquals(3, c2, "Second increment should set count to 3");
        assertEquals(3, repository.getSavedSectionCount(user), "Persisted value must be 3");
    }

    @Test
    @DisplayName("Should throw when savedSectionCount exceeds max")
    void shouldThrow_whenSavedSectionCountExceedsMax() {
        // Given
        UserId user = newUserId();
        repository.create(user);
        int max = quotaConfig.maxSavedSections();

        // When
        int atMax = repository.updateSavedSectionCount(user, max);

        // Then
        assertEquals(max, atMax, "Reaching exactly max should be allowed");

        // And when trying to go over the limit
        IllegalStateException ex = assertThrows(IllegalStateException.class,
            () -> repository.updateSavedSectionCount(user, 1),
            "Going over max must throw");
        assertTrue(ex.getMessage().toLowerCase().contains("quota"), "Exception should mention quota");
        assertEquals(max, repository.getSavedSectionCount(user), "Value should remain at max after failure");
    }

    @Test
    @DisplayName("Should throw when savedSectionCount goes below zero")
    void shouldThrow_whenSavedSectionCountGoesBelowZero() {
        // Given
        UserId user = newUserId();
        repository.create(user);

        // When / Then
        IllegalStateException ex = assertThrows(IllegalStateException.class,
            () -> repository.updateSavedSectionCount(user, -1),
            "Decreasing below zero must throw");
        assertTrue(ex.getMessage().toLowerCase().contains("quota"), "Exception should mention quota");
        assertEquals(0, repository.getSavedSectionCount(user), "Value should remain 0 after failure");
    }

    @Test
    @DisplayName("Should increment portfolioCount within limits")
    void shouldIncrementPortfolioCountWithinLimits_whenUpdatePortfolioCount() {
        // Given
        UserId user = newUserId();
        repository.create(user);

        // When
        int c1 = repository.updatePortfolioCount(user, 1);
        int c2 = repository.updatePortfolioCount(user, 2);

        // Then
        assertEquals(1, c1);
        assertEquals(3, c2);
        assertEquals(3, repository.getPortfolioCount(user));
    }

    @Test
    @DisplayName("Should throw when portfolioCount exceeds max")
    void shouldThrow_whenPortfolioCountExceedsMax() {
        // Given
        UserId user = newUserId();
        repository.create(user);
        int max = quotaConfig.maxPortfolios();

        // When
        int atMax = repository.updatePortfolioCount(user, max);

        // Then
        assertEquals(max, atMax, "Reaching exactly max should be allowed");

        // And when trying to go over the limit
        IllegalStateException ex = assertThrows(IllegalStateException.class,
            () -> repository.updatePortfolioCount(user, 1),
            "Going over max must throw");
        assertTrue(ex.getMessage().toLowerCase().contains("quota"));
        assertEquals(max, repository.getPortfolioCount(user), "Value should remain at max after failure");
    }

    @Test
    @DisplayName("Should throw when portfolioCount goes below zero")
    void shouldThrow_whenPortfolioCountGoesBelowZero() {
        // Given
        UserId user = newUserId();
        repository.create(user);

        // When / Then
        IllegalStateException ex = assertThrows(IllegalStateException.class,
            () -> repository.updatePortfolioCount(user, -1),
            "Decreasing below zero must throw");
        assertTrue(ex.getMessage().toLowerCase().contains("quota"));
        assertEquals(0, repository.getPortfolioCount(user));
    }

    @Test
    @DisplayName("Should delete quota item")
    void shouldDeleteQuotaItem_whenDelete() {
        // Given
        UserId user = newUserId();
        repository.create(user);
        assertNotNull(repository.getSavedSectionCount(user));
        assertNotNull(repository.getPortfolioCount(user));

        // When
        repository.delete(user);

        // Then
        assertNull(repository.getSavedSectionCount(user), "Counters should be null after delete");
        assertNull(repository.getPortfolioCount(user), "Counters should be null after delete");
    }

    @Test
    @DisplayName("Should throw when updating counters without existing item")
    void shouldThrow_whenUpdatingWithoutExistingItem() {
        // Given
        UserId user = newUserId();

        // When / Then
        assertThrows(IllegalStateException.class,
            () -> repository.updateSavedSectionCount(user, 1),
            "Updating saved sections without item must throw");

        assertThrows(IllegalStateException.class,
            () -> repository.updatePortfolioCount(user, 1),
            "Updating portfolios without item must throw");
    }
}
