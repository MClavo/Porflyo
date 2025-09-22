import { useState, useEffect, useCallback } from 'react';
import type { PublicSavedSectionDto, SavedSectionCreateDto, ApiResponse } from '../types';
import { createSavedSection, getSavedSections, deleteSavedSection } from '../clients/savedSections.api';

/**
 * Simple hooks for saved sections API
 */

interface UseSavedSectionsResult {
  sections: PublicSavedSectionDto[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get all saved sections
 */
export function useSavedSections(): UseSavedSectionsResult {
  const [sections, setSections] = useState<PublicSavedSectionDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSavedSections();
      setSections(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved sections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return {
    sections,
    loading,
    error,
    refetch: fetchSections,
  };
}

interface CreateSavedSectionResult {
  mutate: (data: SavedSectionCreateDto) => Promise<ApiResponse<PublicSavedSectionDto>>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to create a new saved section
 */
export function useCreateSavedSection(): CreateSavedSectionResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: SavedSectionCreateDto): Promise<ApiResponse<PublicSavedSectionDto>> => {
    try {
      setLoading(true);
      setError(null);
      const result = await createSavedSection(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create saved section';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

interface DeleteSavedSectionResult {
  mutate: (id: string) => Promise<ApiResponse<void>>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to delete a saved section
 */
export function useDeleteSavedSection(): DeleteSavedSectionResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string): Promise<ApiResponse<void>> => {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteSavedSection(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete saved section';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}