import { useState, useEffect, useCallback, useRef } from 'react';
import type { PublicSavedSectionDto, PublicUserDto } from '../types';
import { getSavedSections } from '../clients/savedSections.api';
import { isPageRefresh } from '../../lib/pageRefresh';

export interface SavedSectionsResult {
  sections: PublicSavedSectionDto[];
  isLoading: boolean;
  error: string | null;
  addSection: (section: PublicSavedSectionDto) => void;
  removeSection: (id: string) => void;
}

export function useSavedSectionsManager(user: PublicUserDto | null, authIsLoading = false): SavedSectionsResult {
  // Initialize from localStorage if user exists
  const [sections, setSections] = useState<PublicSavedSectionDto[]>(() => {
    if (!user?.email) return [];
    
    const cached = localStorage.getItem(`savedSections_${user.email}`);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Refs to avoid duplicate fetches and infinite loops during refresh
  const fetchInProgressRef = useRef(false);
  const startedDuringAuthLoadRef = useRef(false);
  const fetchedForUserRef = useRef<string | null>(null);

  // Save to localStorage whenever sections change
  useEffect(() => {
    if (user?.email && sections.length > 0) {
      localStorage.setItem(`savedSections_${user.email}`, JSON.stringify(sections));
    }
  }, [sections, user?.email]);

  // Clear cache when user logs out
  useEffect(() => {
    if (!user) {
      setSections([]);
      setError(null);
      // reset refs when user logs out
      fetchInProgressRef.current = false;
      startedDuringAuthLoadRef.current = false;
      fetchedForUserRef.current = null;
    }
  }, [user]);

  // Fetch sections only if we don't have cached data and user is logged in
  useEffect(() => {
    if (!user) return;

    // Only fetch if we're in a portfolio route (where sections are needed)
    const isPortfolioRoute = window.location.pathname.includes('/portfolios/');
    if (!isPortfolioRoute) return;

    // If a fetch is already in progress, don't start another
    if (fetchInProgressRef.current) return;

    // If auth is loading, only allow one fetch to start during that phase
    if (authIsLoading && startedDuringAuthLoadRef.current) return;

    const hasCachedSections = sections.length > 0;
    const pageRefresh = isPageRefresh();

    const alreadyFetchedForUser = fetchedForUserRef.current === user.email;

    // Only fetch if we don't have cached data OR this is a page refresh, and we haven't already fetched for this user
    const shouldFetch = (!hasCachedSections || pageRefresh) && !alreadyFetchedForUser;
    if (!shouldFetch) return;

    fetchInProgressRef.current = true;
    if (authIsLoading) startedDuringAuthLoadRef.current = true;
    // If this was triggered by a page refresh, mark as fetched for this user optimistically
    // to avoid repeated attempts while refresh detection is still active.
    if (pageRefresh) {
      try {
        fetchedForUserRef.current = user.email;
      } catch (err) {
        console.warn('Failed to set fetchedForUserRef during refresh:', err);
      }
    }

    const fetchSections = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getSavedSections();
        const fetchedSections = response.data || [];
  setSections(fetchedSections);

        // Save to localStorage
        if (user.email) {
          localStorage.setItem(`savedSections_${user.email}`, JSON.stringify(fetchedSections));
        }

        // mark as fetched for this user so we don't re-fetch after auth completes
        try {
          fetchedForUserRef.current = user.email;
        } catch (err) {
          console.warn('Failed to set fetchedForUserRef for savedSections:', err);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved sections');
      } finally {
        setIsLoading(false);
        fetchInProgressRef.current = false;
      }
    };

    fetchSections();
  }, [user, sections.length, authIsLoading]);

  const addSection = useCallback((section: PublicSavedSectionDto) => {
    setSections(prev => {
      const updated = [...prev, section];
      if (user?.email) {
        localStorage.setItem(`savedSections_${user.email}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [user?.email]);

  const removeSection = useCallback((id: string) => {
    setSections(prev => {
      const updated = prev.filter(section => section.id !== id);
      if (user?.email) {
        localStorage.setItem(`savedSections_${user.email}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [user?.email]);

  return {
    sections,
    isLoading,
    error,
    addSection,
    removeSection,
  };
}