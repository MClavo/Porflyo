package com.porflyo.ports;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.model.ids.UserId;

public abstract class MediaCountRepositoryContract {
    
    protected MediaCountRepository repository;

    protected MediaCountRepositoryContract(MediaCountRepository repository){
        this.repository = repository;
    }

    
    @BeforeEach
    void cleanUp() {
        // Clean up any existing data before each test
        try {
            repository.delete(new UserId("test-user"));
        } catch (Exception e) {
            // Ignore if no data exists
        }
    }

    @Test
    @DisplayName("Should save and retrieve media count correctly")
    protected void shouldSaveAndRetrieveMediaCount() {
        // Given
        UserId testUserId = new UserId("test-user");
        Map<String, Integer> mediaCount = Map.of("image1", 3, "video1", 2, "image2", 5);

        // When
        repository.save(testUserId, mediaCount);

        // Then
        Map<String, Integer> retrievedMediaCount = repository.find(testUserId);
        assertNotNull(retrievedMediaCount, "Media count should not be null");
        assertEquals(mediaCount, retrievedMediaCount, "Media count should match the saved data");
    }

    @Test
    @DisplayName("Should return empty map when media count does not exist")
    protected void shouldReturnEmptyMapWhenMediaCountNotFound() {
        // Given
        UserId nonExistentUserId = new UserId("non-existent-user");

        // When
        Map<String, Integer> retrievedMediaCount = repository.find(nonExistentUserId);

        // Then
        assertTrue(retrievedMediaCount.isEmpty(), "Should return empty map when media count doesn't exist");
    }

    @Test
    @DisplayName("Should delete media count successfully")
    protected void shouldDeleteMediaCount() {
        // Given
        UserId testUserId = new UserId("test-user");
        Map<String, Integer> mediaCount = Map.of("image1", 3, "video1", 2, "image2", 5);
        repository.save(testUserId, mediaCount);

        // When
        repository.delete(testUserId);

        // Then
        Map<String, Integer> retrievedMediaCount = repository.find(testUserId);
        assertTrue(retrievedMediaCount.isEmpty(), "Media count should be empty after deletion");
    }

     @Test
    @DisplayName("Should increment counts (including duplicates) and persist")
    protected void shouldIncrementCountsAndPersist() {
        // Given
        UserId testUserId = new UserId("test-user");
        // Start empty (no prior save)

        // When: increment with duplicates (imgA twice)
        Map<String, Integer> returned =
            repository.increment(testUserId, List.of("imgA", "imgB", "imgA"));

        // Then: returned map shows only the updated keys with their new counts
        assertEquals(2, returned.get("imgA"));
        assertEquals(1, returned.get("imgB"));
        assertEquals(2, returned.size(), "Only updated keys should be present in return map");

        // And persisted state matches expected totals
        Map<String, Integer> persisted = repository.find(testUserId);
        assertEquals(2, persisted.get("imgA"));
        assertEquals(1, persisted.get("imgB"));
        assertEquals(2, persisted.size(), "Persisted map should only contain the incremented keys");
    }

    @Test
    @DisplayName("Should decrement counts, remove zeroed entries, return deletables, and persist")
    protected void shouldDecrementCountsAndReturnDeletables() {
        // Given
        UserId testUserId = new UserId("test-user");
        repository.save(testUserId, Map.of(
            "imgA", 2,
            "imgB", 1,
            "imgC", 3
        ));

        // When: decrement imgA once (=>1), imgB once (=>0 -> remove), imgC twice (=>1)
        List<String> deletables = repository.decrementAndReturnDeletables(
            testUserId, List.of("imgA", "imgB", "imgC", "imgC")
        );

        // Then: only imgB should be deletable (reached 0)
        assertEquals(1, deletables.size(), "Exactly one key should be deletable");
        assertTrue(deletables.contains("imgB"));

        // And persisted state reflects removals and updated counts
        Map<String, Integer> persisted = repository.find(testUserId);
        assertFalse(persisted.containsKey("imgB"), "imgB must be removed after reaching 0");
        assertEquals(1, persisted.get("imgA"));
        assertEquals(1, persisted.get("imgC"));
        assertEquals(2, persisted.size(), "Only imgA and imgC should remain");
    }

}
