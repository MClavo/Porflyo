import { useState, useCallback } from 'react';
import type { PublicPortfolioView, AvailabilityResponseDto } from '../types';
import { getPublicPortfolioView, isSlugAvailable } from '../clients/public.api';

/**
 * Simple hooks for public API endpoints
 */

interface UsePublicPortfolioResult {
  getPortfolio: (slug: string) => Promise<PublicPortfolioView>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get public portfolio by slug
 */
export function usePublicPortfolio(): UsePublicPortfolioResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPortfolio = useCallback(async (slug: string): Promise<PublicPortfolioView> => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPublicPortfolioView(slug);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch public portfolio';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getPortfolio, loading, error };
}

interface UseSlugAvailabilityResult {
  checkAvailability: (slug: string) => Promise<AvailabilityResponseDto>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to check slug availability
 */
export function useSlugAvailability(): UseSlugAvailabilityResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async (slug: string): Promise<AvailabilityResponseDto> => {
    try {
      setLoading(true);
      setError(null);
      const result = await isSlugAvailable(slug);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check slug availability';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkAvailability, loading, error };
}