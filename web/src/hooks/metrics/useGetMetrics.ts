import { useEffect, useRef, useCallback } from 'react';
import { metricsCollector } from '../../lib/analytics/collector';
import useHeatmap from './useHeatmap';
import { isMobile } from 'react-device-detect';

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
  isContentReady?: boolean;
};

export function useMetrics(
  containerRef: React.RefObject<HTMLElement | null>, 
  options?: UseMetricsOptions
) {
  const { trackClicks = true, trackLinks = true, enableHeatmap = false, heatmapOptions, isContentReady = true } = options ?? {};
  const isAttached = useRef(false);
  const hasInitializedProjects = useRef(false);

  // Disable heatmap on mobile devices for better performance
  const shouldEnableHeatmap = enableHeatmap && !isMobile;

  // Initialize heatmap (always call hook, but only use it if enabled and not mobile)
  const heatmap = useHeatmap(containerRef, { 
    ...heatmapOptions, 
    disabled: !shouldEnableHeatmap 
  });

  useEffect(() => {
    // Set heatmap data provider in collector if enabled and not mobile
    if (shouldEnableHeatmap && heatmap) {
      metricsCollector.setHeatmapDataProvider(() => heatmap.getHeatmapData() || undefined);
      metricsCollector.setTopCellsProvider((topN: number) => heatmap.getTopCells(topN));
    } else {
      metricsCollector.setHeatmapDataProvider(null);
      metricsCollector.setTopCellsProvider(null);
    }
  }, [shouldEnableHeatmap, heatmap]);

  // Separate effect for scroll element configuration
  useEffect(() => {
    if (!isContentReady) {
      return;
    }

    const setupScrollElement = () => {
      if (containerRef.current) {
        metricsCollector.setScrollElement(containerRef.current);
        
        return true;
      }
      return false;
    };

    // Try immediately
    if (!setupScrollElement()) {
      // If not available, try again after a short delay
      const retryTimeout = setTimeout(() => {
        setupScrollElement();
      }, 200);

      return () => clearTimeout(retryTimeout);
    }
  }, [containerRef, isContentReady]);

  useEffect(() => {
    if (!isContentReady) {
      return;
    }

    metricsCollector.startSession();

    // Handle page visibility for accurate active time tracking
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        metricsCollector.startSession();
        if (containerRef.current) {
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

      // Check for email link clicks (just track the metric)
      const emailLink = target.closest('.about-contact-link') as HTMLAnchorElement | null;
      if (emailLink) {
        metricsCollector.recordEmailCopied();
        return;
      }

      // Check for social media link clicks
      const socialLink = target.closest('.about-social-link') as HTMLAnchorElement | null;
      if (socialLink && trackLinks) {
        const classList = Array.from(socialLink.classList);
        const platform = classList.find(c => c !== 'about-social-link') || 'unknown';
        
        metricsCollector.recordSocialClick(platform);
        return;
      }

      // Find the nearest project context
      const projectCard = target.closest('[project-id]') as HTMLElement | null;
      const projectId = projectCard?.getAttribute('project-id') || 'unknown-project';
  

      // Check for button or link clicks
      const button = target.closest('button');
      const link = target.closest('a');
      const clickedElement = button || link;
      
      if (clickedElement) {
        const classList = clickedElement.classList;
        const isLiveButton = classList.contains('btn-live');
        const isCodeButton = classList.contains('btn-code');

        if (isLiveButton && trackLinks) {
          metricsCollector.recordProjectLinkClick(projectId, (link as HTMLAnchorElement)?.href || 'live');
        } else if (isCodeButton && trackClicks) {
          const label = clickedElement.textContent?.trim() || undefined;
          metricsCollector.recordProjectButtonClick(projectId, { label });
        }
      }
    };

    // Attach event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const container = containerRef.current;
    if (container && !isAttached.current) {
      container.addEventListener('click', handleClick);
      isAttached.current = true;
      
      // Wait for DOM to be fully ready before initializing project observers
      if (!hasInitializedProjects.current) {
        const initializeProjects = () => {
          const projectElements = container.querySelectorAll('[project-id]');
          
          if (projectElements.length > 0) {
            hasInitializedProjects.current = true;
          }
        };

        // Try immediately
        initializeProjects();
        
        // If no projects found, try again after a short delay
        if (!hasInitializedProjects.current) {
          const retryTimeout = setTimeout(() => {
            initializeProjects();
          }, 500);
          
          return () => clearTimeout(retryTimeout);
        }
      }
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
  }, [containerRef, trackClicks, trackLinks, isContentReady]);

  // Memoize getBackendMetrics to avoid creating new function references on every render
  const getBackendMetrics = useCallback(() => {
    return metricsCollector.getBackendMetrics();
  }, []);

  return {
    metricsCollector,
    heatmap, // Exponemos el objeto heatmap completo para acceder a getTopCells y showTopCellsOnly
    getBackendMetrics, // Métricas optimizadas para backend (memoized)
  };
}

export default useMetrics;
