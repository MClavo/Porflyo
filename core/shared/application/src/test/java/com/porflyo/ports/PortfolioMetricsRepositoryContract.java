package com.porflyo.ports;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import com.porflyo.data.MetricsTestData;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioMetrics;

/**
 * Contract tests for PortfolioMetricsRepository implementations.
 * <p>
 * This abstract test class defines the expected behavior for any implementation
 * of PortfolioMetricsRepository. Implementations should extend this class and
 * provide their specific repository instance.
 * </p>
 */
public abstract class PortfolioMetricsRepositoryContract {

    protected PortfolioMetricsRepository repository;

    protected PortfolioMetricsRepositoryContract(PortfolioMetricsRepository repository) {
        this.repository = repository;
    }

    // Test data
    private final PortfolioId testPortfolioId = MetricsTestData.DEFAULT_PORTFOLIO_ID;
    private final PortfolioId secondaryPortfolioId = MetricsTestData.SECONDARY_PORTFOLIO_ID;
    private final PortfolioId emptyPortfolioId = MetricsTestData.EMPTY_PORTFOLIO_ID;

    @BeforeEach
    void cleanUp() {
        // Clean up any existing data before each test
        try {
            repository.deleteAllMetrics(testPortfolioId);
            repository.deleteAllMetrics(secondaryPortfolioId);
            repository.deleteAllMetrics(emptyPortfolioId);
        } catch (Exception e) {
            // Ignore if metrics don't exist
        }
    }

    // ────────────────────────── Basic Save and Retrieve Tests ──────────────────────────

    @Test
    @DisplayName("Should return empty when no metrics exist")
    protected void shouldReturnEmptyWhenNoMetricsExist() {
        // Given
        PortfolioId nonExistentPortfolioId = new PortfolioId("non-existent-portfolio");

        // When & Then
        assertTrue(repository.getTodayMetrics(nonExistentPortfolioId).isEmpty(),
                "Should return empty when no today metrics exist");
        assertTrue(repository.findPortfolioMetrics(nonExistentPortfolioId, 1).isEmpty(),
                "Should return empty list when no metrics exist for portfolio");
        assertTrue(repository.findPortfolioMetricsOneMonth(nonExistentPortfolioId, 0).isEmpty(),
                "Should return empty list when no metrics exist for one month");
    }

    @Test
    @DisplayName("Should save and retrieve today's metrics correctly")
    protected void shouldSaveAndRetrieveTodayMetrics() {
        // Given
        PortfolioMetrics todayMetrics = MetricsTestData.TODAY_METRICS;

        // When
        repository.saveTodayMetrics(todayMetrics);

        // Then
        Optional<PortfolioMetrics> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "Today's metrics should be found");

        PortfolioMetrics saved = retrieved.get();
        assertMetricsEquals(todayMetrics, saved);
    }

    @Test
    @DisplayName("Should overwrite today's metrics when saving multiple times")
    protected void shouldOverwriteTodayMetricsWhenSavingMultipleTimes() {
        // Given
        PortfolioMetrics firstMetrics = MetricsTestData.TODAY_METRICS;
        PortfolioMetrics updatedMetrics = MetricsTestData.createMetricsForDate(
                testPortfolioId, LocalDate.now(), 300, 5400000, 95);

        // When
        repository.saveTodayMetrics(firstMetrics);
        repository.saveTodayMetrics(updatedMetrics);

        // Then
        Optional<PortfolioMetrics> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "Today's metrics should be found");
        
        PortfolioMetrics saved = retrieved.get();
        assertMetricsEquals(updatedMetrics, saved);
        
        // Verify it's the updated values, not the first ones
        assertEquals(300, saved.engagement().views());
        assertEquals(95, saved.scroll().scoreTotal());
    }

    // ────────────────────────── Sharding Tests ──────────────────────────

    @Test
    @DisplayName("Should handle metrics across different shards within same month")
    protected void shouldHandleMetricsAcrossDifferentShardsInSameMonth() {
        // Given - Create metrics for different days in the current month that span multiple shards
        // Assuming 3 shards per month (days 1-11, 12-22, 23-31)
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();
        
        // Day 5 (shard 0), Day 15 (shard 1), Day 25 (shard 2)
        PortfolioMetrics day5Metrics = MetricsTestData.createMetricsForDate(
                testPortfolioId, LocalDate.of(currentYear, currentMonth, 5), 100, 1800000, 75);
        PortfolioMetrics day15Metrics = MetricsTestData.createMetricsForDate(
                testPortfolioId, LocalDate.of(currentYear, currentMonth, 15), 200, 3600000, 85);
        PortfolioMetrics day25Metrics = MetricsTestData.createMetricsForDate(
                testPortfolioId, LocalDate.of(currentYear, currentMonth, 25), 300, 5400000, 95);

        // When
        repository.saveTodayMetrics(day5Metrics);
        repository.saveTodayMetrics(day15Metrics);
        repository.saveTodayMetrics(day25Metrics);

        // Then - All metrics should be retrievable
        List<PortfolioMetrics> retrievedMetrics = repository.findPortfolioMetricsOneMonth(testPortfolioId, 0);
        
        assertFalse(retrievedMetrics.isEmpty(), "Should retrieve metrics from multiple shards");
        assertTrue(retrievedMetrics.size() >= 3, "Should retrieve all saved metrics across shards");
        
        // Verify each specific metric can be found
        Optional<PortfolioMetrics> foundDay5 = retrievedMetrics.stream()
                .filter(m -> m.date().getDayOfMonth() == 5)
                .findFirst();
        Optional<PortfolioMetrics> foundDay15 = retrievedMetrics.stream()
                .filter(m -> m.date().getDayOfMonth() == 15)
                .findFirst();
        Optional<PortfolioMetrics> foundDay25 = retrievedMetrics.stream()
                .filter(m -> m.date().getDayOfMonth() == 25)
                .findFirst();
        
        assertTrue(foundDay5.isPresent(), "Should find metrics for day 5 (shard 0)");
        assertTrue(foundDay15.isPresent(), "Should find metrics for day 15 (shard 1)");
        assertTrue(foundDay25.isPresent(), "Should find metrics for day 25 (shard 2)");
        
        // Verify values are correct
        assertEquals(100, foundDay5.get().engagement().views(), "Day 5 metrics should be correct");
        assertEquals(200, foundDay15.get().engagement().views(), "Day 15 metrics should be correct");
        assertEquals(300, foundDay25.get().engagement().views(), "Day 25 metrics should be correct");
    }

    @Test
    @DisplayName("Should handle multiple saves to same shard without data loss")
    protected void shouldHandleMultipleSavesToSameShard() {
        // Given - Create multiple metrics for days within the same shard (days 1-11)
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();
        
        PortfolioMetrics day3Metrics = MetricsTestData.createMetricsForDate(
                testPortfolioId, LocalDate.of(currentYear, currentMonth, 3), 150, 2700000, 80);
        PortfolioMetrics day7Metrics = MetricsTestData.createMetricsForDate(
                testPortfolioId, LocalDate.of(currentYear, currentMonth, 7), 250, 4500000, 90);
        PortfolioMetrics day10Metrics = MetricsTestData.createMetricsForDate(
                testPortfolioId, LocalDate.of(currentYear, currentMonth, 10), 350, 6300000, 88);

        // When - Save all metrics (they should all be in shard 0)
        repository.saveTodayMetrics(day3Metrics);
        repository.saveTodayMetrics(day7Metrics);
        repository.saveTodayMetrics(day10Metrics);

        // Then - All three metrics should be retrievable
        List<PortfolioMetrics> retrievedMetrics = repository.findPortfolioMetricsOneMonth(testPortfolioId, 0);
        
        assertFalse(retrievedMetrics.isEmpty(), "Should retrieve metrics from same shard");
        
        // Verify all three days are present
        long countInShard = retrievedMetrics.stream()
                .filter(m -> m.date().getDayOfMonth() >= 1 && m.date().getDayOfMonth() <= 11)
                .count();
        
        assertTrue(countInShard >= 3, "Should have at least 3 metrics in shard 0 (days 1-11)");
        
        // Verify each specific metric
        Optional<PortfolioMetrics> foundDay3 = retrievedMetrics.stream()
                .filter(m -> m.date().getDayOfMonth() == 3)
                .findFirst();
        Optional<PortfolioMetrics> foundDay7 = retrievedMetrics.stream()
                .filter(m -> m.date().getDayOfMonth() == 7)
                .findFirst();
        Optional<PortfolioMetrics> foundDay10 = retrievedMetrics.stream()
                .filter(m -> m.date().getDayOfMonth() == 10)
                .findFirst();
        
        assertTrue(foundDay3.isPresent(), "Should find metrics for day 3");
        assertTrue(foundDay7.isPresent(), "Should find metrics for day 7");
        assertTrue(foundDay10.isPresent(), "Should find metrics for day 10");
        
        assertEquals(150, foundDay3.get().engagement().views(), "Day 3 metrics should be preserved");
        assertEquals(250, foundDay7.get().engagement().views(), "Day 7 metrics should be preserved");
        assertEquals(350, foundDay10.get().engagement().views(), "Day 10 metrics should be preserved");
    }

    // ────────────────────────── Edge Cases and Data Integrity Tests ──────────────────────────

    @Test
    @DisplayName("Should handle zero-value metrics correctly")
    protected void shouldHandleZeroValueMetricsCorrectly() {
        // Given
        PortfolioMetrics zeroMetrics = MetricsTestData.ZERO_METRICS;

        // When
        repository.saveTodayMetrics(zeroMetrics);

        // Then
        List<PortfolioMetrics> retrieved = repository.findPortfolioMetrics(testPortfolioId, 1);
        assertFalse(retrieved.isEmpty(), "Should retrieve zero-value metrics");
        
        PortfolioMetrics saved = retrieved.get(0);
        assertMetricsEquals(zeroMetrics, saved);
        
        // Verify zero values are preserved
        assertEquals(0, saved.engagement().views());
        assertEquals(0, saved.engagement().activeTime());
        assertEquals(0, saved.scroll().scoreTotal());
        assertEquals(0, saved.cumProjects().viewTime());
    }

    @Test
    @DisplayName("Should handle high-value metrics correctly")
    protected void shouldHandleHighValueMetricsCorrectly() {
        // Given
        PortfolioMetrics highValueMetrics = MetricsTestData.HIGH_VALUE_METRICS;

        // When
        repository.saveTodayMetrics(highValueMetrics);

        // Then
        List<PortfolioMetrics> retrieved = repository.findPortfolioMetrics(testPortfolioId, 1);
        assertFalse(retrieved.isEmpty(), "Should retrieve high-value metrics");
        
        PortfolioMetrics saved = retrieved.get(0);
        assertMetricsEquals(highValueMetrics, saved);
        
        // Verify high values are preserved
        assertEquals(10000, saved.engagement().views());
        assertEquals(86400000, saved.engagement().activeTime()); // 24 hours
        assertEquals(100, saved.scroll().scoreTotal());
        assertEquals(14400000, saved.cumProjects().viewTime()); // 4 hours
    }

    @Test
    @DisplayName("Should preserve all metric components through storage and retrieval")
    protected void shouldPreserveAllMetricComponentsThroughStorageAndRetrieval() {
        // Given
        PortfolioMetrics complexMetrics = MetricsTestData.TODAY_METRICS;

        // When
        repository.saveTodayMetrics(complexMetrics);

        // Then
        Optional<PortfolioMetrics> retrieved = repository.getTodayMetrics(testPortfolioId);
        assertTrue(retrieved.isPresent(), "Complex metrics should be found");

        PortfolioMetrics saved = retrieved.get();
        
        // Verify all engagement components
        assertEquals(complexMetrics.engagement().activeTime(), saved.engagement().activeTime());
        assertEquals(complexMetrics.engagement().views(), saved.engagement().views());
        assertEquals(complexMetrics.engagement().qualityVisits(), saved.engagement().qualityVisits());
        assertEquals(complexMetrics.engagement().emailCopies(), saved.engagement().emailCopies());
        assertEquals(complexMetrics.engagement().socialClicks(), saved.engagement().socialClicks());
        assertEquals(complexMetrics.engagement().devices().desktopViews(), saved.engagement().devices().desktopViews());
        assertEquals(complexMetrics.engagement().devices().mobileTabletViews(), saved.engagement().devices().mobileTabletViews());
        
        // Verify all interaction components
        assertEquals(complexMetrics.scroll().scoreTotal(), saved.scroll().scoreTotal());
        assertEquals(complexMetrics.scroll().scrollTimeTotal(), saved.scroll().scrollTimeTotal());
        assertEquals(complexMetrics.scroll().ttfiSumMs(), saved.scroll().ttfiSumMs());
        assertEquals(complexMetrics.scroll().ttfiCount(), saved.scroll().ttfiCount());
        
        // Verify all project components
        assertEquals(complexMetrics.cumProjects().viewTime(), saved.cumProjects().viewTime());
        assertEquals(complexMetrics.cumProjects().exposures(), saved.cumProjects().exposures());
        assertEquals(complexMetrics.cumProjects().codeViews(), saved.cumProjects().codeViews());
        assertEquals(complexMetrics.cumProjects().liveViews(), saved.cumProjects().liveViews());
    }

    // ────────────────────────── Multi-Portfolio Tests ──────────────────────────

    @Test
    @DisplayName("Should handle multiple portfolios independently")
    protected void shouldHandleMultiplePortfoliosIndependently() {
        // Given
        PortfolioMetrics metricsPortfolio1 = MetricsTestData.TODAY_METRICS;
        PortfolioMetrics metricsPortfolio2 = MetricsTestData.SECONDARY_PORTFOLIO_TODAY;

        // When
        repository.saveTodayMetrics(metricsPortfolio1);
        repository.saveTodayMetrics(metricsPortfolio2);

        // Then
        Optional<PortfolioMetrics> retrievedPortfolio1 = repository.getTodayMetrics(testPortfolioId);
        Optional<PortfolioMetrics> retrievedPortfolio2 = repository.getTodayMetrics(secondaryPortfolioId);

        assertTrue(retrievedPortfolio1.isPresent(), "First portfolio metrics should be found");
        assertTrue(retrievedPortfolio2.isPresent(), "Second portfolio metrics should be found");

        assertMetricsEquals(metricsPortfolio1, retrievedPortfolio1.get());
        assertMetricsEquals(metricsPortfolio2, retrievedPortfolio2.get());

        // Verify they have different values to ensure no cross-contamination
        assertNotEquals(retrievedPortfolio1.get().engagement().views(), 
                       retrievedPortfolio2.get().engagement().views(),
                       "Different portfolios should have different metrics");
    }

    // ────────────────────────── Delete Operations Tests ──────────────────────────

    @Test
    @DisplayName("Should delete all metrics for a portfolio")
    protected void shouldDeleteAllMetricsForPortfolio() {
        // Given
        List<PortfolioMetrics> allMetrics = MetricsTestData.ALL_PORTFOLIO_METRICS;
        allMetrics.forEach(repository::saveTodayMetrics);
        
        // Verify metrics exist before deletion
        List<PortfolioMetrics> beforeDeletion = repository.findPortfolioMetrics(testPortfolioId, 4);
        assertFalse(beforeDeletion.isEmpty(), "Metrics should exist before deletion");

        // When
        repository.deleteAllMetrics(testPortfolioId);

        // Then
        assertTrue(repository.getTodayMetrics(testPortfolioId).isEmpty(),
                "Today's metrics should be deleted");
        assertTrue(repository.findPortfolioMetrics(testPortfolioId, 4).isEmpty(),
                "All historical metrics should be deleted");
        assertTrue(repository.findPortfolioMetricsOneMonth(testPortfolioId, 0).isEmpty(),
                "Current month metrics should be deleted");
    }

    @Test
    @DisplayName("Should delete only specified portfolio's metrics")
    protected void shouldDeleteOnlySpecifiedPortfolioMetrics() {
        // Given
        PortfolioMetrics metricsPortfolio1 = MetricsTestData.TODAY_METRICS;
        PortfolioMetrics metricsPortfolio2 = MetricsTestData.SECONDARY_PORTFOLIO_TODAY;
        
        repository.saveTodayMetrics(metricsPortfolio1);
        repository.saveTodayMetrics(metricsPortfolio2);

        // When
        repository.deleteAllMetrics(testPortfolioId);

        // Then
        assertTrue(repository.getTodayMetrics(testPortfolioId).isEmpty(),
                "First portfolio metrics should be deleted");
        assertTrue(repository.getTodayMetrics(secondaryPortfolioId).isPresent(),
                "Second portfolio metrics should remain");
    }

    // ────────────────────────── Parameterized Tests for Different Scenarios ──────────────────────────

    static Stream<Arguments> metricsTestDataProvider() {
        return Stream.of(
            Arguments.of("Current Month Day 1", MetricsTestData.CURRENT_MONTH_DAY_1),
            Arguments.of("Current Month Day 5", MetricsTestData.CURRENT_MONTH_DAY_5),
            Arguments.of("Previous Month Day 3", MetricsTestData.PREVIOUS_MONTH_DAY_3),
            Arguments.of("Two Months Ago Day 8", MetricsTestData.TWO_MONTHS_AGO_DAY_8),
            Arguments.of("Zero Metrics", MetricsTestData.ZERO_METRICS),
            Arguments.of("High Value Metrics", MetricsTestData.HIGH_VALUE_METRICS)
        );
    }

    @ParameterizedTest
    @MethodSource("metricsTestDataProvider")
    @DisplayName("Should handle various metric scenarios")
    protected void shouldHandleVariousMetricScenarios(String scenarioName, PortfolioMetrics testMetrics) {
        // Given - test metrics from parameter

        // When
        repository.saveTodayMetrics(testMetrics);

        // Then
        List<PortfolioMetrics> retrieved = repository.findPortfolioMetrics(testPortfolioId, 6);
        assertFalse(retrieved.isEmpty(), "Should retrieve metrics for scenario: " + scenarioName);
        
        // Find our specific metrics in the results
        Optional<PortfolioMetrics> found = retrieved.stream()
                .filter(m -> m.date().equals(testMetrics.date()))
                .findFirst();
        
        assertTrue(found.isPresent(), "Should find specific metrics for scenario: " + scenarioName);
        assertMetricsEquals(testMetrics, found.get());
    }

    // ────────────────────────── Helper Methods ──────────────────────────

    private void assertMetricsEquals(PortfolioMetrics expected, PortfolioMetrics actual) {
        assertNotNull(actual, "Actual metrics should not be null");
        assertEquals(expected.portfolioId(), actual.portfolioId(), "Portfolio ID should match");
        assertEquals(expected.date(), actual.date(), "Date should match");
        
        // Engagement assertions
        assertEquals(expected.engagement().activeTime(), actual.engagement().activeTime(), 
                "Active time should match");
        assertEquals(expected.engagement().views(), actual.engagement().views(), 
                "Views should match");
        assertEquals(expected.engagement().qualityVisits(), actual.engagement().qualityVisits(), 
                "Quality visits should match");
        assertEquals(expected.engagement().emailCopies(), actual.engagement().emailCopies(), 
                "Email copies should match");
        assertEquals(expected.engagement().socialClicks(), actual.engagement().socialClicks(), 
                "Social clicks should match");
        assertEquals(expected.engagement().devices().desktopViews(), actual.engagement().devices().desktopViews(), 
                "Desktop views should match");
        assertEquals(expected.engagement().devices().mobileTabletViews(), actual.engagement().devices().mobileTabletViews(), 
                "Device views should match");
        
        // Interaction assertions
        assertEquals(expected.scroll().scoreTotal(), actual.scroll().scoreTotal(), 
                "Average scroll score should match");
        assertEquals(expected.scroll().scrollTimeTotal(), actual.scroll().scrollTimeTotal(), 
                "Average scroll time should match");
        assertEquals(expected.scroll().ttfiSumMs(), actual.scroll().ttfiSumMs(), 
                "TTFI sum should match");
        assertEquals(expected.scroll().ttfiCount(), actual.scroll().ttfiCount(), 
                "TTFI count should match");
        
        // Project assertions
        assertEquals(expected.cumProjects().viewTime(), actual.cumProjects().viewTime(), 
                "Project view time should match");
        assertEquals(expected.cumProjects().exposures(), actual.cumProjects().exposures(), 
                "Exposures should match");
        assertEquals(expected.cumProjects().codeViews(), actual.cumProjects().codeViews(), 
                "Code views should match");
        assertEquals(expected.cumProjects().liveViews(), actual.cumProjects().liveViews(), 
                "Live views should match");
    }

    private void assertNotEquals(Object expected, Object actual, String message) {
        assertFalse(expected.equals(actual), message);
    }
}