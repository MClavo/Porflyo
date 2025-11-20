import { useState, useEffect, useCallback } from 'react';
import type { PublicPortfolioDto } from '../types/dto';
import {
  createPortfolio,
  listPortfolios,
  getPortfolio,
  patchPortfolio,
  deletePortfolio,
  publishPortfolio,
} from '../clients/portfolios.api';
import type {
  PortfolioCreateDto,
  PortfolioPatchDto,
  PortfolioPublishDto,
} from '../types/dto';

/**
 * Simple hooks for portfolios API without TanStack Query
 */

interface UsePortfoliosResult {
  portfolios: PublicPortfolioDto[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to list all portfolios
 */
export function usePortfolios(): UsePortfoliosResult {
  const [portfolios, setPortfolios] = useState<PublicPortfolioDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listPortfolios();
      setPortfolios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return {
    portfolios,
    loading,
    error,
    refetch: fetchPortfolios,
  };
}

interface UsePortfolioResult {
  portfolio: PublicPortfolioDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get a specific portfolio by ID
 */
export function usePortfolio(id: string): UsePortfolioResult {
  const [portfolio, setPortfolio] = useState<PublicPortfolioDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getPortfolio(id);
      
      // Handle case where backend returns array instead of single object
      const portfolioData = Array.isArray(data) ? data[0] : data;
      setPortfolio(portfolioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return {
    portfolio,
    loading,
    error,
    refetch: fetchPortfolio,
  };
}

interface MutationResult<T> {
  mutate: (data: T) => Promise<PublicPortfolioDto>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to create a new portfolio
 */
export function useCreatePortfolio(): MutationResult<PortfolioCreateDto> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: PortfolioCreateDto): Promise<PublicPortfolioDto> => {
    try {
      setLoading(true);
      setError(null);
      const result = await createPortfolio(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create portfolio';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Hook to update a portfolio
 */
export function usePatchPortfolio(): MutationResult<{ id: string; patch: PortfolioPatchDto }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ id, patch }: { id: string; patch: PortfolioPatchDto }): Promise<PublicPortfolioDto> => {
    try {
      setLoading(true);
      setError(null);
      const result = await patchPortfolio(id, patch);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update portfolio';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Hook to publish a portfolio
 */
export function usePublishPortfolio(): MutationResult<{ id: string; body: PortfolioPublishDto }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ id, body }: { id: string; body: PortfolioPublishDto }): Promise<PublicPortfolioDto> => {
    try {
      setLoading(true);
      setError(null);
      const result = await publishPortfolio(id, body);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish portfolio';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

interface DeleteMutationResult {
  mutate: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to delete a portfolio
 */
export function useDeletePortfolio(): DeleteMutationResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deletePortfolio(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete portfolio';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}