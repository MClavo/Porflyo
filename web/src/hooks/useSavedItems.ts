import { useCallback, useMemo } from 'react';
import { useSavedSections } from './portfolio/useSavedSections';
import { mapPublicSavedSectionToSavedItem } from '../mappers/savedSections.mapper';
import type { SavedItem } from '../types/itemDto';
import type { PublicSavedSectionDto } from '../types/savedSections.types';

/**
 * Global hook for managing saved items across the application.
 * 
 * Optimization Strategy:
 * - Loads saved items once and keeps them cached during the session
 * - Uses optimistic updates for add/delete operations (no server refetch)
 * - Only refetches from server on:
 *   - Initial load/page refresh
 *   - Manual refresh (login/logout)
 *   - Auto-refresh every 5 minutes
 *   - Network reconnection
 * - Saves costly API calls by avoiding refetch on every mutation
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
    console.log('Manually refreshing saved items');
    refetch();
  }, [refetch]);

  // Function to manually invalidate and refresh (for login/logout)
  const forceRefreshSavedItems = useCallback(() => {
    console.log('Force refreshing saved items (login/logout)');
    // This will force a fresh fetch from the server
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
    forceRefreshSavedItems,
    getSavedItemsForSection,
    itemExistsByName,
  };
}
