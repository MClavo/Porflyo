import { useContext } from 'react';
import { RepositoriesContext } from '../contexts/RepositoriesContextDefinition';
import type { RepositoriesContextType } from '../contexts/RepositoriesContextDefinition';

export function useRepositoriesContext(): RepositoriesContextType {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error('useRepositoriesContext must be used within a RepositoriesProvider');
  }
  return context;
}