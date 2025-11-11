// Component to display scroll metrics
// Shows real-time scroll engagement data

import { useScrollMetrics } from '../../hooks/metrics/useScrollMetrics';
import '../../styles/ScrollMetrics.css';

export type ScrollMetricsDisplayProps = {
  showEngagementScore?: boolean;
  showDetailedMetrics?: boolean;
  className?: string;
};

export function ScrollMetricsDisplay({ 
  showEngagementScore = true, 
  showDetailedMetrics = true,
  className = ""
}: ScrollMetricsDisplayProps) {
  const { metrics, engagementScore, isTracking, startTracking, stopTracking, clearMetrics } = useScrollMetrics();

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDistance = (pixels: number) => {
    if (pixels < 1000) return `${pixels}px`;
    return `${(pixels / 1000).toFixed(1)}k px`;
  };

  return (
    <div className={`scroll-metrics-display ${className}`}>
      <div className="scroll-metrics-header">
        <h3>📊 Scroll Metrics</h3>
        <div className="scroll-metrics-controls">
          <button 
            onClick={() => isTracking ? stopTracking() : startTracking()}
            className={`control-button ${isTracking ? 'stop' : 'start'}`}
          >
            {isTracking ? '⏸️ Stop' : '▶️ Start'}
          </button>
          <button 
            onClick={clearMetrics}
            className="control-button clear"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {showEngagementScore && (
        <div className="engagement-score">
          <strong>Engagement Score: {engagementScore}/100</strong>
          <div className="engagement-bar">
            <div className="engagement-fill" style={{ 
              width: `${engagementScore}%`, 
              backgroundColor: engagementScore > 70 ? '#4CAF50' : engagementScore > 40 ? '#FF9800' : '#F44336'
            }} />
          </div>
        </div>
      )}

      {showDetailedMetrics && (
        <div className="detailed-metrics">
          <div className="metric-row">
            <span>Distance:</span>
            <strong>{formatDistance(metrics.totalScrollDistance)}</strong>
          </div>
          <div className="metric-row">
            <span>Avg Speed:</span>
            <strong>{metrics.averageScrollVelocity.toFixed(1)} px/s</strong>
          </div>
          <div className="metric-row">
            <span>Max Speed:</span>
            <strong>{metrics.maxScrollVelocity.toFixed(1)} px/s</strong>
          </div>
          <div className="metric-row">
            <span>Sessions:</span>
            <strong>{metrics.scrollSessions}</strong>
          </div>
          <div className="metric-row">
            <span>Time Scrolling:</span>
            <strong>{formatTime(metrics.timeSpentScrolling)}</strong>
          </div>
          <div className="metric-row">
            <span>Direction:</span>
            <strong className={`direction-${metrics.scrollDirection}`}>
              {metrics.scrollDirection === 'down' ? '⬇️ Down' : 
               metrics.scrollDirection === 'up' ? '⬆️ Up' : '↕️ Mixed'}
            </strong>
          </div>
        </div>
      )}

      <div className="tracking-status">
        Status: {isTracking ? '🟢 Tracking' : '⚫ Stopped'}
      </div>
    </div>
  );
}

export default ScrollMetricsDisplay;