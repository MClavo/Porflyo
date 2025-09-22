import type { ReactNode } from 'react';
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { SavedSectionsContext } from './SavedSectionsContextDefinition';
import type { PublicSavedSectionDto } from '../api/types';
import { getSavedSections } from '../api/clients/savedSections.api';
import { useAuthContext } from '../hooks/useAuthContext';

interface SavedSectionsProviderProps {
  children: ReactNode;
}

/**
 * SavedSectionsProvider component that provides saved sections context to the app
 * Maintains global state for saved sections and handles loading them once
 */
export function SavedSectionsProvider({ children }: SavedSectionsProviderProps) {
  const [sections, setSections] = useState<PublicSavedSectionDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthContext();
  
  // Use refs to avoid dependencies in useCallback
  const isLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const loadSections = useCallback(async () => {
    if (!user || isLoadedRef.current || isLoadingRef.current) return; // Don't load if no user or already loaded/loading
    
    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);
      const response = await getSavedSections();
      setSections(response.data || []);
      isLoadedRef.current = true;
      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved sections');
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [user]); // Add user as dependency

  const addSection = useCallback((section: PublicSavedSectionDto) => {
    setSections(prev => [...prev, section]);
  }, []);

  const removeSection = useCallback((id: string) => {
    setSections(prev => prev.filter(section => section.id !== id));
  }, []);

  // Clear sections when user logs out
  useEffect(() => {
    if (!user) {
      setSections([]);
      setIsLoaded(false);
      setError(null);
      isLoadedRef.current = false;
      isLoadingRef.current = false;
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    sections,
    isLoading,
    isLoaded,
    error,
    addSection,
    removeSection,
    loadSections,
  }), [sections, isLoading, isLoaded, error, addSection, removeSection, loadSections]);

  return (
    <SavedSectionsContext.Provider value={contextValue}>
      {children}
    </SavedSectionsContext.Provider>
  );
}