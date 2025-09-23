// Simplified metrics collector
// Tracks active time and project-specific interactions

import { track } from './index';
import { scrollTracker, type ScrollMetrics } from './scrollTracker';
import { interactionTracker, type InteractionMetrics } from './interactionTracker';
import { produce } from 'immer';

export type ProjectMetrics = {
  activeTimeMs: number;
  projectInteractions: Record<string, {
    buttonClicks: number;
    linkClicks: number;
  }>;
  scrollMetrics?: ScrollMetrics;
  interactionMetrics?: InteractionMetrics;
  heatmapData?: {
    cols: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
    totalInteractions: number;
    maxCount: number;
    isRecording: boolean;
    gridData: number[];
    topCellsOnly?: boolean;
  };
};

// Optimized metrics for backend submission
export type BackendMetrics = {
  activeTimeMs: number;
  projectMetrics: Array<{
    id: string;
    timeInViewMs: number;
    timeToFirstInteractionMs: number | null;
    codeViews: number; // button clicks (viewing code)
    liveViews: number; // external link clicks (viewing live demo)
  }>;
  scrollMetrics: {
    score: number;
    scrollTimeMs: number;
  };
  heatmapData: {
    cols: number;
    rows: number;
    topCells: {
      indices: number[];
      values: number[];
    };
  };
};

export type TopCellData = {
  index: number;
  value: number;
};

class MetricsCollector {
  private sessionStart: number | null = null;
  private totalActiveMs = 0;
  private projectInteractions: Record<string, { buttonClicks: number; linkClicks: number }> = {};
  private heatmapDataProvider: (() => ProjectMetrics['heatmapData']) | null = null;
  private topCellsProvider: ((topN: number) => TopCellData[]) | null = null;
  private scrollElement: HTMLElement | null = null;

  // Method to set the element to track for scroll
  setScrollElement(element: HTMLElement | null) {
    this.scrollElement = element;
    
    // If we're currently tracking, restart with the new element
    if (this.sessionStart && element) {
      console.log('🔄 Restarting scroll tracking with new element');
      scrollTracker.stopTracking();
      scrollTracker.startTracking(element);
      // Also restart interaction tracking
      interactionTracker.stopTracking();
      interactionTracker.startTracking(element);
    }
  }

  // Method to set heatmap data provider
  setHeatmapDataProvider(provider: (() => ProjectMetrics['heatmapData']) | null) {
    this.heatmapDataProvider = provider;
  }

  // Method to set top cells provider
  setTopCellsProvider(provider: ((topN: number) => TopCellData[]) | null) {
    this.topCellsProvider = provider;
  }

  // Start tracking active time
  startSession() {
    if (!this.sessionStart) {
      this.sessionStart = Date.now();
      
      // Set up activeTime provider for interaction tracker
      interactionTracker.setActiveTimeProvider(() => this.getCurrentActiveTime());
      
      // Start scroll tracking when session begins, using specific element if available
      if (this.scrollElement) {
        console.log('🚀 Starting scroll tracking with element:', this.scrollElement);
        scrollTracker.startTracking(this.scrollElement);
        // Also start interaction tracking
        interactionTracker.startTracking(this.scrollElement);
      } else {
        console.log('⚠️ Starting session but no scroll element set yet');
        // Fallback to window scroll tracking temporarily
        scrollTracker.startTracking(null);
      }
    }
  }

  // Get current active time
  private getCurrentActiveTime(): number {
    let activeTime = this.totalActiveMs;
    if (this.sessionStart) {
      activeTime += Date.now() - this.sessionStart;
    }
    return activeTime;
  }

  // Pause active time tracking
  pauseSession() {
    if (this.sessionStart) {
      this.totalActiveMs += Date.now() - this.sessionStart;
      this.sessionStart = null;
      // Pause scroll tracking
      scrollTracker.stopTracking();
      // Pause interaction tracking
      interactionTracker.stopTracking();
    }
  }

  // Stop and finalize session
  stopSession() {
    this.pauseSession();
    // Ensure scroll tracking is stopped
    scrollTracker.stopTracking();
    // Ensure interaction tracking is stopped
    interactionTracker.stopTracking();
  }

  // Record a button click for a specific project
  recordProjectButtonClick(projectId: string, payload: { id?: string; label?: string }) {
    // Filtrar botones de control de la UI
    const key = payload.id ?? payload.label ?? '';
    if (key.toLowerCase().includes('actualizar') || key.toLowerCase().includes('limpiar') || 
        key.toLowerCase().includes('refresh') || key.toLowerCase().includes('clear')) {
      return; // No trackear estos botones
    }

    this.projectInteractions = produce(this.projectInteractions, draft => {
      if (!draft[projectId]) {
        draft[projectId] = { buttonClicks: 0, linkClicks: 0 };
      }
      draft[projectId].buttonClicks++;
    });
    
    // Track in interaction tracker
    interactionTracker.recordButtonClick(projectId);
    
    // Send to analytics if available
    track('project_button_click', { 
      projectId, 
      button: key, 
      totalClicks: this.projectInteractions[projectId].buttonClicks 
    });
  }

  // Record a link click for a specific project  
  recordProjectLinkClick(projectId: string, href: string) {
    this.projectInteractions = produce(this.projectInteractions, draft => {
      if (!draft[projectId]) {
        draft[projectId] = { buttonClicks: 0, linkClicks: 0 };
      }
      draft[projectId].linkClicks++;
    });
    
    // Track in interaction tracker
    interactionTracker.recordLinkClick(projectId, href);
    
    // Send to analytics if available
    track('project_link_click', { 
      projectId, 
      link: href, 
      totalClicks: this.projectInteractions[projectId].linkClicks 
    });
  }

  // Get current metrics
  getMetrics(): ProjectMetrics {
    let activeTime = this.totalActiveMs;
    if (this.sessionStart) {
      activeTime += Date.now() - this.sessionStart;
    }

    const metrics: ProjectMetrics = {
      activeTimeMs: activeTime,
      projectInteractions: { ...this.projectInteractions },
      scrollMetrics: scrollTracker.getMetrics(),
      interactionMetrics: interactionTracker.getMetrics(),
    };

    // Include heatmap data if provider is available
    if (this.heatmapDataProvider) {
      metrics.heatmapData = this.heatmapDataProvider();
    }

    return metrics;
  }

  // Get top N cells from heatmap
  getTopCells(topN: number): TopCellData[] {
    if (this.topCellsProvider) {
      return this.topCellsProvider(topN);
    }
    return [];
  }

  // Get metrics with only top N heatmap cells (solo índice y valor)
  getTopCellsMetrics(topN: number): { index: number; value: number }[] {
    const topCells = this.getTopCells(topN);
    
    // Devolver solo índice y valor, sin otros datos
    return topCells.map(cell => ({
      index: cell.index,
      value: cell.value
    }));
  }

  // Get metrics optimized for backend submission
  getBackendMetrics(): BackendMetrics {
    const rawMetrics = this.getMetrics();
    const interactionMetrics = rawMetrics.interactionMetrics;
    const scrollMetrics = rawMetrics.scrollMetrics;
    const heatmapData = rawMetrics.heatmapData;

    // Prepare project metrics for backend
    const backendProjectMetricsMap: Record<string, {
      timeInViewMs: number;
      timeToFirstInteractionMs: number | null;
      codeViews: number;
      liveViews: number;
    }> = {};

    // Process interaction metrics for each project
    if (interactionMetrics?.projectMetrics) {
      Object.entries(interactionMetrics.projectMetrics).forEach(([projectId, data]) => {
        // Get button/link clicks from projectInteractions
        const projectInteraction = rawMetrics.projectInteractions[projectId];
        
        backendProjectMetricsMap[projectId] = {
          timeInViewMs: data.timeInViewMs,
          timeToFirstInteractionMs: data.timeToFirstInteractionMs,
          codeViews: projectInteraction?.buttonClicks || 0, // button clicks = code views
          liveViews: projectInteraction?.linkClicks || 0,   // link clicks = live demo views
        };
      });
    }

    // Also include projects that have interactions but no view data
    Object.entries(rawMetrics.projectInteractions).forEach(([projectId, interaction]) => {
      if (!backendProjectMetricsMap[projectId]) {
        backendProjectMetricsMap[projectId] = {
          timeInViewMs: 0,
          timeToFirstInteractionMs: null,
          codeViews: interaction.buttonClicks,
          liveViews: interaction.linkClicks,
        };
      }
    });

    // Prepare scroll metrics (only score and scroll time)
    const backendScrollMetrics = {
      score: scrollTracker.getEngagementScore(),
      scrollTimeMs: scrollMetrics?.timeSpentScrolling || 0,
    };

    // Prepare heatmap data (top 200 cells)
    const topCells = this.getTopCells(200);
    const backendHeatmapData = {
      cols: heatmapData?.cols || 0,
      rows: heatmapData?.rows || 0,
      topCells: {
        indices: topCells.map(cell => cell.index),
        values: topCells.map(cell => cell.value),
      },
    };

    // Convert map -> array with id field
    const backendProjectMetricsArray = Object.entries(backendProjectMetricsMap).map(([id, v]) => ({
      id,
      timeInViewMs: v.timeInViewMs,
      timeToFirstInteractionMs: v.timeToFirstInteractionMs,
      codeViews: v.codeViews,
      liveViews: v.liveViews,
    }));

    return {
      activeTimeMs: rawMetrics.activeTimeMs,
      projectMetrics: backendProjectMetricsArray,
      scrollMetrics: backendScrollMetrics,
      heatmapData: backendHeatmapData,
    };
  }

  // Clear all metrics
  clear() {
    this.sessionStart = null;
    this.totalActiveMs = 0;
    this.projectInteractions = produce(this.projectInteractions, () => ({}));
    this.heatmapDataProvider = null;
    // Clear scroll metrics
    scrollTracker.clear();
    // Clear interaction metrics
    interactionTracker.clear();
  }
}

export const metricsCollector = new MetricsCollector();

export default metricsCollector;
