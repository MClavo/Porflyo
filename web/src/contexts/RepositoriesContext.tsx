import React from 'react';
import { useRepositoriesManager } from '../hooks/ui/useRepositoriesManager';
import { 
  RepositoriesContext
} from './RepositoriesContextDefinition';
import type { 
  RepositoriesContextType
} from './RepositoriesContextDefinition';

// Provider
interface RepositoriesProviderProps {
  children: React.ReactNode;
}

export function RepositoriesProvider({ children }: RepositoriesProviderProps) {
  const repositoriesData = useRepositoriesManager();

  const contextValue: RepositoriesContextType = {
    ...repositoriesData
  };

  return (
    <RepositoriesContext.Provider value={contextValue}>
      {children}
    </RepositoriesContext.Provider>
  );
}