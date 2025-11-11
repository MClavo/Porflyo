import { useState, useCallback, useEffect } from 'react';
import type { PublicPortfolioDto } from '../types/dto';
import type { PublicUserDto } from '../types';
import { listPortfolios } from '../clients/portfolios.api';

interface UsePortfoliosStateResult {
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
 * Hook to manage portfolios state with intelligent caching
 * Similar pattern to useAuth - handles all portfolios logic
 */
export function usePortfoliosState(user: PublicUserDto | null): UsePortfoliosStateResult {
  // Initialize from localStorage if available
  const [portfolios, setPortfolios] = useState<PublicPortfolioDto[]>(() => {
    if (!user) return [];
    
    try {
      const cached = localStorage.getItem(`portfolios_${user.email}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage whenever portfolios change
  useEffect(() => {
    if (user && portfolios.length > 0) {
      try {
        localStorage.setItem(`portfolios_${user.email}`, JSON.stringify(portfolios));
      } catch (error) {
        console.warn('Failed to save portfolios to localStorage:', error);
      }
    }
  }, [portfolios, user]);

  // Clear portfolios when user changes/logs out
  useEffect(() => {
    if (!user) {
      setPortfolios([]);
      setError(null);
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
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await listPortfolios();
      setPortfolios(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolios';
      setError(errorMessage);
      console.error('Failed to fetch portfolios:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading]);

  // Auto-fetch logic - exactly like useAuth pattern
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Check if we have cached data (similar to hasCachedUser in useAuth)
    const hasCachedPortfolios = (() => {
      try {
        const cached = localStorage.getItem(`portfolios_${user.email}`);
        return !!cached;
      } catch {
        return false;
      }
    })();

    // Check current route (similar to isRootPage in useAuth)
    const isPublicRoute = window.location.pathname === '/' || window.location.pathname.startsWith('/p/');
    
    // Only fetch portfolios if:
    // 1. We're NOT on a public route AND we don't have cached data
    // This prevents fetching on every route change if we already have data
    const shouldFetch = !isPublicRoute && !hasCachedPortfolios;
    
    if (shouldFetch) {
      fetchPortfolios();
    } else {
      // We either have cached data or we're on a public route - don't make API calls
      setIsLoading(false);
    }
  }, [user, fetchPortfolios]);

  // Actions to update portfolios state
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
      // Clear cache to force refresh
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