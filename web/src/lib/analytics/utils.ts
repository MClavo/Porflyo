// Analytics utilities and exports
// Central point for all analytics functionality

export { metricsCollector, type ProjectMetrics, type TopCellData } from './collector';
export { scrollTracker, type ScrollMetrics, type ScrollEvent } from './scrollTracker';
export { track, initAnalytics, getAnalyticsClient, type AnalyticsClient } from './index';

import { metricsCollector } from './collector';
import { scrollTracker } from './scrollTracker';
import { track, initAnalytics } from './index';

// Helper function to get complete metrics including scroll data
export function getCompleteMetrics() {
  return metricsCollector.getMetrics();
}

// Helper function to get engagement insights
export function getEngagementInsights() {
  const metrics = metricsCollector.getMetrics();
  const scrollEngagement = scrollTracker.getEngagementScore();
  
  const totalInteractions = Object.values(metrics.projectInteractions).reduce(
    (sum, project) => sum + project.buttonClicks + project.linkClicks, 
    0
  );
  
  const sessionTimeMinutes = metrics.activeTimeMs / 60000;
  
  return {
    scrollEngagement,
    totalInteractions,
    sessionTimeMinutes,
    overallEngagement: Math.round((scrollEngagement + Math.min(totalInteractions * 5, 30) + Math.min(sessionTimeMinutes * 2, 20)) / 3),
    insights: {
      isActiveSession: metrics.activeTimeMs > 30000, // More than 30 seconds
      hasScrolledSignificantly: metrics.scrollMetrics?.totalScrollDistance && metrics.scrollMetrics.totalScrollDistance > 1000,
      hasInteractedWithProjects: totalInteractions > 0,
      scrollPattern: metrics.scrollMetrics?.scrollDirection || 'none'
    }
  };
}

export default {
  metricsCollector,
  scrollTracker,
  getCompleteMetrics,
  getEngagementInsights,
  track,
  initAnalytics
};