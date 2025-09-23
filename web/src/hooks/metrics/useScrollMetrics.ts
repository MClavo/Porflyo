// React hook for scroll metrics
// Provides easy integration with React components

import { useEffect, useState, useCallback } from 'react';
import { scrollTracker, type ScrollMetrics } from '../../lib/analytics/scrollTracker';

export type UseScrollMetricsOptions = {
  autoStart?: boolean;
  updateInterval?: number;
  element?: HTMLElement | null;
};

export type UseScrollMetricsReturn = {
  metrics: ScrollMetrics;
  engagementScore: number;
  isTracking: boolean;
  startTracking: (element?: HTMLElement | null) => void;
  stopTracking: () => void;
  clearMetrics: () => void;
};

export function useScrollMetrics(options: UseScrollMetricsOptions = {}): UseScrollMetricsReturn {
  const { autoStart = true, updateInterval = 1000, element = null } = options;
  
  const [metrics, setMetrics] = useState<ScrollMetrics>(() => scrollTracker.getMetrics());
  const [engagementScore, setEngagementScore] = useState<number>(() => scrollTracker.getEngagementScore());
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = useCallback((targetElement?: HTMLElement | null) => {
    const elementToUse = targetElement ?? element;
    scrollTracker.startTracking(elementToUse);
    setIsTracking(true);
  }, [element]);

  const stopTracking = useCallback(() => {
    scrollTracker.stopTracking();
    setIsTracking(false);
    // Update metrics one last time
    setMetrics(scrollTracker.getMetrics());
    setEngagementScore(scrollTracker.getEngagementScore());
  }, []);

  const clearMetrics = useCallback(() => {
    scrollTracker.clear();
    setMetrics(scrollTracker.getMetrics());
    setEngagementScore(scrollTracker.getEngagementScore());
  }, []);

  // Update metrics periodically
  useEffect(() => {
    let intervalId: number;
    
    if (isTracking) {
      intervalId = window.setInterval(() => {
        setMetrics(scrollTracker.getMetrics());
        setEngagementScore(scrollTracker.getEngagementScore());
      }, updateInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, updateInterval]);

  // Auto-start tracking if enabled
  useEffect(() => {
    if (autoStart) {
      startTracking(element);
    }

    return () => {
      if (autoStart) {
        stopTracking();
      }
    };
  }, [autoStart, element, startTracking, stopTracking]);

  return {
    metrics,
    engagementScore,
    isTracking,
    startTracking,
    stopTracking,
    clearMetrics,
  };
}

export default useScrollMetrics;