package com.porflyo.data;

import java.time.LocalDate;
import java.util.List;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ScrollMetrics;

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
        new Engagement(3600000, 150, 5, new Devices(120, 30)), // 1 hour active time, 150 views, 5 email copies
        new ScrollMetrics(85, 95, 45000, 60000), // Good engagement scores
        new ProjectMetrics(1800000, 5000, 12, 8) // 30 min view time, 5s TTFI, 12 code views, 8 live views
    );

    public static final PortfolioMetrics CURRENT_MONTH_DAY_5 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().withDayOfMonth(5),
        new Engagement(2700000, 200, 8, new Devices(160, 40)),
        new ScrollMetrics(78, 88, 38000, 52000),
        new ProjectMetrics(2100000, 4500, 15, 10)
    );

    public static final PortfolioMetrics CURRENT_MONTH_DAY_10 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().withDayOfMonth(10),
        new Engagement(4200000, 180, 3, new Devices(140, 40)),
        new ScrollMetrics(90, 98, 55000, 70000),
        new ProjectMetrics(2400000, 3800, 18, 12)
    );

    public static final PortfolioMetrics CURRENT_MONTH_DAY_15 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().withDayOfMonth(15),
        new Engagement(3300000, 220, 7, new Devices(180, 40)),
        new ScrollMetrics(82, 92, 42000, 58000),
        new ProjectMetrics(1950000, 6200, 14, 9)
    );

    public static final PortfolioMetrics CURRENT_MONTH_DAY_20 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().withDayOfMonth(20),
        new Engagement(5100000, 300, 12, new Devices(240, 60)),
        new ScrollMetrics(95, 100, 62000, 80000),
        new ProjectMetrics(3000000, 2900, 25, 18)
    );

    public static final PortfolioMetrics TODAY_METRICS = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now(),
        new Engagement(1800000, 75, 2, new Devices(60, 15)),
        new ScrollMetrics(70, 80, 25000, 35000),
        new ProjectMetrics(900000, 8000, 6, 4)
    );

    // Previous month metrics (Month -1)
    public static final PortfolioMetrics PREVIOUS_MONTH_DAY_3 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(1).withDayOfMonth(3),
        new Engagement(2400000, 120, 4, new Devices(90, 30)),
        new ScrollMetrics(75, 85, 35000, 48000),
        new ProjectMetrics(1500000, 7200, 10, 6)
    );

    public static final PortfolioMetrics PREVIOUS_MONTH_DAY_12 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(1).withDayOfMonth(12),
        new Engagement(3900000, 280, 9, new Devices(220, 60)),
        new ScrollMetrics(88, 96, 48000, 65000),
        new ProjectMetrics(2700000, 4100, 20, 14)
    );

    public static final PortfolioMetrics PREVIOUS_MONTH_DAY_25 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(1).withDayOfMonth(25),
        new Engagement(4800000, 350, 15, new Devices(280, 70)),
        new ScrollMetrics(92, 99, 58000, 75000),
        new ProjectMetrics(3300000, 3200, 28, 22)
    );

    // Two months ago metrics (Month -2)
    public static final PortfolioMetrics TWO_MONTHS_AGO_DAY_8 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(2).withDayOfMonth(8),
        new Engagement(3000000, 190, 6, new Devices(150, 40)),
        new ScrollMetrics(80, 90, 40000, 55000),
        new ProjectMetrics(2000000, 5500, 16, 11)
    );

    public static final PortfolioMetrics TWO_MONTHS_AGO_DAY_18 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(2).withDayOfMonth(18),
        new Engagement(4500000, 270, 11, new Devices(210, 60)),
        new ScrollMetrics(86, 94, 52000, 68000),
        new ProjectMetrics(2800000, 4800, 22, 16)
    );

    // Three months ago metrics (Month -3)
    public static final PortfolioMetrics THREE_MONTHS_AGO_DAY_5 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(3).withDayOfMonth(5),
        new Engagement(2100000, 140, 3, new Devices(110, 30)),
        new ScrollMetrics(72, 82, 32000, 44000),
        new ProjectMetrics(1600000, 6800, 12, 8)
    );

    public static final PortfolioMetrics THREE_MONTHS_AGO_DAY_22 = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusMonths(3).withDayOfMonth(22),
        new Engagement(3600000, 230, 8, new Devices(180, 50)),
        new ScrollMetrics(84, 91, 45000, 62000),
        new ProjectMetrics(2500000, 5200, 19, 13)
    );

    // Edge case metrics - Zero values
    public static final PortfolioMetrics ZERO_METRICS = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusDays(1),
        new Engagement(0, 0, 0, new Devices(0, 0)),
        new ScrollMetrics(0, 0, 0, 0),
        new ProjectMetrics(0, 0, 0, 0)
    );

    // Edge case metrics - High values
    public static final PortfolioMetrics HIGH_VALUE_METRICS = new PortfolioMetrics(
        DEFAULT_PORTFOLIO_ID,
        LocalDate.now().minusDays(2),
        new Engagement(86400000, 10000, 500, new Devices(8000, 2000)), // 24 hours active, 10k views
        new ScrollMetrics(100, 100, 3600000, 3600000), // Max scores, 1 hour scroll time
        new ProjectMetrics(14400000, 1000, 1000, 800) // 4 hours view time, 1s TTFI, high interactions
    );

    // Secondary portfolio metrics for multi-portfolio tests
    public static final PortfolioMetrics SECONDARY_PORTFOLIO_TODAY = new PortfolioMetrics(
        SECONDARY_PORTFOLIO_ID,
        LocalDate.now(),
        new Engagement(1200000, 50, 1, new Devices(40, 10)),
        new ScrollMetrics(65, 75, 20000, 30000),
        new ProjectMetrics(600000, 9000, 4, 2)
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
            new Engagement(activeTime, views, 2, new Devices(views * 3 / 4, views / 4)),
            new ScrollMetrics(scrollScore, scrollScore + 10, activeTime / 100, activeTime / 80),
            new ProjectMetrics(activeTime / 2, 5000, views / 10, views / 15)
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
}