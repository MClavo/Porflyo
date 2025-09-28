/**
 * ModernHeatmap - Dashboard de mapa de calor moderno
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { PortfolioViewer } from '../components/portfolio';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { useMetricsStore } from '../state/metrics.store';
import { latest } from '../lib/dates';
import { demoInitialPortfolio } from '../pages/editor/demoData';
import '../styles/dashboard-theme.css';
import HeatmapCanvas from '../components/heatmap/HeatmapCanvas';

function ModernHeatmapContent() {
  const portfolioRef = useRef<HTMLDivElement>(null);
  const [isHeatmapReady, setIsHeatmapReady] = useState(false);

  // Obtener datos del backend usando el store como en ModernOverview
  const { slotByDate, slotIndex, isLoading } = useMetricsStore();

  // Prepare items (index,value) and max derived from backend heatmap cells
  const heatmapPayload = useMemo(() => {
    if (!slotByDate || slotIndex.length === 0) return { items: [] as {index:number,value:number}[], max: 1 };
    const latestDate = latest(slotIndex);
    if (!latestDate) return { items: [] as {index:number,value:number}[], max: 1 };
    const latestSlot = Object.values(slotByDate).find(slot => slot.date === latestDate);
    if (!latestSlot || !latestSlot.heatmap || !latestSlot.heatmap.cells) return { items: [] as {index:number,value:number}[], max: 1 };
    const cells = latestSlot.heatmap.cells as Array<any>;
    const items: {index:number,value:number}[] = [];
    let max = 1;
    cells.forEach((c) => {
      const idx = Number(c.index);
      const val = Number(c.count) || 0;
      if (Number.isFinite(idx) && val > 0) {
        items.push({ index: idx, value: val });
        if (val > max) max = val;
      }
    });
    return { items, max };
  }, [slotByDate, slotIndex]);

  // Simple readiness flag (no external library)
  useEffect(() => {
    setTimeout(() => setIsHeatmapReady(true), 200);
  }, []);

  // No update effect needed: HeatmapCanvas consumes `heatmapPayload` from props


  return (
    <div className="modern-heatmap-container" style={{ position: 'relative' }}>
      {/* Info panel */}
     

      {/* Portfolio con heatmap overlay */}
      <div 
        ref={portfolioRef}
        style={{ 
          position: 'relative',
          background: 'var(--dashboard-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--card-border)',
          minHeight: '600px', // Altura mínima para debug
          width: '100%'
        }}
        data-project-id="default"
      >
        {/* Heatmap overlay component */}
        <HeatmapCanvas
          items={heatmapPayload.items}
          columns={64}
          cellHeight={25}
          radius={40}
          maxValue={heatmapPayload.max}
          className="heatmap-overlay"
        />
        
        {/* Portfolio viewer */}
        <PortfolioViewer 
          portfolio={demoInitialPortfolio} 
          className="heatmap-portfolio"
        />
      </div>

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-3)',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-xs)',
          color: 'var(--text-secondary)'
        }}>
          <strong>Debug Info:</strong><br/>
          Heatmap Ready: {isHeatmapReady ? '✅' : '❌'}<br/>
          Data Source: {slotIndex.length > 0 ? 'Backend API' : 'No Data'}<br/>
          Latest Date: {latest(slotIndex) || 'None'}<br/>
          Loading: {isLoading ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
}

export default function ModernHeatmap() {
  return (
    <MetricsProvider portfolioId="default">
      <ModernHeatmapContent />
    </MetricsProvider>
  );
}