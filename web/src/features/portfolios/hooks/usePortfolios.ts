import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
export function useListPortfolios() {
  return useQuery({
    queryKey: portfolioKeys.list(),
    queryFn: listPortfolios,
  });
}

/**
 * Get portfolio by ID query
 */
export function useGetPortfolio(id: string) {
  return useQuery({
    queryKey: portfolioKeys.detail(id),
    queryFn: () => getPortfolio(id),
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
    onSuccess: () => {
      // Invalidate portfolios list to refetch
      queryClient.invalidateQueries({ queryKey: portfolioKeys.list() });
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
      // Invalidate list to show updated data
      queryClient.invalidateQueries({ queryKey: portfolioKeys.list() });
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
      // Invalidate list to refetch without deleted item
      queryClient.invalidateQueries({ queryKey: portfolioKeys.list() });
    },
  });
}
