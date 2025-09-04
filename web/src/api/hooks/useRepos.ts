// Hook for managing GitHub repositories

import { useState, useEffect } from 'react';
import { getUserRepos } from '../clients/repos.api';
import type { GithubRepo } from '../../types/repoDto';

export function useRepos() {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getUserRepos();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      console.error('Error fetching repos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return {
    repos,
    loading,
    error,
    refetch: fetchRepos
  };
}
