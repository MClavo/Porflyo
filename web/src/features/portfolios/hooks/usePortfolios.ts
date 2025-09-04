import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PublicPortfolioDto } from '../../../types/dto';
import {
  createPortfolio,
  listPortfolios,
  getPortfolio,
  patchPortfolio,
  deletePortfolio,
  publishPortfolio,
} from '../api/portfolios.api';
import type {
  PortfolioCreateDto,
  PortfolioPatchDto,
  PortfolioPublishDto,
} from '../../../types/dto';

/**
 * TanStack Query hooks for portfolios API
 */

// Query keys
export const portfolioKeys = {
  all: ['portfolios'] as const,
  list: () => [...portfolioKeys.all, 'list'] as const,
  detail: (id: string) => [...portfolioKeys.all, 'detail', id] as const,
};

/**
 * List portfolios query
 */
// Allow callers to pass react-query options; use any to avoid fragile generic mismatches
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useListPortfolios(options?: any) {
  return useQuery<PublicPortfolioDto[]>({
    queryKey: portfolioKeys.list(),
    queryFn: listPortfolios,
    // Allow callers to override options like enabled, staleTime, refetch behavior
    ...options,
  });
}

/**
 * Get portfolio by ID query
 * First checks if the portfolio is available in the list cache to avoid unnecessary requests
 */
export function useGetPortfolio(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: portfolioKeys.detail(id),
    queryFn: () => {
      // First try to get the portfolio from the list cache
      const listData = queryClient.getQueryData<PublicPortfolioDto[]>(portfolioKeys.list());
      if (listData) {
        const cachedPortfolio = listData.find(p => p.id === id);
        if (cachedPortfolio) {
          return Promise.resolve(cachedPortfolio);
        }
      }
      // If not found in cache, fetch from API
      return getPortfolio(id);
    },
    enabled: !!id,
  });
}

/**
 * Create portfolio mutation
 */
export function useCreatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PortfolioCreateDto) => createPortfolio(data),
    onSuccess: (newPortfolio) => {
      // Add the new portfolio to the list cache
      queryClient.setQueryData<PublicPortfolioDto[]>(
        portfolioKeys.list(),
        (oldData) => {
          if (!oldData) return [newPortfolio];
          return [newPortfolio, ...oldData];
        }
      );
      
      // Set the new portfolio in the detail cache
      queryClient.setQueryData(
        portfolioKeys.detail(newPortfolio.id),
        newPortfolio
      );
    },
  });
}

/**
 * Update portfolio mutation
 */
export function usePatchPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PortfolioPatchDto }) =>
      patchPortfolio(id, patch),
    onSuccess: (updatedPortfolio) => {
      // Update the specific portfolio cache
      queryClient.setQueryData(
        portfolioKeys.detail(updatedPortfolio.id),
        updatedPortfolio
      );
      
      // Update the portfolio in the list cache as well
      queryClient.setQueryData<PublicPortfolioDto[]>(
        portfolioKeys.list(),
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(portfolio => 
            portfolio.id === updatedPortfolio.id ? updatedPortfolio : portfolio
          );
        }
      );
    },
  });
}

/**
 * Publish portfolio mutation
 */
export function usePublishPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PortfolioPublishDto }) =>
      publishPortfolio(id, body),
    onSuccess: (updatedPortfolio) => {
      // Update the specific portfolio cache
      queryClient.setQueryData(
        portfolioKeys.detail(updatedPortfolio.id),
        updatedPortfolio
      );
      // Invalidate list to show updated data
      queryClient.invalidateQueries({ queryKey: portfolioKeys.list() });
    },
  });
}

/**
 * Delete portfolio mutation
 */
export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePortfolio(id),
    onSuccess: (_data, deletedId) => {
      // Remove the specific portfolio from cache
      queryClient.removeQueries({ queryKey: portfolioKeys.detail(deletedId) });
      
      // Remove the portfolio from the list cache as well
      queryClient.setQueryData<PublicPortfolioDto[]>(
        portfolioKeys.list(),
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter(portfolio => portfolio.id !== deletedId);
        }
      );
    },
  });
}
