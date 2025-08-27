import { useCallback, useMemo } from 'react';
import { useSavedSections } from './portfolio/useSavedSections';
import { mapPublicSavedSectionToSavedItem } from '../mappers/savedSections.mapper';
import type { SavedItem } from '../types/itemDto';
import type { PublicSavedSectionDto } from '../types/savedSections.types';

/**
 * Global hook for managing saved items across the application.
 * Loads saved items once and keeps them cached during the session.
 */
export function useSavedItems() {
  const {
    data: savedSections,
    isLoading,
    isError,
    error,
    refetch,
  } = useSavedSections();

  // Convert API data to SavedItem format with memoization
  const savedItems: SavedItem[] = useMemo(() => {
    if (!savedSections) return [];
    
    return savedSections.map((section: PublicSavedSectionDto, index: number) => 
      mapPublicSavedSectionToSavedItem(section, Date.now() + index)
    );
  }, [savedSections]);

  // Refetch when user logs in or when explicitly requested
  const refreshSavedItems = useCallback(() => {
    refetch();
  }, [refetch]);

  // Function to get saved items for a specific section
  const getSavedItemsForSection = useCallback(() => {
    return savedItems.filter(item => item.sectionType === 'savedItems');
  }, [savedItems]);

  // Function to check if an item exists by name
  const itemExistsByName = useCallback((name: string) => {
    return savedItems.some(item => item.savedName === name);
  }, [savedItems]);

  return {
    savedItems,
    isLoading,
    isError,
    error,
    refreshSavedItems,
    getSavedItemsForSection,
    itemExistsByName,
  };
}
