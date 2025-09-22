import React, { useReducer, useCallback, useEffect } from 'react';
import { useRepos } from '../api/hooks/useRepos';
import { 
  RepositoriesContext,
  initialRepositoriesState
} from './RepositoriesContextDefinition';
import type { 
  RepositoriesState, 
  RepositoriesContextType, 
  RepositoriesAction 
} from './RepositoriesContextDefinition';

// Reducer
function repositoriesReducer(state: RepositoriesState, action: RepositoriesAction): RepositoriesState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        repositories: action.payload,
        isLoading: false,
        error: null,
        isLoaded: true,
      };
    case 'LOAD_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Provider
interface RepositoriesProviderProps {
  children: React.ReactNode;
}

export function RepositoriesProvider({ children }: RepositoriesProviderProps) {
  const [state, dispatch] = useReducer(repositoriesReducer, initialRepositoriesState);
  const { repos, loading, error, refetch } = useRepos();

  const loadRepositories = useCallback(async () => {
    if (state.isLoaded && !error) {
      // Already loaded successfully, no need to reload
      return;
    }
    
    try {
      dispatch({ type: 'LOAD_START' });
      await refetch();
    } catch (err) {
      dispatch({ 
        type: 'LOAD_ERROR', 
        payload: err instanceof Error ? err.message : 'Failed to load repositories' 
      });
    }
  }, [state.isLoaded, error, refetch]);

  // Sync useRepos hook state with context state
  useEffect(() => {
    if (loading) {
      dispatch({ type: 'LOAD_START' });
    } else if (error) {
      dispatch({ type: 'LOAD_ERROR', payload: error });
    } else if (repos) {
      dispatch({ type: 'LOAD_SUCCESS', payload: repos });
    }
  }, [repos, loading, error]);

  const contextValue: RepositoriesContextType = {
    ...state,
    loadRepositories,
    refetch,
  };

  return (
    <RepositoriesContext.Provider value={contextValue}>
      {children}
    </RepositoriesContext.Provider>
  );
}