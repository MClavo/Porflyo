package com.porflyo.ports;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import com.porflyo.data.SlotMetricsTestData;
import com.porflyo.dto.DetailSlot;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.ProjectMetricsWithId;

/**
 * Contract test for SlotMetricsRepository implementations.
 * Defines the expected behavior for all SlotMetricsRepository implementations.
 */
public abstract class SlotMetricsRepositoryContract {

    protected SlotMetricsRepository repository;
    protected final PortfolioId testPortfolioId = SlotMetricsTestData.DEFAULT_PORTFOLIO_ID;
    protected final PortfolioId differentPortfolioId = SlotMetricsTestData.DIFFERENT_PORTFOLIO_ID;

    protected SlotMetricsRepositoryContract(SlotMetricsRepository repository) {
        this.repository = repository;
    }

    @AfterEach
    void cleanUp() {
        // Clean up after each test to ensure isolation
        repository.deleteAllMetrics(testPortfolioId);
        repository.deleteAllMetrics(differentPortfolioId);
    }

    // ────────────────────── SAVE TODAY METRICS TESTS ──────────────────────

    @Test
    @DisplayName("Should save today's heatmap and project metrics successfully")
    protected void shouldSaveTodayMetricsSuccessfully() {
        // Given
        PortfolioHeatmap heatmap = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> projects = SlotMetricsTestData.TODAY_PROJECTS;

        // When
        assertDoesNotThrow(() -> repository.saveTodayMetrics(testPortfolioId, heatmap, projects));

        // Then
        Optional<DetailSlot> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "Today's metrics should be saved and retrievable");
        
        DetailSlot saved = retrieved.get();
        assertEquals(projects.size(), saved.projects().size());
    }

    @Test
    @DisplayName("Should handle empty project metrics list when saving")
    protected void shouldHandleEmptyProjectMetricsWhenSaving() {
        // Given
        PortfolioHeatmap heatmap = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> emptyProjects = SlotMetricsTestData.EMPTY_PROJECTS;

        // When
        assertDoesNotThrow(() -> repository.saveTodayMetrics(testPortfolioId, heatmap, emptyProjects));

        // Then
        Optional<DetailSlot> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "Metrics with empty projects should be saved");
        
        DetailSlot saved = retrieved.get();
        assertTrue(saved.projects().isEmpty(), "Project metrics should be empty");
        assertEquals(heatmap.version(), saved.heatmap().version());
    }

    @Test
    @DisplayName("Should overwrite today's metrics when saving multiple times")
    protected void shouldOverwriteTodayMetricsWhenSavingMultipleTimes() {
        // Given
        PortfolioHeatmap firstHeatmap = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> firstProjects = SlotMetricsTestData.TODAY_PROJECTS;
        
        PortfolioHeatmap secondHeatmap = new PortfolioHeatmap(
            "2.0.0", // Different version
            8,
            List.of(0, 1, 2, 3, 4, 5, 6, 7),
            List.of(100, 200, 300, 400, 500, 600, 700, 800),
            List.of(50, 60, 63, 45, 55, 35, 40, 30)
        );
        List<ProjectMetricsWithId> secondProjects = List.of(
            new ProjectMetricsWithId(99, 9999999, 999, 99, 99)
        );

        // When
        repository.saveTodayMetrics(testPortfolioId, firstHeatmap, firstProjects);
        repository.saveTodayMetrics(testPortfolioId, secondHeatmap, secondProjects);

        // Then
        Optional<DetailSlot> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "Latest metrics should be available");
        
        DetailSlot saved = retrieved.get();
        assertEquals("2.0.0", saved.heatmap().version(), "Should contain the latest version");
        assertEquals(1, saved.projects().size(), "Should contain the latest project count");
        assertEquals(Integer.valueOf(99), saved.projects().get(0).id(), "Should contain the latest project data");
    }

    // ────────────────────── GET TODAY METRICS TESTS ──────────────────────

    @Test
    @DisplayName("Should return empty when no today's metrics exist")
    protected void shouldReturnEmptyWhenNoTodayMetricsExist() {
        // Given
        // No metrics saved

        // When
        Optional<DetailSlot> result = repository.getTodayMetrics(testPortfolioId);

        // Then
        assertFalse(result.isPresent(), "Should return empty when no metrics exist");
    }

    @Test
    @DisplayName("Should retrieve today's metrics successfully")
    protected void shouldRetrieveTodayMetricsSuccessfully() {
        // Given
        PortfolioHeatmap heatmap = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> projects = SlotMetricsTestData.TODAY_PROJECTS;
        repository.saveTodayMetrics(testPortfolioId, heatmap, projects);

        // When
        Optional<DetailSlot> result = repository.getTodayMetrics(testPortfolioId);

        // Then
        assertTrue(result.isPresent(), "Today's metrics should be retrievable");
        
        DetailSlot retrieved = result.get();
        assertEquals(LocalDate.now(), retrieved.date());
        assertEquals(heatmap.version(), retrieved.heatmap().version());
        assertEquals(projects.size(), retrieved.projects().size());
    }

    @Test
    @DisplayName("Should preserve all heatmap components through storage and retrieval")
    protected void shouldPreserveAllHeatmapComponentsThroughStorageAndRetrieval() {
        // Given
        PortfolioHeatmap complexHeatmap = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> projects = SlotMetricsTestData.TODAY_PROJECTS;

        // When
        repository.saveTodayMetrics(testPortfolioId, complexHeatmap, projects);

        // Then
        Optional<DetailSlot> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "Complex heatmap should be found");

        PortfolioHeatmap saved = retrieved.get().heatmap();
        
        // Verify all heatmap components
        assertEquals(complexHeatmap.version(), saved.version());
        assertEquals(complexHeatmap.columns(), saved.columns());
        assertEquals(complexHeatmap.Indexes(), saved.Indexes());
        assertEquals(complexHeatmap.Values(), saved.Values());
        assertEquals(complexHeatmap.Counts(), saved.Counts());
    }

    @Test
    @DisplayName("Should preserve all project components through storage and retrieval")
    protected void shouldPreserveAllProjectComponentsThroughStorageAndRetrieval() {
        // Given
        PortfolioHeatmap heatmap = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> complexProjects = SlotMetricsTestData.TODAY_PROJECTS;

        // When
        repository.saveTodayMetrics(testPortfolioId, heatmap, complexProjects);

        // Then
        Optional<DetailSlot> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "Complex projects should be found");

        List<ProjectMetricsWithId> saved = retrieved.get().projects();
        assertEquals(complexProjects.size(), saved.size());
        
        for (int i = 0; i < complexProjects.size(); i++) {
            ProjectMetricsWithId expected = complexProjects.get(i);
            ProjectMetricsWithId actual = saved.get(i);
            
            assertEquals(expected.id(), actual.id());
            assertEquals(expected.viewTime(), actual.viewTime());
            assertEquals(expected.exposures(), actual.exposures());
            assertEquals(expected.codeViews(), actual.codeViews());
            assertEquals(expected.liveViews(), actual.liveViews());
        }
    }

    // ────────────────────── GET ALL METRICS TESTS ──────────────────────

    @Test
    @DisplayName("Should return empty list when no metrics exist")
    protected void shouldReturnEmptyListWhenNoMetricsExist() {
        // Given
        // No metrics saved

        // When
        List<DetailSlot> result = repository.getAllMetrics(testPortfolioId);

        // Then
        assertTrue(result.isEmpty(), "Should return empty list when no metrics exist");
    }

    @Test
    @DisplayName("Should retrieve saved metrics for today's slot")
    protected void shouldRetrieveSavedMetricsForTodaySlot() {
        // Given
        PortfolioHeatmap heatmap = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> projects = SlotMetricsTestData.TODAY_PROJECTS;
        
        // When
        repository.saveTodayMetrics(testPortfolioId, heatmap, projects);
        List<DetailSlot> result = repository.getAllMetrics(testPortfolioId);

        // Then
        assertFalse(result.isEmpty(), "Should retrieve saved metrics");
        assertEquals(1, result.size(), "Should retrieve today's metrics in slot");
        assertEquals(LocalDate.now(), result.get(0).date(), "Should contain today's date");
    }

    @Test
    @DisplayName("Should handle single saved metric correctly")
    protected void shouldHandleSingleSavedMetricCorrectly() {
        // Given
        PortfolioHeatmap heatmap = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> projects = SlotMetricsTestData.TODAY_PROJECTS;
        repository.saveTodayMetrics(testPortfolioId, heatmap, projects);

        // When
        List<DetailSlot> result = repository.getAllMetrics(testPortfolioId);

        // Then
        assertEquals(1, result.size(), "Should retrieve the single saved metric");
        DetailSlot retrieved = result.get(0);
        assertEquals(heatmap.version(), retrieved.heatmap().version());
    }

    // ────────────────────── DELETE ALL METRICS TESTS ──────────────────────

    @Test
    @DisplayName("Should delete all metrics for a portfolio")
    protected void shouldDeleteAllMetricsForPortfolio() {
        // Given
        PortfolioHeatmap heatmap = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> projects = SlotMetricsTestData.TODAY_PROJECTS;
        repository.saveTodayMetrics(testPortfolioId, heatmap, projects);
        
        // Verify metrics exist
        assertTrue(repository.getTodayMetrics(testPortfolioId).isPresent());

        // When
        assertDoesNotThrow(() -> repository.deleteAllMetrics(testPortfolioId));

        // Then
        assertFalse(repository.getTodayMetrics(testPortfolioId).isPresent(), 
            "Today's metrics should be deleted");
        assertTrue(repository.getAllMetrics(testPortfolioId).isEmpty(), 
            "All metrics should be deleted");
    }

    @Test
    @DisplayName("Should delete only specified portfolio's metrics")
    protected void shouldDeleteOnlySpecifiedPortfolioMetrics() {
        // Given
        // Save metrics for first portfolio
        PortfolioHeatmap heatmap1 = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> projects1 = SlotMetricsTestData.TODAY_PROJECTS;
        repository.saveTodayMetrics(testPortfolioId, heatmap1, projects1);
        
        // Save metrics for second portfolio
        PortfolioHeatmap heatmap2 = SlotMetricsTestData.DIFFERENT_PORTFOLIO_HEATMAP;
        List<ProjectMetricsWithId> projects2 = SlotMetricsTestData.DIFFERENT_PORTFOLIO_PROJECTS;
        repository.saveTodayMetrics(testPortfolioId, heatmap2, projects2);

        // When
        repository.deleteAllMetrics(testPortfolioId);

        // Then
        assertFalse(repository.getTodayMetrics(testPortfolioId).isPresent(), 
            "First portfolio's metrics should be deleted");
        assertTrue(repository.getTodayMetrics(differentPortfolioId).isPresent(), 
            "Second portfolio's metrics should remain");
    }

    @Test
    @DisplayName("Should handle deletion when no metrics exist")
    protected void shouldHandleDeletionWhenNoMetricsExist() {
        // Given
        // No metrics saved

        // When & Then
        assertDoesNotThrow(() -> repository.deleteAllMetrics(testPortfolioId), 
            "Should handle deletion gracefully when no metrics exist");
    }

    // ────────────────────── CROSS-FUNCTIONALITY TESTS ──────────────────────

    @Test
    @DisplayName("Should handle multiple portfolios independently")
    protected void shouldHandleMultiplePortfoliosIndependently() {
        // Given
        PortfolioHeatmap heatmap1 = SlotMetricsTestData.TODAY_HEATMAP;
        List<ProjectMetricsWithId> projects1 = SlotMetricsTestData.TODAY_PROJECTS;
        
        PortfolioHeatmap heatmap2 = SlotMetricsTestData.DIFFERENT_PORTFOLIO_HEATMAP;
        List<ProjectMetricsWithId> projects2 = SlotMetricsTestData.DIFFERENT_PORTFOLIO_PROJECTS;

        // When
        repository.saveTodayMetrics(testPortfolioId, heatmap1, projects1);
        repository.saveTodayMetrics(testPortfolioId, heatmap2, projects2);

        // Then
        Optional<DetailSlot> result1 = repository.getTodayMetrics(testPortfolioId);
        Optional<DetailSlot> result2 = repository.getTodayMetrics(differentPortfolioId);
        
        assertTrue(result1.isPresent(), "First portfolio's metrics should exist");
        assertTrue(result2.isPresent(), "Second portfolio's metrics should exist");
        
        assertEquals(heatmap1.version(), result1.get().heatmap().version());
        assertEquals(heatmap2.version(), result2.get().heatmap().version());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("getTestScenarios")
    @DisplayName("Should handle various slot metric scenarios")
    protected void shouldHandleVariousSlotMetricScenarios(String scenarioName, DetailSlot testSlot) {
        // Given
        PortfolioHeatmap heatmap = testSlot.heatmap();
        List<ProjectMetricsWithId> projects = testSlot.projects();

        // When
        repository.saveTodayMetrics(testPortfolioId, heatmap, projects);

        // Then
        Optional<DetailSlot> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "Metrics should be saved and retrievable for: " + scenarioName);
        
        DetailSlot saved = retrieved.get(); 
        assertEquals(heatmap.version(), saved.heatmap().version());
        assertEquals(projects.size(), saved.projects().size());
    }

    @Test
    @DisplayName("Should handle zero-value metrics correctly")
    protected void shouldHandleZeroValueMetricsCorrectly() {
        // Given
        PortfolioHeatmap zeroHeatmap = SlotMetricsTestData.ZERO_VALUES_HEATMAP;
        List<ProjectMetricsWithId> zeroProjects = SlotMetricsTestData.ZERO_VALUES_PROJECTS;

        // When
        repository.saveTodayMetrics(testPortfolioId, zeroHeatmap, zeroProjects);

        // Then
        Optional<DetailSlot> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "Zero-value metrics should be saved");
        
        DetailSlot saved = retrieved.get();
        assertEquals(zeroHeatmap.Values(), saved.heatmap().Values());
        assertEquals(zeroHeatmap.Counts(), saved.heatmap().Counts());
        
        for (ProjectMetricsWithId project : saved.projects()) {
            assertEquals(Integer.valueOf(0), project.viewTime());
            assertEquals(Integer.valueOf(0), project.exposures());
            assertEquals(Integer.valueOf(0), project.codeViews());
            assertEquals(Integer.valueOf(0), project.liveViews());
        }
    }

    @Test
    @DisplayName("Should handle high-value metrics correctly")
    protected void shouldHandleHighValueMetricsCorrectly() {
        // Given
        PortfolioHeatmap highHeatmap = SlotMetricsTestData.HIGH_VALUES_HEATMAP;
        List<ProjectMetricsWithId> highProjects = SlotMetricsTestData.HIGH_VALUES_PROJECTS;

        // When
        repository.saveTodayMetrics(testPortfolioId, highHeatmap, highProjects);

        // Then
        Optional<DetailSlot> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "High-value metrics should be saved");
        
        DetailSlot saved = retrieved.get();
        assertEquals(highHeatmap.Values(), saved.heatmap().Values());
        assertEquals(highProjects.size(), saved.projects().size());
        
        // Verify some high values are preserved (within bit limits)
        assertTrue(saved.heatmap().Values().stream().anyMatch(v -> v > 50));
        assertTrue(saved.projects().stream().anyMatch(p -> p.viewTime() > 50000000));
    }

    // ────────────────────── UTILITY METHODS ──────────────────────

    /**
     * Provides test data for parameterized tests.
     * @return Stream of test scenario parameters
     */
    public static List<Object[]> TEST_SCENARIOS() {
        return SlotMetricsTestData.TEST_SCENARIOS;
    }

    /**
     * Static method for JUnit parameterized tests.
     */
    protected static List<Object[]> getTestScenarios() {
        return SlotMetricsTestData.TEST_SCENARIOS;
    }
}
