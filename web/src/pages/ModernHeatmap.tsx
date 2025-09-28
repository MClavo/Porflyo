/**
 * ModernHeatmap - Dashboard de mapa de calor moderno
 */

import { useRef, useEffect, useState, useMemo } from "react";
import { PortfolioViewer } from "../components/portfolio";
import { MetricsProvider } from "../contexts/MetricsProvider";
import { useMetricsStore } from "../state/metrics.store";
import { demoInitialPortfolio } from "../pages/editor/demoData";
import HeatmapCanvas from "../components/heatmap/HeatmapCanvas";
import HeatmapSkeleton from "../components/ui/HeatmapSkeleton";
import type { HeatmapMode } from "../components/ui/HeatmapModeToggle";
import "../styles/dashboard-theme.css";
import "../styles/modern-heatmap.css";

interface ModernHeatmapProps {
  selectedSlot?: string;
  heatmapMode?: HeatmapMode;
}

interface ModernHeatmapContentProps {
  selectedSlot: string;
  heatmapMode: HeatmapMode;
}

function ModernHeatmapContent({ selectedSlot, heatmapMode }: ModernHeatmapContentProps) {
  const portfolioRef = useRef<HTMLDivElement>(null);
  const [isHeatmapReady, setIsHeatmapReady] = useState(false);

  // Obtener datos del backend usando el store como en ModernOverview
  const { slotByDate, slotIndex, isLoading } = useMetricsStore();

  // All heatmap calculation logic is now inlined in heatmapPayload for better dependency management

  // Prepare items (index,value) and max derived from backend heatmap cells
  const heatmapPayload = useMemo(() => {
    if (!slotByDate || slotIndex.length === 0) {
      return { items: [] as { index: number; value: number }[], max: 1 };
    }

    // Handle 'all' selection - inline aggregated calculation
    if (selectedSlot === 'all') {
      type HeatmapCell = { index: number; count: number; value?: number };
      const aggregatedCells = new Map<number, { totalValue: number; totalCount: number }>();

      // Process all slots to aggregate data
      slotIndex.forEach(date => {
        const slot = Object.values(slotByDate).find(s => s.date === date);
        if (slot && slot.heatmap && slot.heatmap.cells) {
          const cells = slot.heatmap.cells as HeatmapCell[];
          cells.forEach(cell => {
            const idx = Number(cell.index);
            const count = Number(cell.count) || 0;
            const value = Number(cell.value) || count; // Use value if available, fallback to count
            
            if (Number.isFinite(idx) && count > 0) {
              const existing = aggregatedCells.get(idx) || { totalValue: 0, totalCount: 0 };
              aggregatedCells.set(idx, {
                totalValue: existing.totalValue + value,
                totalCount: existing.totalCount + count
              });
            }
          });
        }
      });

      // Convert to items array with mode-specific calculation
      const items: { index: number; value: number }[] = [];
      let max = 1;

      aggregatedCells.forEach(({ totalValue, totalCount }, index) => {
        let finalValue: number;
        
        if (heatmapMode === 'weighted' && totalCount > 0) {
          // Weighted mode: divide total value by total count
          finalValue = totalValue / totalCount;
        } else {
          // Raw mode: use total value as-is
          finalValue = totalValue;
        }
        
        items.push({ index, value: finalValue });
        if (finalValue > max) max = finalValue;
      });

      return { items, max };
    }

    // Handle specific slot selection
    const selectedSlotData = Object.values(slotByDate).find(
      (slot) => slot.date === selectedSlot
    );

    if (!selectedSlotData || !selectedSlotData.heatmap || !selectedSlotData.heatmap.cells) {
      return { items: [] as { index: number; value: number }[], max: 1 };
    }

    type HeatmapCell = { index: number; count: number; value?: number };
    const cells = selectedSlotData.heatmap.cells as HeatmapCell[];
    const items: { index: number; value: number }[] = [];

    let max = 1;
    cells.forEach((c) => {
      const idx = Number(c.index);
      const count = Number(c.count) || 0;
      const rawValue = Number(c.value) || count; // Use value if available, fallback to count
      
      if (Number.isFinite(idx) && count > 0) {
        let finalValue: number;
        
        if (heatmapMode === 'weighted' && count > 0) {
          // Weighted mode: divide value by count
          finalValue = rawValue / count;
        } else {
          // Raw mode: use value as-is
          finalValue = rawValue;
        }
        
        items.push({ index: idx, value: finalValue });
        if (finalValue > max) max = finalValue;
      }
    });

    return { items, max };
  }, [slotByDate, slotIndex, selectedSlot, heatmapMode]);

  // Simple readiness flag (no external library)
  useEffect(() => {
    setTimeout(() => setIsHeatmapReady(true), 200);
  }, []);

  return (
    <div
      className="modern-heatmap-container"
      style={{ position: "relative", padding: 'var(--space-4) 0', boxSizing: 'border-box' }}
    >
      {/* Portfolio con heatmap overlay */}
      <div
        ref={portfolioRef}
        style={{
          position: "relative",
          background: "var(--dashboard-bg-secondary)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--card-border)",
          minHeight: "600px", // Altura mínima para debug
          width: 'auto',
          maxWidth: 'none',
          boxSizing: 'border-box'
        }}
        data-project-id="default"
      >
        {/* Loading skeleton */}
        {(isLoading || !isHeatmapReady) && (
          <HeatmapSkeleton className="heatmap-loading" />
        )}

        {/* Heatmap overlay component */}
        {/* TODO: Adjust blur and radius for all and selected day if needed */}
        {isHeatmapReady && !isLoading && (
          <HeatmapCanvas
            items={heatmapPayload.items}
            columns={64}
            blur={17}
            cellHeight={25}
            radius={55}
            maxValue={heatmapPayload.max}
            className="heatmap-overlay"
          />
        )}

        {/* Portfolio viewer */}
        <PortfolioViewer
          portfolio={demoInitialPortfolio}
          className="heatmap-portfolio"
        />
      </div>

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div
          style={{
            marginTop: "var(--space-4)",
            padding: "var(--space-3)",
            background: "rgba(0,0,0,0.1)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-xs)",
            color: "var(--text-secondary)",
          }}
        >
          <strong>Debug Info:</strong>
          <br />
          Heatmap Ready: {isHeatmapReady ? "✅" : "❌"}
          <br />
          Data Source: {slotIndex.length > 0 ? "Backend API" : "No Data"}
          <br />
          Selected Slot: {selectedSlot}
          <br />
          Heatmap Mode: {heatmapMode}
          <br />
          Items Count: {heatmapPayload.items.length}
          <br />
          Max Value: {heatmapPayload.max}
          <br />
          Loading: {isLoading ? "Yes" : "No"}
        </div>
      )}
    </div>
  );
}

export default function ModernHeatmap({ selectedSlot = 'all', heatmapMode = 'raw' }: ModernHeatmapProps) {
  return (
    <div className="modern-heatmap-page">
      <MetricsProvider portfolioId="default">
        <ModernHeatmapContent selectedSlot={selectedSlot} heatmapMode={heatmapMode} />
      </MetricsProvider>
    </div>
  );
}