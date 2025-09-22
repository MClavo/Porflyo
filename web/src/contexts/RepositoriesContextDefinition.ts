import { createContext } from 'react';
import type { Repository } from '../api/types/repository.types';

// Context Definition
export interface RepositoriesState {
  repositories: Repository[];
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;
}

export interface RepositoriesContextType extends RepositoriesState {
  loadRepositories: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const initialRepositoriesState: RepositoriesState = {
  repositories: [],
  isLoading: false,
  error: null,
  isLoaded: false,
};

// Actions
export type RepositoriesAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Repository[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Context
export const RepositoriesContext = createContext<RepositoriesContextType | null>(null);