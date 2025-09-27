import { useEffect, useRef } from 'react';
import { metricsCollector } from '../../lib/analytics/collector';
import useHeatmap from './useHeatmap';

// Simplified hook for metrics collection
type UseMetricsOptions = {
  trackClicks?: boolean;
  trackLinks?: boolean;
  enableHeatmap?: boolean;
  heatmapOptions?: {
    maxCols?: number;
    maxRows?: number;
    cellHeight?: number;
    shape?: 'circle' | 'rect';
    radius?: number;
    idleMs?: number;
    drawIntervalMs?: number;
  };
};

export function useMetrics(
  containerRef: React.RefObject<HTMLElement | null>, 
  options?: UseMetricsOptions
) {
  const { trackClicks = true, trackLinks = true, enableHeatmap = false, heatmapOptions } = options ?? {};
  const isAttached = useRef(false);

  // Initialize heatmap (always call hook, but only use it if enabled)
  const heatmap = useHeatmap(containerRef, { 
    ...heatmapOptions, 
    disabled: !enableHeatmap 
  });

  useEffect(() => {
    // Set heatmap data provider in collector if enabled
    if (enableHeatmap && heatmap) {
      metricsCollector.setHeatmapDataProvider(() => heatmap.getHeatmapData() || undefined);
      metricsCollector.setTopCellsProvider((topN: number) => heatmap.getTopCells(topN));
    } else {
      metricsCollector.setHeatmapDataProvider(null);
      metricsCollector.setTopCellsProvider(null);
    }
  }, [enableHeatmap, heatmap]);

  // Separate effect for scroll element configuration
  useEffect(() => {
    const setupScrollElement = () => {
      if (containerRef.current) {
        console.log('🎯 Setting scroll element:', containerRef.current);
        metricsCollector.setScrollElement(containerRef.current);
        return true;
      }
      return false;
    };

    // Try immediately
    if (!setupScrollElement()) {
      // If not available, try again after a short delay
      const retryTimeout = setTimeout(() => {
        if (!setupScrollElement()) {
          console.warn('⚠️ Scroll element still not available after retry');
        }
      }, 100);

      return () => clearTimeout(retryTimeout);
    }
  }, [containerRef]);

  useEffect(() => {
    // Start session when component mounts
    metricsCollector.startSession();

    // Handle page visibility for accurate active time tracking
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        metricsCollector.startSession();
        // Ensure scroll tracking is properly restarted when page becomes visible
        if (containerRef.current) {
          console.log('👁️ Page visible - ensuring scroll tracking is active');
          metricsCollector.setScrollElement(containerRef.current);
        }
      } else {
        metricsCollector.pauseSession();
      }
    };

    // Handle clicks inside the container
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find the nearest project context
      const projectCard = target.closest('[data-project-id]') as HTMLElement | null;
      const projectId = projectCard?.dataset.projectId || 'unknown-project';
      
      // Debug: Log project detection for troubleshooting
      if (projectCard?.dataset.projectId) {
        console.log('🎯 Click detected in project:', projectCard.dataset.projectId);
      } else {
        console.log('⚠️ Click outside project context, using unknown-project');
      }

      // Track button clicks
      if (trackClicks) {
        const button = target.closest('button');
        if (button) {
          const id = button.id || undefined;
          const label = button.textContent?.trim() || undefined;
          metricsCollector.recordProjectButtonClick(projectId, { id, label });
        }
      }

      // Track link clicks
      if (trackLinks) {
        const link = target.closest('a');
        if (link && link.href) {
          metricsCollector.recordProjectLinkClick(projectId, link.href);
        }
      }
    };

    // Attach event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const container = containerRef.current;
    if (container && !isAttached.current) {
      container.addEventListener('click', handleClick);
      isAttached.current = true;
    }

    return () => {
      // Cleanup
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (container && isAttached.current) {
        container.removeEventListener('click', handleClick);
        isAttached.current = false;
      }
      metricsCollector.stopSession();
    };
  }, [containerRef, trackClicks, trackLinks]);

  return {
    metricsCollector,
    heatmap, // Exponemos el objeto heatmap completo para acceder a getTopCells y showTopCellsOnly
    getBackendMetrics: () => metricsCollector.getBackendMetrics(), // Métricas optimizadas para backend
  };
}

export default useMetrics;
