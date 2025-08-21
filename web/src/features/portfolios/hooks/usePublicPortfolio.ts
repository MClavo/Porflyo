import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getPublicPortfolioView, isSlugAvailable } from '../api/public.api';

/**
 * TanStack Query hooks for public portfolio API
 */

// Query keys
export const publicPortfolioKeys = {
  all: ['publicPortfolio'] as const,
  view: (slug: string) => [...publicPortfolioKeys.all, 'view', slug] as const,
  slugCheck: (slug: string) => [...publicPortfolioKeys.all, 'slugCheck', slug] as const,
};

/**
 * Get public portfolio view by slug
 */
export function useGetPublicPortfolioView(slug: string) {
  return useQuery({
    queryKey: publicPortfolioKeys.view(slug),
    queryFn: () => getPublicPortfolioView(slug),
    enabled: !!slug,
    retry: (failureCount, error) => {
      // Don't retry on NOT_FOUND
      if (typeof error === 'string' && error === "NOT_FOUND") {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
  });
}

/**
 * Check slug availability (not debounced)
 */
export function useIsSlugAvailable(slug: string, enabled: boolean = true) {
  return useQuery({
    queryKey: publicPortfolioKeys.slugCheck(slug),
    queryFn: () => isSlugAvailable(slug),
    enabled: enabled && !!slug && slug.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    retry: false, // Don't retry slug availability checks
  });
}

/**
 * Simple debounce function
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced slug availability hook
 * Checks slug availability with 400ms debounce
 */
export function useDebouncedSlugAvailability(
  slug: string,
  enabled: boolean = true,
  debounceMs: number = 400
) {
  const debouncedSlug = useDebounce(slug, debounceMs);

  // Use the debounced slug for the actual query
  return useIsSlugAvailable(debouncedSlug, enabled);
}
