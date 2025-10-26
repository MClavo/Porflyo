import type { ReactNode } from 'react';
import { SavedSectionsContext } from './SavedSectionsContextDefinition';
import { useSavedSectionsManager } from '../api/hooks/useSavedSectionsManager';
import { useAuthContext } from '../hooks/ui/useAuthContext';

interface SavedSectionsProviderProps {
  children: ReactNode;
}

/**
 * Provides saved sections context to the app
 * Uses the same caching pattern as AuthContext
 */
export function SavedSectionsProvider({ children }: SavedSectionsProviderProps) {
  const { user, isLoading: authIsLoading } = useAuthContext();
  const contextValue = useSavedSectionsManager(user, authIsLoading);

  return (
    <SavedSectionsContext.Provider value={contextValue}>
      {children}
    </SavedSectionsContext.Provider>
  );
}