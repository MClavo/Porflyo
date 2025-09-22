import { useContext } from 'react';
import { SavedSectionsContext } from '../contexts/SavedSectionsContextDefinition';
import type { SavedSectionsContextType } from '../contexts/SavedSectionsContextDefinition';

/**
 * Hook to use SavedSectionsContext
 * Throws an error if used outside of SavedSectionsProvider
 */
export function useSavedSectionsContext(): SavedSectionsContextType {
  const context = useContext(SavedSectionsContext);
  
  if (context === undefined) {
    throw new Error('useSavedSectionsContext must be used within a SavedSectionsProvider');
  }
  
  return context;
}