// Component to display interaction metrics
// Shows time to first interaction, interaction rate, and referrer source

import { useEffect, useState } from 'react';
import { metricsCollector } from '../../lib/analytics/collector';
import type { InteractionMetrics } from '../../lib/analytics/interactionTracker';
import '../../styles/InteractionMetrics.css';

export type InteractionMetricsDisplayProps = {
  showProjectBreakdown?: boolean;
  updateInterval?: number;
  className?: string;
};

export function InteractionMetricsDisplay({ 
  showProjectBreakdown = true,
  updateInterval = 1000,
  className = ""
}: InteractionMetricsDisplayProps) {
  const [metrics, setMetrics] = useState<InteractionMetrics | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = metricsCollector.getMetrics();
      setMetrics(currentMetrics.interactionMetrics || null);
    };

    // Initial update
    updateMetrics();

    // Set up interval for updates
    const intervalId = setInterval(updateMetrics, updateInterval);

    return () => clearInterval(intervalId);
  }, [updateInterval]);

  const formatTime = (ms: number | null) => {
    if (ms === null || ms === 0) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatRate = (rate: number) => {
    return rate.toFixed(1);
  };

  if (!metrics) {
    return (
      <div className={`interaction-metrics-display ${className}`}>
        <h3>🔄 Interaction Metrics</h3>
        <p className="no-data">No interaction data available</p>
      </div>
    );
  }

  return (
    <div className={`interaction-metrics-display ${className}`}>
      <div className="interaction-metrics-header">
        <h3>🔄 Interaction Metrics</h3>
        <div className="session-info">
          Session: {formatTime(Date.now() - metrics.sessionStartMs)}
        </div>
      </div>

      <div className="global-metrics">
        <div className="metric-card">
          <div className="metric-label">Time to First Interaction</div>
          <div className="metric-value ttfi">
            {formatTime(metrics.timeToFirstInteractionMs)}
          </div>
          <div className="metric-description">
            {metrics.timeToFirstInteractionMs === null 
              ? 'No interactions yet' 
              : metrics.timeToFirstInteractionMs < 5000 
                ? 'Fast engagement' 
                : 'Slower to engage'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Interaction Rate</div>
          <div className="metric-value rate">
            {formatRate(metrics.interactionRatePerMinute)}/min
          </div>
          <div className="metric-description">
            {metrics.totalInteractions} total interactions
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">External Clicks</div>
          <div className="metric-value external">
            {metrics.externalClicks}
          </div>
          <div className="metric-description">
            Total external link clicks
          </div>
        </div>
      </div>

      {showProjectBreakdown && Object.keys(metrics.projectMetrics).length > 0 && (
        <div className="project-breakdown">
          <h4>📊 Project Breakdown</h4>
          <div className="project-list">
            {Object.entries(metrics.projectMetrics).map(([projectId, data]) => (
              <div key={projectId} className="project-item">
                <div className="project-header">
                  <span className="project-id">{projectId}</span>
                  <span className={`view-status ${data.isCurrentlyInView ? 'in-view' : 'out-of-view'}`}>
                    {data.isCurrentlyInView ? '👁️ In View' : '⚫ Out of View'}
                  </span>
                </div>
                <div className="project-metrics">
                  <div className="project-metric">
                    <span>TTFI:</span>
                    <strong>{formatTime(data.timeToFirstInteractionMs)}</strong>
                  </div>
                  <div className="project-metric">
                    <span>Rate:</span>
                    <strong>{formatRate(data.interactionRatePerMinute)}/min</strong>
                  </div>
                  <div className="project-metric">
                    <span>Interactions:</span>
                    <strong>{data.totalInteractions}</strong>
                  </div>
                  <div className="project-metric">
                    <span>Time in View:</span>
                    <strong>{formatTime(data.timeInViewMs)}</strong>
                  </div>
                  <div className="project-metric">
                    <span>External Clicks:</span>
                    <strong>{data.externalClicks}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="metrics-summary">
        <div className="summary-item">
          <span>Total Views:</span>
          <strong>{metrics.totalViews}</strong>
        </div>
        <div className="summary-item">
          <span>Total Interactions:</span>
          <strong>{metrics.totalInteractions}</strong>
        </div>
        <div className="summary-item">
          <span>External Clicks:</span>
          <strong>{metrics.externalClicks}</strong>
        </div>
      </div>
    </div>
  );
}

export default InteractionMetricsDisplay;