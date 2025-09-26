package com.porflyo.data;

import java.time.LocalDate;
import java.util.List;

import com.porflyo.dto.HeatmapSnapshot;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;
import com.porflyo.model.metrics.InteractionMetrics;

/**
 * Test data for Portfolio Metrics.
 * <p>
 * This class provides comprehensive test data for various scenarios including:
 * - Multiple months of metrics
 * - Different days within months
 * - Various metric values for testing edge cases
 * - Realistic data for integration testing
 * </p>
 */
public final class MetricsTestData {

    private MetricsTestData() {}

    // Default portfolio IDs for testing
    public static final PortfolioId DEFAULT_PORTFOLIO_ID = new PortfolioId("portfolio-123");
    public static final PortfolioId SECONDARY_PORTFOLIO_ID = new PortfolioId("portfolio-456");
    public static final PortfolioId EMPTY_PORTFOLIO_ID = new PortfolioId("portfolio-empty");

    // Current month metrics (Month 0 - Current)
    public static final PortfolioMetrics CURRENT_MONTH_DAY_1 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().withDayOfMonth(1),
        new Engagement(3600000, 150, 80, 5, 3, new Devices(120, 30)), // 1 hour active time, 150 views, 80 quality visits, 5 email copies, 3 social clicks
        new InteractionMetrics(85, 45000, 5000, 12), // avg score 85, avg scroll time 45s, TTFI sum 5s, TTFI count 12
        new ProjectMetrics(1800000, 25, 12, 8) // 30 min view time, 25 exposures, 12 code views, 8 live views
    );

    public static final PortfolioMetrics CURRENT_MONTH_DAY_5 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().withDayOfMonth(5),
        new Engagement(2700000, 200, 120, 8, 6, new Devices(160, 40)),
        new InteractionMetrics(78, 38000, 4500, 15),
        new ProjectMetrics(2100000, 30, 15, 10)
    );

    public static final PortfolioMetrics CURRENT_MONTH_DAY_10 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().withDayOfMonth(10),
        new Engagement(4200000, 180, 100, 3, 4, new Devices(140, 40)),
        new InteractionMetrics(90, 55000, 3800, 18),
        new ProjectMetrics(2400000, 35, 18, 12)
    );

    public static final PortfolioMetrics CURRENT_MONTH_DAY_15 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().withDayOfMonth(15),
        new Engagement(3300000, 220, 150, 7, 5, new Devices(180, 40)),
        new InteractionMetrics(82, 42000, 6200, 14),
        new ProjectMetrics(1950000, 28, 14, 9)
    );

    public static final PortfolioMetrics CURRENT_MONTH_DAY_20 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().withDayOfMonth(20),
        new Engagement(5100000, 300, 200, 12, 8, new Devices(240, 60)),
        new InteractionMetrics(95, 62000, 2900, 25),
        new ProjectMetrics(3000000, 45, 25, 18)
    );

    public static final PortfolioMetrics TODAY_METRICS = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now(),
        new Engagement(1800000, 75, 50, 2, 1, new Devices(60, 15)),
        new InteractionMetrics(70, 25000, 8000, 6),
        new ProjectMetrics(900000, 18, 6, 4)
    );

    // Previous month metrics (Month -1)
    public static final PortfolioMetrics PREVIOUS_MONTH_DAY_3 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(1).withDayOfMonth(3),
        new Engagement(2400000, 120, 85, 4, 2, new Devices(90, 30)),
        new InteractionMetrics(75, 35000, 7200, 10),
        new ProjectMetrics(1500000, 22, 10, 6)
    );

    public static final PortfolioMetrics PREVIOUS_MONTH_DAY_12 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(1).withDayOfMonth(12),
        new Engagement(3900000, 280, 180, 9, 6, new Devices(220, 60)),
        new InteractionMetrics(88, 48000, 4100, 20),
        new ProjectMetrics(2700000, 38, 20, 14)
    );

    public static final PortfolioMetrics PREVIOUS_MONTH_DAY_25 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(1).withDayOfMonth(25),
        new Engagement(4800000, 350, 250, 15, 9, new Devices(280, 70)),
        new InteractionMetrics(92, 58000, 3200, 28),
        new ProjectMetrics(3300000, 48, 28, 22)
    );

    // Two months ago metrics (Month -2)
    public static final PortfolioMetrics TWO_MONTHS_AGO_DAY_8 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(2).withDayOfMonth(8),
        new Engagement(3000000, 190, 130, 6, 4, new Devices(150, 40)),
        new InteractionMetrics(80, 40000, 5500, 16),
        new ProjectMetrics(2000000, 32, 16, 11)
    );

    public static final PortfolioMetrics TWO_MONTHS_AGO_DAY_18 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(2).withDayOfMonth(18),
        new Engagement(4500000, 270, 200, 11, 7, new Devices(210, 60)),
        new InteractionMetrics(86, 52000, 4800, 22),
        new ProjectMetrics(2800000, 42, 22, 16)
    );

    // Three months ago metrics (Month -3)
    public static final PortfolioMetrics THREE_MONTHS_AGO_DAY_5 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(3).withDayOfMonth(5),
        new Engagement(2100000, 140, 95, 3, 2, new Devices(110, 30)),
        new InteractionMetrics(72, 32000, 6800, 12),
        new ProjectMetrics(1600000, 24, 12, 8)
    );

    public static final PortfolioMetrics THREE_MONTHS_AGO_DAY_22 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(3).withDayOfMonth(22),
        new Engagement(3600000, 230, 160, 8, 5, new Devices(180, 50)),
        new InteractionMetrics(84, 45000, 5200, 19),
        new ProjectMetrics(2500000, 35, 19, 13)
    );

    // Edge case metrics - Zero values
    public static final PortfolioMetrics ZERO_METRICS = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusDays(1),
        new Engagement(0, 0, 0, 0, 0, new Devices(0, 0)),
        new InteractionMetrics(0, 0, 0, 0),
        new ProjectMetrics(0, 0, 0, 0)
    );

    // Edge case metrics - High values
    public static final PortfolioMetrics HIGH_VALUE_METRICS = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusDays(2),
        new Engagement(86400000, 10000, 8000, 500, 200, new Devices(8000, 2000)), // 24 hours active, 10k views, 8k quality visits
        new InteractionMetrics(100, 3600000, 1000, 1000), // Max score 100, 1 hour scroll time, TTFI 1s, 1000 TTFI count
        new ProjectMetrics(14400000, 1500, 1000, 800) // 4 hours view time, 1500 exposures, high interactions
    );

    // Secondary portfolio metrics for multi-portfolio tests
    public static final PortfolioMetrics SECONDARY_PORTFOLIO_TODAY = new PortfolioMetrics(
        SECONDARY_PORTFOLIO_ID,
        LocalDate.now(),
        new Engagement(1200000, 50, 35, 1, 0, new Devices(40, 10)),
        new InteractionMetrics(65, 20000, 9000, 4),
        new ProjectMetrics(600000, 12, 4, 2)
    );

    // Collections for easy test usage
    public static final List<PortfolioMetrics> CURRENT_MONTH_METRICS = List.of(
        CURRENT_MONTH_DAY_1,
        CURRENT_MONTH_DAY_5,
        CURRENT_MONTH_DAY_10,
        CURRENT_MONTH_DAY_15,
        CURRENT_MONTH_DAY_20,
        TODAY_METRICS
    );

    public static final List<PortfolioMetrics> PREVIOUS_MONTH_METRICS = List.of(
        PREVIOUS_MONTH_DAY_3,
        PREVIOUS_MONTH_DAY_12,
        PREVIOUS_MONTH_DAY_25
    );

    public static final List<PortfolioMetrics> TWO_MONTHS_AGO_METRICS = List.of(
        TWO_MONTHS_AGO_DAY_8,
        TWO_MONTHS_AGO_DAY_18
    );

    public static final List<PortfolioMetrics> THREE_MONTHS_AGO_METRICS = List.of(
        THREE_MONTHS_AGO_DAY_5,
        THREE_MONTHS_AGO_DAY_22
    );

    public static final List<PortfolioMetrics> ALL_PORTFOLIO_METRICS = List.of(
        CURRENT_MONTH_DAY_1,
        CURRENT_MONTH_DAY_5,
        CURRENT_MONTH_DAY_10,
        CURRENT_MONTH_DAY_15,
        CURRENT_MONTH_DAY_20,
        TODAY_METRICS,
        PREVIOUS_MONTH_DAY_3,
        PREVIOUS_MONTH_DAY_12,
        PREVIOUS_MONTH_DAY_25,
        TWO_MONTHS_AGO_DAY_8,
        TWO_MONTHS_AGO_DAY_18,
        THREE_MONTHS_AGO_DAY_5,
        THREE_MONTHS_AGO_DAY_22
    );

    public static final List<PortfolioMetrics> EDGE_CASE_METRICS = List.of(
        ZERO_METRICS,
        HIGH_VALUE_METRICS
    );

    // Helper methods for creating custom test data
    public static PortfolioMetrics createMetricsForDate(PortfolioId portfolioId, LocalDate date, 
                                                       int views, int activeTime, int scrollScore) {
        return new PortfolioMetrics(
            portfolioId,
            date,
            new Engagement(activeTime, views, views * 2 / 3, 2, 1, new Devices(views * 3 / 4, views / 4)),
            new InteractionMetrics(scrollScore, activeTime / 100, 5000, views / 10),
            new ProjectMetrics(activeTime / 2, views / 5, views / 10, views / 15)
        );
    }

    public static List<PortfolioMetrics> createMetricsForMonth(PortfolioId portfolioId, LocalDate monthStart) {
        return List.of(
            createMetricsForDate(portfolioId, monthStart.withDayOfMonth(2), 100, 1800000, 75),
            createMetricsForDate(portfolioId, monthStart.withDayOfMonth(7), 150, 2700000, 80),
            createMetricsForDate(portfolioId, monthStart.withDayOfMonth(14), 200, 3600000, 85),
            createMetricsForDate(portfolioId, monthStart.withDayOfMonth(21), 180, 3000000, 82),
            createMetricsForDate(portfolioId, monthStart.withDayOfMonth(28), 220, 4200000, 88)
        );
    }

    // ────────────────────────── HeatmapSnapshot Test Data ──────────────────────────
    
    public static final HeatmapSnapshot TODAY_HEATMAP_SNAPSHOT = new HeatmapSnapshot(
        "1.0.0",
        12,
        List.of(0, 1, 2, 5, 8, 11),
        List.of(15, 25, 18, 30, 22, 35)
    );
    
    public static final HeatmapSnapshot UPDATED_HEATMAP_SNAPSHOT = new HeatmapSnapshot(
        "1.1.0", 
        12,
        List.of(1, 3, 6, 9),
        List.of(10, 40, 28, 16)
    );
    
    public static final HeatmapSnapshot EMPTY_HEATMAP_SNAPSHOT = new HeatmapSnapshot(
        "1.0.0",
        10,
        List.of(),
        List.of()
    );

    // ────────────────────────── ProjectMetricsWithId Test Data ──────────────────────────
    
    public static final List<ProjectMetricsWithId> TODAY_PROJECT_METRICS = List.of(
        new ProjectMetricsWithId(1, 1800000, 2500, 8, 5),
        new ProjectMetricsWithId(2, 2400000, 3200, 12, 7),
        new ProjectMetricsWithId(3, 1200000, 1800, 6, 3)
    );
    
    public static final List<ProjectMetricsWithId> UPDATED_PROJECT_METRICS = List.of(
        new ProjectMetricsWithId(1, 900000, 1200, 4, 2),  // Update existing
        new ProjectMetricsWithId(4, 1800000, 2000, 7, 4)  // New project
    );
    
    public static final List<ProjectMetricsWithId> EMPTY_PROJECT_METRICS = List.of();
    
    public static final List<ProjectMetricsWithId> NULL_VALUES_PROJECT_METRICS = List.of(
        new ProjectMetricsWithId(1, null, null, null, null),
        new ProjectMetricsWithId(2, 1500000, null, 5, null)
    );
}