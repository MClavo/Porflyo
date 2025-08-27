import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createSavedSection, 
  getSavedSections, 
  deleteSavedSection 
} from '../../api/clients/savedSections.api';
import type { 
  SavedSectionCreateDto, 
  PublicSavedSectionDto 
} from '../../types/savedSections.types';

// Query keys for react-query
export const SAVED_SECTIONS_QUERY_KEYS = {
  all: ['savedSections'] as const,
  lists: () => [...SAVED_SECTIONS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...SAVED_SECTIONS_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...SAVED_SECTIONS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SAVED_SECTIONS_QUERY_KEYS.details(), id] as const,
};

/**
 * Hook to fetch all saved sections
 */
export function useSavedSections() {
  return useQuery({
    queryKey: SAVED_SECTIONS_QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await getSavedSections();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to create a new saved section
 */
export function useCreateSavedSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (createDto: SavedSectionCreateDto) => {
      const response = await createSavedSection(createDto);
      return response.data;
    },
    onSuccess: (newSection: PublicSavedSectionDto) => {
      // Update the cache with the new section
      queryClient.setQueryData<PublicSavedSectionDto[]>(
        SAVED_SECTIONS_QUERY_KEYS.lists(),
        (oldData) => {
          if (!oldData) return [newSection];
          return [...oldData, newSection];
        }
      );

      // Optionally invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: SAVED_SECTIONS_QUERY_KEYS.lists(),
      });
    },
    onError: (error) => {
      console.error('Error creating saved section:', error);
    },
  });
}

/**
 * Hook to delete a saved section
 */
export function useDeleteSavedSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await deleteSavedSection(itemId);
      return response.data;
    },
    onSuccess: (_, deletedItemId: string) => {
      // Remove the deleted section from cache
      queryClient.setQueryData<PublicSavedSectionDto[]>(
        SAVED_SECTIONS_QUERY_KEYS.lists(),
        (oldData) => {
          if (!oldData) return [];
          return oldData.filter(section => section.id !== deletedItemId);
        }
      );

      // Optionally invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: SAVED_SECTIONS_QUERY_KEYS.lists(),
      });
    },
    onError: (error) => {
      console.error('Error deleting saved section:', error);
    },
  });
}

/**
 * Hook to get a specific saved section by ID
 * This uses the cached data from the list query
 */
export function useSavedSection(itemId: string) {
  const { data: allSections, ...rest } = useSavedSections();
  
  const section = allSections?.find(s => s.id === itemId);
  
  return {
    ...rest,
    data: section,
  };
}

/**
 * Utility hook to refresh saved sections data
 */
export function useRefreshSavedSections() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({
      queryKey: SAVED_SECTIONS_QUERY_KEYS.all,
    });
  };
}
