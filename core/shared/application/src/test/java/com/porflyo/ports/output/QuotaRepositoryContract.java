package com.porflyo.ports.output;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.configuration.QuotaConfig;
import com.porflyo.model.ids.UserId;


public abstract class QuotaRepositoryContract {
    protected QuotaRepository repository;
    protected QuotaConfig quotaConfig;

    protected QuotaRepositoryContract(QuotaRepository repository, QuotaConfig quotaConfig) {
        this.repository = repository;
        this.quotaConfig = quotaConfig;
    }

    // No-argument constructor to allow dependency injection
    protected QuotaRepositoryContract() {
        // Dependencies will be set later via setters or @PostConstruct
    }


    // Generate a fresh user per test to avoid cross-test residue
    private UserId newUserId() {
        return UserId.newKsuid();
    }


    @Test
    @DisplayName("Should return null when quota item does not exist")
    protected void shouldReturnNull_whenQuotaItemNotFound() {
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
    protected void shouldCreateQuotaItemWithZeroes_whenCreate() {
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
    protected void shouldIncrementSavedSectionCountWithinLimits_whenUpdateSavedSectionCount() {
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
    protected void shouldThrow_whenSavedSectionCountExceedsMax() {
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
    protected void shouldThrow_whenSavedSectionCountGoesBelowZero() {
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
    protected void shouldIncrementPortfolioCountWithinLimits_whenUpdatePortfolioCount() {
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
    protected void shouldThrow_whenPortfolioCountExceedsMax() {
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
    protected void shouldThrow_whenPortfolioCountGoesBelowZero() {
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
    protected void shouldDeleteQuotaItem_whenDelete() {
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
    protected void shouldThrow_whenUpdatingWithoutExistingItem() {
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
