package com.porflyo.ports;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.data.PortfolioTestData;
import com.porflyo.data.TestData;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioUrl;
import com.porflyo.model.portfolio.Slug;

public abstract class PortfolioUrlRepositoryContract {
    
    protected PortfolioUrlRepository repository;

    protected PortfolioUrlRepositoryContract(PortfolioUrlRepository repository) {
        this.repository = repository;
    }

    // Test data
    private final UserId userId = TestData.DEFAULT_USER_ID;
    private final PortfolioId portfolioId = PortfolioTestData.DEFAULT_PORTFOLIO_ID;
    private final Slug slug = PortfolioTestData.DEFAULT_PORTFOLIO_DESIRED_SLUG;
    private final Slug otherSlug = new Slug("other-slug");


    @Test
    @DisplayName("Should return empty when slug mapping does not exist")
    void shouldReturnEmpty_whenFindBySlugAndNotFound() {
        // Given
        // (no data)

        // When
        Optional<PortfolioUrl> found = repository.findBySlug(slug);

        // Then
        assertTrue(found.isEmpty(), "Expected Optional.empty() when slug mapping is missing");
    }

    @Test
    @DisplayName("Should reserve slug when it is free")
    void shouldReserve_whenSlugIsFree() {
        // Given
        boolean isPublic = true;

        // When
        boolean reserved = repository.reserve(slug, userId, portfolioId, isPublic);

        // Then
        assertTrue(reserved, "Slug should be reserved when it is free");

        Optional<PortfolioUrl> mapping = repository.findBySlug(slug);
        assertTrue(mapping.isPresent(), "Mapping should exist after reserve");

        PortfolioUrl url = mapping.get();
        assertEquals(userId.value(), url.userId().value());
        assertEquals(portfolioId.value(), url.portfolioId().value());
        assertEquals(slug.value(), url.slug().value());
        assertTrue(url.isPublic(), "Visibility should match the reserve flag");
    }

    @Test
    @DisplayName("Should not reserve slug when it is already taken")
    void shouldNotReserve_whenSlugAlreadyTaken() {
        // Given
        assertTrue(repository.reserve(slug, userId, portfolioId, false), "Precondition: first reserve succeeds");
        // Ensure the slug is reserved
        Optional<PortfolioUrl> t = repository.findBySlug(slug);
        assertTrue(t.isPresent(), "Mapping should exist after reserve");

        // When
        boolean reservedAgain = repository.reserve(slug, new UserId("another-user"), new PortfolioId("another-portfolio"), true);

        // Then
        assertFalse(reservedAgain, "Second reserve must fail for same slug");

        Optional<PortfolioUrl> mapping = repository.findBySlug(slug);
        assertTrue(mapping.isPresent(), "Original mapping should remain");
        PortfolioUrl url = mapping.get();
        assertEquals(userId.value(), url.userId().value(), "Original owner must remain unchanged");
        assertEquals(portfolioId, url.portfolioId(), "Original portfolio must remain unchanged");
        assertFalse(url.isPublic(), "Original visibility should remain unchanged");
    }

    @Test
    @DisplayName("Should release slug mapping when existing")
    void shouldRelease_whenExistingMapping() {
        // Given
        assertTrue(repository.reserve(slug, userId, portfolioId, true), "Precondition: reserve succeeds");

        // When
        repository.release(slug);

        // Then
        assertTrue(repository.findBySlug(slug).isEmpty(), "Mapping should be removed after release");
    }

    @Test
    @DisplayName("Should change slug atomically when new slug is free")
    void shouldChangeSlugAtomically_whenNewSlugIsFree() {
        // Given
        assertTrue(repository.reserve(slug, userId, portfolioId, true), "Precondition: old slug reserved");

        // When
        repository.changeSlugAtomic(slug, otherSlug, userId, portfolioId, true);

        // Then
        assertTrue(repository.findBySlug(slug).isEmpty(), "Old slug mapping should be gone");

        Optional<PortfolioUrl> newMapping = repository.findBySlug(otherSlug);
        assertTrue(newMapping.isPresent(), "New slug mapping should exist");

        PortfolioUrl url = newMapping.get();
        assertEquals(userId.value(), url.userId().value());
        assertEquals(portfolioId.value(), url.portfolioId().value());
        assertEquals(otherSlug.value(), url.slug().value());
        assertTrue(url.isPublic(), "Visibility should be preserved");
    }

    @Test
    @DisplayName("Should update visibility flag for existing mapping")
    void shouldUpdateVisibility_whenExistingMapping() {
        // Given
        assertTrue(repository.reserve(slug, userId, portfolioId, false), "Precondition: reserved with isPublic=false");

        // When
        repository.updateVisibility(slug, true);

        // Then
        Optional<PortfolioUrl> mapping = repository.findBySlug(slug);
        assertTrue(mapping.isPresent(), "Mapping should exist");
        assertTrue(mapping.get().isPublic(), "Visibility should be updated to true");
    }

}
