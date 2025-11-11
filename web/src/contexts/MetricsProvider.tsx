/**
 * React Context Provider for metrics data with skeleton loading
 */

import React, { createContext, useEffect } from 'react';
import { useMetricsStore } from '../state/metrics.store';

/**
 * Context interface - empty since we use the store directly
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MetricsContextValue {}

/**
 * Metrics context
 */
const MetricsContext = createContext<MetricsContextValue | null>(null);

/**
 * Props for MetricsProvider
 */
interface MetricsProviderProps {
  children: React.ReactNode;
  portfolioId: string;
}

/**
 * Metrics Provider component
 * Loads bootstrap data once on mount and provides loading state to children
 */
export function MetricsProvider({ children, portfolioId }: MetricsProviderProps) {
  const { loadBootstrap } = useMetricsStore();
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeMetrics = async () => {
      try {
        await loadBootstrap(portfolioId);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      }
    };
    
    if (isMounted) {
      initializeMetrics();
    }
    
    return () => {
      isMounted = false;
    };
  }, [portfolioId, loadBootstrap]);
  
  // Provide context (empty for now, store handles state)
  const contextValue: MetricsContextValue = {};
  
  // Always render children (which includes the navbars)
  // The loading/error states are handled by the children components themselves
  return (
    <MetricsContext.Provider value={contextValue}>
      {children}
    </MetricsContext.Provider>
  );
}

// useMetricsContext hook moved to ../hooks/useMetrics.ts to fix fast refresh
