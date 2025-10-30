// Interaction metrics tracker
// Tracks time to first interaction and interaction rate

import { produce } from 'immer';

export type InteractionMetrics = {
  timeToFirstInteractionMs: number | null;
  totalInteractions: number;
  interactionRatePerMinute: number;
  sessionStartMs: number;
  firstInteractionMs: number | null;
  totalViews: number;
  externalClicks: number;
  projectMetrics: Record<string, ProjectInteractionData>;
};

export type ProjectInteractionData = {
  projectId: string;
  viewStartMs: number | null;
  viewTime: number;
  firstInteractionMs: number | null;
  exposures: number; // Number of times the project has been shown on screen
  totalInteractions: number;
  interactionRatePerMinute: number;
  externalClicks: number;
  isCurrentlyInView: boolean;
  lastSeenMs: number;
};

export type InteractionEvent = {
  projectId: string;
  type: 'button_click' | 'link_click' | 'view_start' | 'view_end';
  timestamp: number;
  isExternal?: boolean;
  target?: string;
};

class InteractionTracker {
  private sessionStartMs: number | null = null;
  private firstInteractionActiveTimeMs: number | null = null; // TTFI basado en activeTime
  private totalInteractions = 0;
  private totalViews = 0;
  private externalClicks = 0;
  private projectData: Map<string, ProjectInteractionData> = new Map();
  private intersectionObserver: IntersectionObserver | null = null;
  private containerElement: HTMLElement | null = null;
  private activeTimeProvider: (() => number) | null = null;

  // Set function to get current active time
  setActiveTimeProvider(provider: () => number) {
    this.activeTimeProvider = provider;
  }

  // Initialize tracking for a specific container
  startTracking(containerElement: HTMLElement) {
    if (this.sessionStartMs) {
      this.stopTracking();
    }

    this.sessionStartMs = Date.now();
    this.containerElement = containerElement;
    
    // Set up intersection observer to track project views
    this.setupIntersectionObserver(containerElement);
    
    console.log('🎯 Interaction tracking started for container');
  }

  // Stop tracking and cleanup
  stopTracking() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    // End any currently active views
    this.projectData.forEach((data, projectId) => {
      if (data.isCurrentlyInView) {
        this.recordViewEnd(projectId);
      }
    });

    console.log('🛑 Interaction tracking stopped');
  }

  // Setup intersection observer for project view tracking
  private setupIntersectionObserver(container: HTMLElement) {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const projectElement = entry.target as HTMLElement;
          const projectId = projectElement.dataset.projectId;
          
          if (!projectId) return;

          if (entry.isIntersecting) {
            this.recordViewStart(projectId);
          } else {
            this.recordViewEnd(projectId);
          }
        });
      },
      {
        root: container,
        threshold: 0.3, // Consider "in view" when 30% visible
        rootMargin: '0px'
      }
    );

    // Observe all elements with data-project-id
    const projectElements = container.querySelectorAll('[data-project-id]');
    projectElements.forEach((element) => {
      this.intersectionObserver?.observe(element);
    });

    console.log(`👀 Observing ${projectElements.length} project elements`);
  }

  // Record when a project comes into view
  private recordViewStart(projectId: string) {
    const now = Date.now();
    let data = this.projectData.get(projectId);

    if (!data) {
      data = {
        projectId,
        viewStartMs: now,
        viewTime: 0,
        firstInteractionMs: null,
        exposures: 1, // First exposure
        totalInteractions: 0,
        interactionRatePerMinute: 0,
        externalClicks: 0,
        isCurrentlyInView: true,
        lastSeenMs: now
      };
      this.projectData.set(projectId, data);
      this.totalViews++;
    } else {
      data.viewStartMs = now;
      data.isCurrentlyInView = true;
      data.lastSeenMs = now;
      data.exposures++; // Increment exposures on each new view
    }

    console.log(`👁️ View started for project: ${projectId} (exposure #${data.exposures})`);
  }

  // Record when a project goes out of view
  private recordViewEnd(projectId: string) {
    const data = this.projectData.get(projectId);
    if (!data || !data.isCurrentlyInView) return;

    const now = Date.now();
    const sessionDuration = data.viewStartMs ? now - data.viewStartMs : 0;
    
    data.viewTime += sessionDuration;
    data.isCurrentlyInView = false;
    data.lastSeenMs = now;

    // Recalculate interaction rate
    if (data.viewTime > 0) {
      const timeInMinutes = data.viewTime / 60000;
      data.interactionRatePerMinute = data.totalInteractions / timeInMinutes;
    }

    console.log(`👁️ View ended for project: ${projectId}, session duration: ${sessionDuration}ms`);
  }

  // Record a button click interaction
  recordButtonClick(projectId: string) {
    this.recordInteraction(projectId, 'button_click');
  }

  // Record a link click interaction
  recordLinkClick(projectId: string, href: string) {
    const isExternal = this.isExternalLink(href);
    this.recordInteraction(projectId, 'link_click');
    
    if (isExternal) {
      this.externalClicks++;
      const data = this.projectData.get(projectId);
      if (data) {
        data.externalClicks++;
      }
    }
  }

  // Record any interaction
  private recordInteraction(projectId: string, type: InteractionEvent['type']) {
    const now = Date.now();
    let data = this.projectData.get(projectId);

    // Ensure project data exists
    if (!data) {
      data = {
        projectId,
        viewStartMs: null,
        viewTime: 0,
        firstInteractionMs: null,
        exposures: 0, // No exposures yet if interacting without view
        totalInteractions: 0,
        interactionRatePerMinute: 0,
        externalClicks: 0,
        isCurrentlyInView: false,
        lastSeenMs: now
      };
      this.projectData.set(projectId, data);
    }

    // Record GLOBAL first interaction timing using activeTime (only once per session)
    if (this.firstInteractionActiveTimeMs === null && this.activeTimeProvider) {
      this.firstInteractionActiveTimeMs = this.activeTimeProvider();
      console.log(`🎯 FIRST INTERACTION recorded at ${this.firstInteractionActiveTimeMs}ms active time`);
    }

    // Record first interaction for this specific project (only once per project)
    if (!data.firstInteractionMs) {
      data.firstInteractionMs = now;
      console.log(`🎯 First interaction for project ${projectId}`);
    }

    // Update counters
    data.totalInteractions++;
    this.totalInteractions++;

    // Recalculate interaction rate
    if (data.viewTime > 0) {
      const timeInMinutes = data.viewTime / 60000;
      data.interactionRatePerMinute = data.totalInteractions / timeInMinutes;
    }

    console.log(`🔄 ${type} recorded for project: ${projectId} (total interactions: ${data.totalInteractions})`);
  }

  // Check if a link is external
  private isExternalLink(href: string): boolean {
    try {
      const url = new URL(href, window.location.href);
      return url.hostname !== window.location.hostname;
    } catch {
      return false;
    }
  }

  // Get current metrics
  getMetrics(): InteractionMetrics {
    const now = Date.now();
    
    // Update time in view for currently active projects
    this.projectData.forEach((data) => {
      if (data.isCurrentlyInView && data.viewStartMs) {
        const currentSessionDuration = now - data.viewStartMs;
        const totalTimeInView = data.viewTime + currentSessionDuration;
        
        if (totalTimeInView > 0) {
          const timeInMinutes = totalTimeInView / 60000;
          data.interactionRatePerMinute = data.totalInteractions / timeInMinutes;
        }
      }
    });

    // Calculate global metrics
    const sessionDurationMs = this.sessionStartMs ? now - this.sessionStartMs : 0;
    const sessionDurationMinutes = sessionDurationMs / 60000;
    const globalInteractionRate = sessionDurationMinutes > 0 ? this.totalInteractions / sessionDurationMinutes : 0;

    // Convert project data to plain object and return metrics using immer
    return produce({} as InteractionMetrics, draft => {
      draft.timeToFirstInteractionMs = this.firstInteractionActiveTimeMs;
      draft.totalInteractions = this.totalInteractions;
      draft.interactionRatePerMinute = globalInteractionRate;
      draft.sessionStartMs = this.sessionStartMs || 0;
      draft.firstInteractionMs = this.firstInteractionActiveTimeMs;
      draft.totalViews = this.totalViews;
      draft.externalClicks = this.externalClicks;
      draft.projectMetrics = {};
      
      this.projectData.forEach((data, projectId) => {
        draft.projectMetrics[projectId] = { ...data };
      });
    });
  }

  // Clear all metrics
  clear() {
    this.stopTracking();
    this.sessionStartMs = null;
    this.firstInteractionActiveTimeMs = null;
    this.totalInteractions = 0;
    this.totalViews = 0;
    this.externalClicks = 0;
    this.projectData.clear();
  }

  // Re-scan for new project elements (useful for dynamic content)
  rescanProjects() {
    if (!this.containerElement || !this.intersectionObserver) return;

    // Stop observing current elements
    this.intersectionObserver.disconnect();
    
    // Setup again with current container
    this.setupIntersectionObserver(this.containerElement);
  }
}

export const interactionTracker = new InteractionTracker();
export default interactionTracker;