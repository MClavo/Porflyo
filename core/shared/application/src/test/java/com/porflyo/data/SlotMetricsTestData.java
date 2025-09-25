package com.porflyo.data;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import com.porflyo.dto.DetailSlot;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.ProjectMetricsWithId;

/**
 * Test data for SlotMetricsRepository tests.
 * Provides consistent test scenarios for slot metrics functionality.
 */
public final class SlotMetricsTestData {

    public static final PortfolioId DEFAULT_PORTFOLIO_ID = new PortfolioId("slot-portfolio-123");
    public static final PortfolioId DIFFERENT_PORTFOLIO_ID = new PortfolioId("slot-portfolio-456");

    // ──────────────────────── HEATMAP TEST DATA ────────────────────────

    public static final PortfolioHeatmap TODAY_HEATMAP = new PortfolioHeatmap(
        DEFAULT_PORTFOLIO_ID,
        "1.0.0",
        12,
        Arrays.asList(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
        Arrays.asList(10, 20, 15, 30, 25, 18, 22, 35, 12, 28, 19, 33),
        Arrays.asList(5, 8, 6, 12, 9, 7, 10, 15, 4, 11, 8, 14)
    );

    public static final PortfolioHeatmap CURRENT_MONTH_DAY_20_HEATMAP = new PortfolioHeatmap(
        DEFAULT_PORTFOLIO_ID,
        "1.2.0",
        16,
        Arrays.asList(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
        Arrays.asList(45, 38, 52, 41, 67, 29, 55, 73, 36, 48, 61, 39, 44, 58, 31, 69),
        Arrays.asList(22, 18, 25, 20, 32, 14, 27, 35, 17, 23, 29, 19, 21, 28, 15, 33)
    );

    public static final PortfolioHeatmap PREVIOUS_MONTH_HEATMAP = new PortfolioHeatmap(
        DEFAULT_PORTFOLIO_ID,
        "0.9.5",
        8,
        Arrays.asList(0, 1, 2, 3, 4, 5, 6, 7),
        Arrays.asList(25, 18, 32, 27, 19, 41, 23, 38),
        Arrays.asList(12, 9, 15, 13, 8, 19, 11, 17)
    );

    public static final PortfolioHeatmap ZERO_VALUES_HEATMAP = new PortfolioHeatmap(
        DEFAULT_PORTFOLIO_ID,
        "1.0.0",
        4,
        Arrays.asList(0, 1, 2, 3),
        Arrays.asList(0, 0, 0, 0),
        Arrays.asList(0, 0, 0, 0)
    );

    public static final PortfolioHeatmap HIGH_VALUES_HEATMAP = new PortfolioHeatmap(
        DEFAULT_PORTFOLIO_ID,
        "2.0.0",
        20,
        Arrays.asList(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19),
        Arrays.asList(63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44),
        Arrays.asList(63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44)
    );

    public static final PortfolioHeatmap DIFFERENT_PORTFOLIO_HEATMAP = new PortfolioHeatmap(
        DIFFERENT_PORTFOLIO_ID,
        "1.1.0",
        6,
        Arrays.asList(0, 1, 2, 3, 4, 5),
        Arrays.asList(15, 25, 35, 20, 30, 40),
        Arrays.asList(8, 12, 16, 10, 14, 18)
    );

    // ────────────────────── PROJECT METRICS TEST DATA ──────────────────────

    public static final List<ProjectMetricsWithId> TODAY_PROJECTS = Arrays.asList(
        new ProjectMetricsWithId(1, 1800000, 2500, 8, 5),
        new ProjectMetricsWithId(2, 2400000, 3200, 12, 7),
        new ProjectMetricsWithId(3, 1200000, 1800, 6, 3)
    );

    public static final List<ProjectMetricsWithId> CURRENT_MONTH_DAY_20_PROJECTS = Arrays.asList(
        new ProjectMetricsWithId(1, 5400000, 1200, 25, 18),
        new ProjectMetricsWithId(2, 7200000, 800, 35, 22),
        new ProjectMetricsWithId(3, 3600000, 1500, 15, 12),
        new ProjectMetricsWithId(4, 4800000, 1000, 20, 14)
    );

    public static final List<ProjectMetricsWithId> PREVIOUS_MONTH_PROJECTS = Arrays.asList(
        new ProjectMetricsWithId(1, 3000000, 4500, 18, 10),
        new ProjectMetricsWithId(2, 1800000, 5200, 10, 6)
    );

    public static final List<ProjectMetricsWithId> ZERO_VALUES_PROJECTS = Arrays.asList(
        new ProjectMetricsWithId(1, 0, 0, 0, 0),
        new ProjectMetricsWithId(2, 0, 0, 0, 0)
    );

    public static final List<ProjectMetricsWithId> HIGH_VALUES_PROJECTS = Arrays.asList(
        new ProjectMetricsWithId(1, 86400000, 500, 1000, 800),
        new ProjectMetricsWithId(2, 72000000, 300, 800, 600),
        new ProjectMetricsWithId(3, 108000000, 200, 1200, 900),
        new ProjectMetricsWithId(4, 54000000, 700, 600, 400),
        new ProjectMetricsWithId(5, 144000000, 100, 1500, 1200)
    );

    public static final List<ProjectMetricsWithId> DIFFERENT_PORTFOLIO_PROJECTS = Arrays.asList(
        new ProjectMetricsWithId(1, 900000, 6000, 4, 2),
        new ProjectMetricsWithId(2, 1500000, 4500, 7, 4)
    );

    public static final List<ProjectMetricsWithId> EMPTY_PROJECTS = Arrays.asList();

    // ────────────────────── COMBINED DETAIL SLOTS ──────────────────────

    public static final DetailSlot TODAY_DETAIL_SLOT = new DetailSlot(
        LocalDate.now(),
        TODAY_HEATMAP,
        TODAY_PROJECTS
    );

    public static final DetailSlot CURRENT_MONTH_DAY_20_DETAIL_SLOT = new DetailSlot(
        LocalDate.now().withDayOfMonth(20),
        CURRENT_MONTH_DAY_20_HEATMAP,
        CURRENT_MONTH_DAY_20_PROJECTS
    );

    public static final DetailSlot PREVIOUS_MONTH_DETAIL_SLOT = new DetailSlot(
        LocalDate.now().minusMonths(1).withDayOfMonth(15),
        PREVIOUS_MONTH_HEATMAP,
        PREVIOUS_MONTH_PROJECTS
    );

    public static final DetailSlot ZERO_VALUES_DETAIL_SLOT = new DetailSlot(
        LocalDate.now().withDayOfMonth(25),
        ZERO_VALUES_HEATMAP,
        ZERO_VALUES_PROJECTS
    );

    public static final DetailSlot HIGH_VALUES_DETAIL_SLOT = new DetailSlot(
        LocalDate.now().withDayOfMonth(23),
        HIGH_VALUES_HEATMAP,
        HIGH_VALUES_PROJECTS
    );

    public static final DetailSlot DIFFERENT_PORTFOLIO_DETAIL_SLOT = new DetailSlot(
        LocalDate.now(),
        DIFFERENT_PORTFOLIO_HEATMAP,
        DIFFERENT_PORTFOLIO_PROJECTS
    );

    public static final DetailSlot EMPTY_PROJECTS_DETAIL_SLOT = new DetailSlot(
        LocalDate.now().withDayOfMonth(10),
        new PortfolioHeatmap(
            DEFAULT_PORTFOLIO_ID,
            "1.0.0",
            1,
            Arrays.asList(0),
            Arrays.asList(5),
            Arrays.asList(2)
        ),
        EMPTY_PROJECTS
    );

    // ──────────────────────── TEST SCENARIOS ────────────────────────

    /**
     * Various test scenarios combining different heatmaps and project metrics
     * for comprehensive testing coverage.
     */
    public static final List<Object[]> TEST_SCENARIOS = Arrays.asList(
        new Object[]{"Today Detail Slot", TODAY_DETAIL_SLOT},
        new Object[]{"Current Month Day 20 Detail Slot", CURRENT_MONTH_DAY_20_DETAIL_SLOT},
        new Object[]{"Previous Month Detail Slot", PREVIOUS_MONTH_DETAIL_SLOT},
        new Object[]{"Zero Values Detail Slot", ZERO_VALUES_DETAIL_SLOT},
        new Object[]{"High Values Detail Slot", HIGH_VALUES_DETAIL_SLOT},
        new Object[]{"Empty Projects Detail Slot", EMPTY_PROJECTS_DETAIL_SLOT}
    );

    /**
     * Multiple detail slots for testing getAllMetrics functionality.
     */
    public static final List<DetailSlot> MULTIPLE_DETAIL_SLOTS = Arrays.asList(
        TODAY_DETAIL_SLOT,
        CURRENT_MONTH_DAY_20_DETAIL_SLOT,
        PREVIOUS_MONTH_DETAIL_SLOT,
        ZERO_VALUES_DETAIL_SLOT
    );

    private SlotMetricsTestData() {
        // Utility class - prevent instantiation
    }
}