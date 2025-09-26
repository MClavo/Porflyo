package com.porflyo.ports;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

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

    // ────────────────────────── Historical Metrics Tests ──────────────────────────

    @Test
    @DisplayName("Should save and retrieve multiple months of metrics")
    protected void shouldSaveAndRetrieveMultipleMonthsOfMetrics() {
        // Given
        List<PortfolioMetrics> allMetrics = MetricsTestData.ALL_PORTFOLIO_METRICS;
        
        // When
        allMetrics.forEach(repository::saveTodayMetrics);

        // Then
        List<PortfolioMetrics> retrievedMetrics = repository.findPortfolioMetrics(testPortfolioId, 4);
        
        assertFalse(retrievedMetrics.isEmpty(), "Should retrieve historical metrics");
        assertTrue(retrievedMetrics.size() >= allMetrics.size(), 
                "Should retrieve all saved metrics");

        // Verify metrics are sorted by date (most recent first)
        LocalDate previousDate = null;
        for (PortfolioMetrics metrics : retrievedMetrics) {
            if (previousDate != null) {
                assertTrue(metrics.date().isBefore(previousDate) || metrics.date().isEqual(previousDate),
                        "Metrics should be sorted by date in descending order");
            }
            previousDate = metrics.date();
        }
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 2, 3, 4})
    @DisplayName("Should respect monthsBack parameter in findPortfolioMetrics")
    protected void shouldRespectMonthsBackParameter(int monthsBack) {
        // Given
        List<PortfolioMetrics> allMetrics = MetricsTestData.ALL_PORTFOLIO_METRICS;
        allMetrics.forEach(repository::saveTodayMetrics);

        // When
        List<PortfolioMetrics> retrievedMetrics = repository.findPortfolioMetrics(testPortfolioId, monthsBack);

        // Then
        assertFalse(retrievedMetrics.isEmpty(), "Should retrieve metrics for monthsBack=" + monthsBack);
        
        // Verify all retrieved metrics are within the specified time range
        LocalDate cutoffDate = YearMonth.now().minusMonths(monthsBack - 1).atDay(1);
        for (PortfolioMetrics metrics : retrievedMetrics) {
            assertTrue(metrics.date().isAfter(cutoffDate.minusDays(1)),
                    String.format("Metrics date %s should be after cutoff %s for monthsBack=%d", 
                            metrics.date(), cutoffDate, monthsBack));
        }
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 1, 2, 3})
    @DisplayName("Should retrieve metrics for specific month in findPortfolioMetricsOneMonth")
    protected void shouldRetrieveMetricsForSpecificMonth(int monthsBack) {
        // Given
        List<PortfolioMetrics> allMetrics = MetricsTestData.ALL_PORTFOLIO_METRICS;
        allMetrics.forEach(repository::saveTodayMetrics);

        // When
        List<PortfolioMetrics> retrievedMetrics = repository.findPortfolioMetricsOneMonth(testPortfolioId, monthsBack);

        // Then
        if (!retrievedMetrics.isEmpty()) {
            YearMonth targetMonth = YearMonth.now().minusMonths(monthsBack);
            
            for (PortfolioMetrics metrics : retrievedMetrics) {
                YearMonth metricsMonth = YearMonth.from(metrics.date());
                assertEquals(targetMonth, metricsMonth,
                        String.format("All metrics should be from month %s for monthsBack=%d", 
                                targetMonth, monthsBack));
            }
        }
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