package com.porflyo.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.HeatmapSnapshot;
import com.porflyo.model.metrics.PortfolioHeatmap;

@DisplayName("MetricsHeatmapUtils (unit)")
class MetricsHeatmapUtilsTest {

    // ────────────────────────── updateHeatmap ──────────────────────────

    @Test
    @DisplayName("should create new heatmap when existing is empty")
    void should_create_new_heatmap_when_existing_empty() {
        // given
        PortfolioHeatmap existingHeatmap = new PortfolioHeatmap(
            "1.0", 10,
            List.of(), List.of(), List.of()
        );
        
        HeatmapSnapshot newSnapshot = new HeatmapSnapshot(
            "2.0", 12,
            List.of(0, 1, 2),
            List.of(10, 20, 15)
        );

        // when
        PortfolioHeatmap result = HeatmapUtils.updateHeatmap(existingHeatmap, newSnapshot, 100);

        // then
        assertThat(result.version()).isEqualTo("2.0");
        assertThat(result.columns()).isEqualTo(12);
        assertThat(result.Indexes()).containsExactly(0, 1, 2);
        assertThat(result.Values()).containsExactly(10, 20, 15);
        assertThat(result.Counts()).containsExactly(1, 1, 1); // New cells have count = 1
    }

    @Test
    @DisplayName("should merge existing and new cells correctly")
    void should_merge_existing_and_new_cells() {
        // given - existing has cells [0: 5×2, 1: 10×3]
        PortfolioHeatmap existingHeatmap = new PortfolioHeatmap(
            "1.0", 10,
            List.of(0, 1),
            List.of(5, 10),
            List.of(2, 3)
        );
        
        // new snapshot has cells [1: 15×1, 2: 25×1] - overlaps at index 1
        HeatmapSnapshot newSnapshot = new HeatmapSnapshot(
            "2.0", 12,
            List.of(1, 2),
            List.of(15, 25)
        );

        // when
        PortfolioHeatmap result = HeatmapUtils.updateHeatmap(existingHeatmap, newSnapshot, 100);

        // then
        assertThat(result.version()).isEqualTo("2.0");
        assertThat(result.columns()).isEqualTo(12);
        
        // Should have 3 cells: [0: 5×2, 1: 25×4, 2: 25×1]
        assertThat(result.Indexes()).containsExactlyInAnyOrder(0, 1, 2);
        
        // Find values by index
        int idx0 = result.Indexes().indexOf(0);
        int idx1 = result.Indexes().indexOf(1);
        int idx2 = result.Indexes().indexOf(2);
        
        assertThat(result.Values().get(idx0)).isEqualTo(5);  // unchanged
        assertThat(result.Values().get(idx1)).isEqualTo(25); // 10 + 15
        assertThat(result.Values().get(idx2)).isEqualTo(25); // new cell
        
        assertThat(result.Counts().get(idx0)).isEqualTo(2);  // unchanged
        assertThat(result.Counts().get(idx1)).isEqualTo(4);  // 3 + 1
        assertThat(result.Counts().get(idx2)).isEqualTo(1);  // new cell
    }

    @Test
    @DisplayName("should limit cells to maxCells when exceeding limit")
    void should_limit_cells_when_exceeding_max() {
        // given - existing has 3 cells with different relevance scores
        PortfolioHeatmap existingHeatmap = new PortfolioHeatmap(
            "1.0", 10,
            List.of(0, 1, 2),
            List.of(100, 50, 200), // values: high, medium, highest
            List.of(10, 5, 8)      // counts: high, low, medium
        );
        
        // new snapshot adds 2 more cells
        HeatmapSnapshot newSnapshot = new HeatmapSnapshot(
            "2.0", 12,
            List.of(3, 4),
            List.of(150, 75) // medium-high values
        );

        // when - limit to 3 cells (should drop least relevant)
        PortfolioHeatmap result = HeatmapUtils.updateHeatmap(existingHeatmap, newSnapshot, 3);

        // then
        assertThat(result.Indexes()).hasSize(3);
        assertThat(result.Values()).hasSize(3);
        assertThat(result.Counts()).hasSize(3);
        
        // Should keep the most relevant cells based on composite score
        // Index 2 has highest value (200), should definitely be kept
        assertThat(result.Indexes()).contains(2);
    }

    @Test
    @DisplayName("should handle empty new snapshot")
    void should_handle_empty_new_snapshot() {
        // given
        PortfolioHeatmap existingHeatmap = new PortfolioHeatmap(
            "1.0", 10,
            List.of(0, 1),
            List.of(10, 20),
            List.of(2, 3)
        );
        
        HeatmapSnapshot emptySnapshot = new HeatmapSnapshot(
            "2.0", 12,
            List.of(), List.of()
        );

        // when
        PortfolioHeatmap result = HeatmapUtils.updateHeatmap(existingHeatmap, emptySnapshot, 100);

        // then - should keep existing cells but update metadata
        assertThat(result.version()).isEqualTo("2.0");
        assertThat(result.columns()).isEqualTo(12);
        assertThat(result.Indexes()).containsExactly(0, 1);
        assertThat(result.Values()).containsExactly(10, 20);
        assertThat(result.Counts()).containsExactly(2, 3);
    }

    @Test
    @DisplayName("should limit cells to maxCells even with small numbers")
    void should_limit_cells_to_max_cells_small() {
        // given
        PortfolioHeatmap existingHeatmap = new PortfolioHeatmap(
            "1.0", 10,
            List.of(0, 1),
            List.of(10, 20),
            List.of(2, 3)
        );
        
        HeatmapSnapshot newSnapshot = new HeatmapSnapshot(
            "2.0", 12,
            List.of(2),
            List.of(30)
        );

        // when - limit to 1 cell (should keep the most relevant)
        PortfolioHeatmap result = HeatmapUtils.updateHeatmap(existingHeatmap, newSnapshot, 1);

        // then - should return only the most relevant cell
        assertThat(result.version()).isEqualTo("2.0");
        assertThat(result.columns()).isEqualTo(12);
        assertThat(result.Indexes()).hasSize(1);
        assertThat(result.Values()).hasSize(1);
        assertThat(result.Counts()).hasSize(1);
    }

    @Test
    @DisplayName("should preserve cell order when no trimming needed")
    void should_preserve_cell_order_when_no_trimming() {
        // given
        PortfolioHeatmap existingHeatmap = new PortfolioHeatmap(
            "1.0", 10,
            List.of(5, 10, 15), // specific order
            List.of(100, 200, 150),
            List.of(5, 8, 6)
        );
        
        HeatmapSnapshot newSnapshot = new HeatmapSnapshot(
            "2.0", 12,
            List.of(20),
            List.of(175)
        );

        // when - high limit, no trimming needed
        PortfolioHeatmap result = HeatmapUtils.updateHeatmap(existingHeatmap, newSnapshot, 100);

        // then - should maintain relative order of existing cells
        assertThat(result.Indexes()).hasSize(4);
        assertThat(result.Indexes()).containsSequence(5, 10, 15); // existing order preserved
        assertThat(result.Indexes()).contains(20); // new cell added
    }

    @Test
    @DisplayName("should handle single cell scenarios")
    void should_handle_single_cell_scenarios() {
        // given
        PortfolioHeatmap existingHeatmap = new PortfolioHeatmap(
            "1.0", 10,
            List.of(42),
            List.of(100),
            List.of(5)
        );
        
        HeatmapSnapshot newSnapshot = new HeatmapSnapshot(
            "2.0", 12,
            List.of(42), // same cell
            List.of(50)
        );

        // when
        PortfolioHeatmap result = HeatmapUtils.updateHeatmap(existingHeatmap, newSnapshot, 1);

        // then - should merge into single cell
        assertThat(result.Indexes()).containsExactly(42);
        assertThat(result.Values()).containsExactly(150); // 100 + 50
        assertThat(result.Counts()).containsExactly(6);   // 5 + 1
    }
}