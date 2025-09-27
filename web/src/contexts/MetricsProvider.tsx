/**
 * React Context Provider for metrics data with skeleton loading
 */

import React, { createContext, useEffect, useState } from 'react';
import { Skeleton, Stack, Box, Container } from '@chakra-ui/react';
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
    <Container maxW="7xl" py={8}>
      <Stack gap={8}>
        {/* Header skeleton */}
        <Stack gap={4}>
          <Skeleton height="40px" width="300px" />
          <Stack direction="row" gap={4}>
            <Skeleton height="20px" width="150px" />
            <Skeleton height="20px" width="120px" />
            <Skeleton height="20px" width="180px" />
          </Stack>
        </Stack>
        
        {/* Metrics cards grid skeleton */}
        <Stack gap={6}>
          <Skeleton height="30px" width="200px" />
          <Stack direction={{ base: 'column', md: 'row' }} gap={6}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Box key={index} flex="1" minW="200px">
                <Stack gap={3} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                  <Skeleton height="20px" width="80%" />
                  <Skeleton height="32px" width="60%" />
                  <Skeleton height="16px" width="90%" />
                </Stack>
              </Box>
            ))}
          </Stack>
        </Stack>
        
        {/* Chart area skeleton */}
        <Stack gap={4}>
          <Skeleton height="30px" width="250px" />
          <Skeleton height="400px" width="100%" />
        </Stack>
        
        {/* Additional content blocks */}
        <Stack direction={{ base: 'column', lg: 'row' }} gap={6} align="start">
          <Stack flex="2" gap={4}>
            <Skeleton height="25px" width="200px" />
            <Skeleton height="300px" width="100%" />
          </Stack>
          <Stack flex="1" gap={4}>
            <Skeleton height="25px" width="150px" />
            <Stack gap={3}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} height="60px" width="100%" />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}

/**
 * Metrics Provider component
 * Loads bootstrap data once on mount and shows skeleton while loading
 */
export function MetricsProvider({ children, portfolioId }: MetricsProviderProps) {
  const { loadBootstrap, isLoading, error } = useMetricsStore();
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
      <Container maxW="7xl" py={8}>
        <Box textAlign="center" py={10}>
          <Box color="red.500" fontSize="lg" mb={4}>
            Failed to load metrics data
          </Box>
          <Box color="gray.600" fontSize="sm">
            {error}
          </Box>
        </Box>
      </Container>
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
