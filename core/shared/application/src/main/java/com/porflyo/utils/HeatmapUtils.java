package com.porflyo.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

import com.porflyo.dto.HeatmapSnapshot;
import com.porflyo.model.metrics.PortfolioHeatmap;

/**
 * Utility functions for metrics heatmap manipulation.
 */
public final class HeatmapUtils {

    private HeatmapUtils() {}

    private static class CellData {
        public int index;
        public int value;
        public int count;
        public double score; // cached score to avoid recomputation

        CellData(int index, int value, int count) {
            this.index = index;
            this.value = value;
            this.count = count;
            this.score = 0.0;
        }
    }

    /**
     * Update an existing heatmap with new snapshot data, combining cell values and counts,
     * and selecting the most relevant cells up to maxCells.
     *
     * @param existingHeatmap The existing heatmap to update.
     * @param newHeatmap The new heatmap snapshot to incorporate.
     * @param maxCells The maximum number of cells to retain in the updated heatmap.
     * @return The updated PortfolioHeatmap.
     */
    public static PortfolioHeatmap updateHeatmap(PortfolioHeatmap existingHeatmap, HeatmapSnapshot newHeatmap, int maxCells) {
        // Use new metadata (date, version, columns)
        String version = newHeatmap.version();
        Integer columns = newHeatmap.columns();

        Map<Integer, CellData> combinedCells = new HashMap<>();

        // Add existing cells to the map
        for (int i = 0; i < existingHeatmap.Indexes().size(); i++) {
            Integer index = existingHeatmap.Indexes().get(i);
            Integer value = existingHeatmap.Values().get(i);
            Integer count = existingHeatmap.Counts().get(i);

            combinedCells.put(index, new CellData(index, value, count));
        }

        // Combine with new cells (each new index has count = 1, representing one user visit)
        for (int i = 0; i < newHeatmap.Indexes().size(); i++) {
            Integer index = newHeatmap.Indexes().get(i);
            Integer value = newHeatmap.Values().get(i);
            Integer count = 1; // New data always has count = 1 (single user visit)

            CellData existing = combinedCells.get(index);
            if (existing != null) {
                existing.value += value;
                existing.count += count;

            } else {
                // Add new cell
                combinedCells.put(index, new CellData(index, value, count));
            }
        }

        // Select the most relevant cells up to maxCells
        List<CellData> selectedCells = selectMostRelevantCells(new ArrayList<>(combinedCells.values()), maxCells);

        // Extract lists for the result
        List<Integer> resultIndexes = new ArrayList<>();
        List<Integer> resultValues = new ArrayList<>();
        List<Integer> resultCounts = new ArrayList<>();

        for (CellData cell : selectedCells) {
            resultIndexes.add(cell.index);
            resultValues.add(cell.value);
            resultCounts.add(cell.count);
        }

        return new PortfolioHeatmap(version, columns, resultIndexes, resultValues, resultCounts);
    }

    private static List<CellData> selectMostRelevantCells(List<CellData> allCells, int maxCells) {
        // If there are not more cells than the limit, return them as-is (no ranking needed)
        if (allCells.size() <= maxCells) {
            return allCells;
        }

        // Compute normalization factors used by the scoring function
        Norms norms = computeNormalization(allCells);

        // Compute the composite score for each cell once and cache it
        computeScores(allCells, norms);

        // Select top-K cells using a min-heap (O(n log k)) and return them sorted descending
        return topKByHeap(allCells, maxCells);
    }

    /**
     * Hold normalization factors used to scale values and value/count ratio
     */
    private static class Norms {
        int maxValue;
        double maxRatio;

        Norms(int maxValue, double maxRatio) {
            this.maxValue = maxValue <= 0 ? 1 : maxValue;
            this.maxRatio = maxRatio <= 0.0 ? 1.0 : maxRatio;
        }
    }

    /**
     * Compute normalization factors: max value and max(value/count) across all cells.
     */
    private static Norms computeNormalization(List<CellData> allCells) {
        int maxValue = 1;
        double maxRatio = 1.0;

        for (CellData c : allCells) {
            if (c.value > maxValue) maxValue = c.value;
            double ratio = c.count > 0 ? (double) c.value / c.count : c.value;
            if (ratio > maxRatio) maxRatio = ratio;
        }

        return new Norms(maxValue, maxRatio);
    }

    /**
     * Compute a cached composite score for each cell using the provided norms.
     * Score = 0.7 * normalizedValue + 0.3 * normalizedRatio
     */
    private static void computeScores(List<CellData> allCells, Norms norms) {
        int maxValue = norms.maxValue;
        double maxRatio = norms.maxRatio;

        for (CellData c : allCells) {
            double normalizedValue = (double) c.value / maxValue;
            double valueToCountRatio = c.count > 0 ? (double) c.value / c.count : c.value;
            double normalizedRatio = valueToCountRatio / maxRatio;
            c.score = 0.7 * normalizedValue + 0.3 * normalizedRatio;
        }
    }

    /**
     * Keep the top K items by score using a min-heap. This is more efficient than sorting
     * the entire list when K &lt;&lt; N (O(n log k) instead of O(n log n)).
     */
    private static List<CellData> topKByHeap(List<CellData> allCells, int maxCells) {
        PriorityQueue<CellData> heap = new PriorityQueue<>(maxCells, (a, b) -> Double.compare(a.score, b.score));

        for (CellData c : allCells) {
            if (heap.size() < maxCells) {
                heap.add(c);
            } else if (c.score > heap.peek().score) {
                heap.poll();
                heap.add(c);
            }
        }

        List<CellData> result = new ArrayList<>(heap);
        // sort descending by score for deterministic output
        result.sort((a, b) -> Double.compare(b.score, a.score));
        return result;
    }
}
