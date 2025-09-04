import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSavedSection,
  listSavedSections,
  deleteSavedSection,
} from '../api/savedSections.api';
import type { SavedSectionCreateDto } from '../../../types/dto';

/**
 * TanStack Query hooks for saved sections API
 */

// Query keys
export const savedSectionKeys = {
  all: ['savedSections'] as const,
  list: () => [...savedSectionKeys.all, 'list'] as const,
};

/**
 * List saved sections query
 */
export function useListSavedSections() {
  return useQuery({
    queryKey: savedSectionKeys.list(),
    queryFn: listSavedSections,
  });
}

/**
 * Create saved section mutation
 */
export function useCreateSavedSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SavedSectionCreateDto) => createSavedSection(data),
    onSuccess: () => {
      // Invalidate saved sections list to refetch
      queryClient.invalidateQueries({ queryKey: savedSectionKeys.list() });
    },
  });
}

/**
 * Delete saved section mutation
 */
export function useDeleteSavedSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSavedSection(id),
    onSuccess: () => {
      // Invalidate saved sections list to refetch
      queryClient.invalidateQueries({ queryKey: savedSectionKeys.list() });
    },
  });
}
