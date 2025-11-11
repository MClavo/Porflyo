import { useState, useEffect, useCallback } from 'react';
import type { Repository } from '../types/repository.types';
import { getRepos } from '../clients/repos.api';

/**
 * Simple hook for repositories API
 */

interface UseReposResult {
  repos: Repository[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get user repositories
 */
export function useRepos(): UseReposResult {
  const [repos, setRepos] = useState<Repository[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRepos();
      // Convert ProviderRepo to Repository (they're compatible for now)
      setRepos(data as Repository[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return {
    repos,
    loading,
    error,
    refetch: fetchRepos,
  };
}