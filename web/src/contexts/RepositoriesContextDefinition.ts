import { createContext } from 'react';
import type { Repository } from '../api/types/repository.types';

// Context Definition
export interface RepositoriesContextType {
  repositories: Repository[];
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;
  loadRepositories: () => Promise<void>;
  refetch: () => Promise<void>;
}

// Context
export const RepositoriesContext = createContext<RepositoriesContextType | null>(null);