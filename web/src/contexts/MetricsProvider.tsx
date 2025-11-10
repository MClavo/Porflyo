/**
 * React Context Provider for metrics data with skeleton loading
 */

import React, { createContext, useEffect, useState } from 'react';
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
 * Full-page skeleton loader for metrics data
 */
function MetricsSkeletonLoader() {
  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      background: 'var(--dashboard-bg)',
      minHeight: '100vh',
      color: 'var(--text-primary)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            height: '40px',
            width: '300px',
            background: 'linear-gradient(90deg, var(--card-border) 25%, var(--card-border-hover) 50%, var(--card-border) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-loading 1.5s infinite',
            borderRadius: 'var(--radius-md)'
          }} />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              height: '20px',
              width: '150px',
              background: 'linear-gradient(90deg, var(--card-border) 25%, var(--card-border-hover) 50%, var(--card-border) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skeleton-loading 1.5s infinite',
              borderRadius: 'var(--radius-sm)'
            }} />
            <div style={{
              height: '20px',
              width: '120px',
              background: 'linear-gradient(90deg, var(--card-border) 25%, var(--card-border-hover) 50%, var(--card-border) 75%)',
              backgroundSize: '200% 100%',
              animation: 'skeleton-loading 1.5s infinite',
              borderRadius: 'var(--radius-sm)'
            }} />
          </div>
        </div>
        
        {/* Metrics cards grid skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            height: '30px',
            width: '200px',
            background: 'linear-gradient(90deg, var(--card-border) 25%, var(--card-border-hover) 50%, var(--card-border) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-loading 1.5s infinite',
            borderRadius: 'var(--radius-md)'
          }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} style={{
                padding: '1rem',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--card-bg)',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{
                  height: '20px',
                  width: '80%',
                  background: 'linear-gradient(90deg, var(--card-border) 25%, var(--card-border-hover) 50%, var(--card-border) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  borderRadius: 'var(--radius-sm)'
                }} />
                <div style={{
                  height: '32px',
                  width: '60%',
                  background: 'linear-gradient(90deg, var(--card-border) 25%, var(--card-border-hover) 50%, var(--card-border) 75%)',  
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  borderRadius: 'var(--radius-sm)'
                }} />
                <div style={{
                  height: '16px',
                  width: '90%',
                  background: 'linear-gradient(90deg, var(--card-border) 25%, var(--card-border-hover) 50%, var(--card-border) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  borderRadius: 'var(--radius-sm)'
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Metrics Provider component
 * Loads bootstrap data once on mount and shows skeleton while loading
 */
export function MetricsProvider({ children, portfolioId }: MetricsProviderProps) {
  const { loadBootstrap, isLoading, error, dailyIndex, slotIndex } = useMetricsStore();
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeMetrics = async () => {
      try {
        await loadBootstrap(portfolioId);
        if (isMounted) {
          setHasInitialized(true);
        }
      } catch (error) {
        console.error('Failed to load metrics:', error);
        if (isMounted) {
          setHasInitialized(true); // Still set to true to show error state
        }
      }
    };
    
    initializeMetrics();
    
    return () => {
      isMounted = false;
    };
  }, [portfolioId, loadBootstrap]);
  
  // Show skeleton while loading or not yet initialized
  if (isLoading || !hasInitialized) {
    return <MetricsSkeletonLoader />;
  }
  
  // Show error state (you might want to customize this)
  if (error) {
    return (
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        background: 'var(--dashboard-bg)',
        minHeight: '100vh'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 0',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            color: 'var(--status-negative)',
            fontSize: 'var(--font-lg)',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            Failed to load metrics data
          </div>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-sm)'
          }}>
            {error}
          </div>
        </div>
      </div>
    );
  }
  
  // Check if data is empty (no dailyAgg or slots)
  const hasNoData = dailyIndex.length === 0 && slotIndex.length === 0;
  if (hasNoData) {
    return (
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        background: 'var(--dashboard-bg)',
        minHeight: '100vh'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 0',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '2rem',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            No project data available
          </div>
          <div style={{
            color: 'var(--text-tertiary)',
            fontSize: '1.125rem'
          }}>
            There is not enough data to display metrics yet. Please check back later.
          </div>
        </div>
      </div>
    );
  }
  
  // Provide context (empty for now, store handles state)
  const contextValue: MetricsContextValue = {};
  
  return (
    <MetricsContext.Provider value={contextValue}>
      {children}
    </MetricsContext.Provider>
  );
}

// useMetricsContext hook moved to ../hooks/useMetrics.ts to fix fast refresh
