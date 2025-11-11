import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { Repository } from '../../api/types/repository.types';
import { getRepos } from '../../api/clients/repos.api';

export function useRepositoriesManager() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const hasLoadedForCurrentPortfolioVisit = useRef(false);

  const loadRepositories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getRepos();
      setRepositories(data as Repository[]);
      hasLoadedForCurrentPortfolioVisit.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Only fetch repositories when in /portfolios/ routes - once per route entry
  useEffect(() => {
    const isPortfolioRoute = location.pathname.startsWith('/portfolios/');
    
    if (!isPortfolioRoute) {
      // Clear repositories and reset flag when leaving portfolio routes
      setRepositories([]);
      setError(null);
      hasLoadedForCurrentPortfolioVisit.current = false;
      return;
    }
    
    // Only load if we haven't loaded for this portfolio visit and not currently loading
    if (!hasLoadedForCurrentPortfolioVisit.current && !isLoading) {
      loadRepositories();
    }
  }, [location.pathname, isLoading, loadRepositories]);

  const refetch = async () => {
    hasLoadedForCurrentPortfolioVisit.current = false;
    await loadRepositories();
  };

  return {
    repositories,
    isLoading,
    error,
    isLoaded: repositories.length > 0,
    loadRepositories,
    refetch,
  };
}