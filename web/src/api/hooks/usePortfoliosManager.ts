import { useState, useEffect, useCallback, useRef } from 'react';
import type { PublicPortfolioDto } from '../types/dto';
import type { PublicUserDto } from '../types';
import { listPortfolios } from '../clients/portfolios.api';
import { isPageRefresh } from '../../lib/pageRefresh';

interface PortfoliosResult {
  portfolios: PublicPortfolioDto[];
  isLoading: boolean;
  error: string | null;
  refreshPortfolios: () => Promise<void>;
  addPortfolio: (portfolio: PublicPortfolioDto) => void;
  updatePortfolio: (portfolio: PublicPortfolioDto) => void;
  removePortfolio: (portfolioId: string) => void;
  clearPortfolios: () => void;
}

/**
 * Hook to manage portfolios with intelligent caching
 * Exactly like useAuth pattern - handles all portfolios logic
 * 
 * Flow:
 * 1. Initializes state from localStorage on first load
 * 2. Only fetches from API when no cached data exists and not on public routes
 * 3. Forces refresh when page is refreshed (F5) to get fresh data
 * 4. Saves to localStorage on every change
 * 
 * Returns:
 * - portfolios: Array of portfolios
 * - isLoading: true while fetching
 * - error: any error that occurred  
 * - refreshPortfolios: function to manually refetch
 * - add/update/remove/clear: functions to modify state
 */
export function usePortfoliosManager(user: PublicUserDto | null, authIsLoading = false): PortfoliosResult {
  // Initialize portfolios from localStorage (like useAuth initializes user)
  const [portfolios, setPortfolios] = useState<PublicPortfolioDto[]>(() => {
    if (!user) return [];
    
    try {
      const cached = localStorage.getItem(`portfolios_${user.email}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ref to avoid duplicate fetches when auth is still resolving or user changes
  const fetchInProgressRef = useRef(false);
  // If auth is loading, allow at most one fetch to start in that phase
  const startedDuringAuthLoadRef = useRef(false);
  // Remember which user.email we fetched portfolios for to avoid re-fetch after auth settles
  const fetchedForUserRef = useRef<string | null>(null);

  // Save to localStorage whenever portfolios change (like useAuth saves user)
  useEffect(() => {
    if (user && portfolios.length > 0) {
      try {
        localStorage.setItem(`portfolios_${user.email}`, JSON.stringify(portfolios));
      } catch (error) {
        console.warn('Failed to save portfolios to localStorage:', error);
      }
    }
  }, [portfolios, user]);

  // Clear portfolios when user logs out (like useAuth clears user)
  useEffect(() => {
    if (!user) {
      setPortfolios([]);
      setError(null);
      // reset fetch trackers when user logs out
      fetchInProgressRef.current = false;
      startedDuringAuthLoadRef.current = false;
      fetchedForUserRef.current = null;
      // Clear localStorage for all users
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('portfolios_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [user]);

  const fetchPortfolios = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await listPortfolios();
      setPortfolios(data);
      // mark that we've fetched for this user
      try {
        fetchedForUserRef.current = user.email;
      } catch (err) {
        console.warn('Failed to set fetchedForUserRef:', err);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolios';
      setError(errorMessage);
      console.error('Failed to fetch portfolios:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // EXACT same logic as useAuth - only fetch when specific conditions are met
  useEffect(() => {
    // If there's no user, bail out early
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Check current route - only load portfolios on specific routes
    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath === '/home';
    const isPortfolioRoute = currentPath.startsWith('/portfolios/');
    const isProfileRoute = currentPath === '/profile' || currentPath.startsWith('/profile/');
    const isPublicPortfolio = currentPath.startsWith('/p/');
    
    // Only load portfolios on allowed routes
    const isAllowedRoute = isHome || isPortfolioRoute || isProfileRoute;
    
    if (!isAllowedRoute || isPublicPortfolio) {
      setIsLoading(false);
      return;
    }

    // Check if we have cached portfolios (like useAuth checks hasCachedUser)
    const hasCachedPortfolios = (() => {
      try {
        const cached = localStorage.getItem(`portfolios_${user.email}`);
        return !!cached;
      } catch {
        return false;
      }
    })();
    
    // Check if this is a page refresh - forces fresh data
    const pageRefresh = isPageRefresh();
    
  // Fetch portfolios if:
  // 1. We don't have cached data, OR
  // 2. This is a page refresh (to get fresh data)
  // But never if we've already fetched for this user.email
  const alreadyFetchedForUser = fetchedForUserRef.current === user.email;
  const shouldFetch = (!hasCachedPortfolios || pageRefresh) && !alreadyFetchedForUser;
    
    if (shouldFetch) {
      // If a fetch is already in progress, don't start another
      if (fetchInProgressRef.current) return;

      // If auth is loading, only allow one fetch to start during that phase
      if (authIsLoading && startedDuringAuthLoadRef.current) return;

      fetchInProgressRef.current = true;
      if (authIsLoading) startedDuringAuthLoadRef.current = true;

      (async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await listPortfolios();
          setPortfolios(data);
          // mark that we've fetched for this user
          try {
            fetchedForUserRef.current = user.email;
          } catch (err) {
            console.warn('Failed to set fetchedForUserRef:', err);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolios';
          setError(errorMessage);
          console.error('Failed to fetch portfolios:', err);
        } finally {
          setIsLoading(false);
          fetchInProgressRef.current = false;
        }
      })();
    } else {
      setIsLoading(false);
    }
  }, [user, authIsLoading]);

  // Actions to update portfolios state (like useAuth has setAuthenticatedUser, logout)
  const addPortfolio = useCallback((portfolio: PublicPortfolioDto) => {
    setPortfolios(prev => [portfolio, ...prev]);
  }, []);

  const updatePortfolio = useCallback((updatedPortfolio: PublicPortfolioDto) => {
    setPortfolios(prev => 
      prev.map(portfolio => 
        portfolio.id === updatedPortfolio.id ? updatedPortfolio : portfolio
      )
    );
  }, []);

  const removePortfolio = useCallback((portfolioId: string) => {
    setPortfolios(prev => prev.filter(portfolio => portfolio.id !== portfolioId));
  }, []);

  const clearPortfolios = useCallback(() => {
    setPortfolios([]);
    setError(null);
    if (user) {
      try {
        localStorage.removeItem(`portfolios_${user.email}`);
      } catch (error) {
        console.warn('Failed to clear portfolios from localStorage:', error);
      }
    }
  }, [user]);

  const refreshPortfolios = useCallback(async () => {
    if (user) {
      // Clear cache to force refresh (like useAuth refetch)
      try {
        localStorage.removeItem(`portfolios_${user.email}`);
      } catch (error) {
        console.warn('Failed to clear cache:', error);
      }
    }
    await fetchPortfolios();
  }, [fetchPortfolios, user]);

  return {
    portfolios,
    isLoading,
    error,
    refreshPortfolios,
    addPortfolio,
    updatePortfolio,
    removePortfolio,
    clearPortfolios,
  };
}