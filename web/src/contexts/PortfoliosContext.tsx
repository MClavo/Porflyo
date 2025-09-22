import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { PortfoliosContext } from './PortfoliosContextDefinition';
import type { PortfoliosContextValue } from './PortfoliosContextDefinition';
import type { PublicPortfolioDto } from '../api/types/dto';
import { listPortfolios } from '../api/clients/portfolios.api';
import { useAuthContext } from '../hooks/useAuthContext';

interface PortfoliosProviderProps {
  children: React.ReactNode;
}

export function PortfoliosProvider({ children }: PortfoliosProviderProps) {
  const [portfolios, setPortfolios] = useState<PublicPortfolioDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthContext();
  
  // Use refs to avoid dependencies
  const isLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Fetch portfolios from API - only expose this for manual refresh
  const refreshPortfolios = useCallback(async () => {
    if (!user) {
      setPortfolios([]);
      isLoadedRef.current = false;
      return;
    }

    try {
      setIsLoading(true);
      isLoadingRef.current = true;
      setError(null);
      const data = await listPortfolios();
      setPortfolios(data);
      isLoadedRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolios';
      setError(errorMessage);
      console.error('Failed to fetch portfolios:', err);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [user]);

  // Load portfolios when user logs in, but only once
  useEffect(() => {
    const loadPortfolios = async () => {
      if (!user) {
        setPortfolios([]);
        setError(null);
        isLoadedRef.current = false;
        return;
      }

      if (isLoadedRef.current || isLoadingRef.current) {
        return; // Don't load if already loaded or loading
      }

      try {
        setIsLoading(true);
        isLoadingRef.current = true;
        setError(null);
        const data = await listPortfolios();
        setPortfolios(data);
        isLoadedRef.current = true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolios';
        setError(errorMessage);
        console.error('Failed to fetch portfolios:', err);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadPortfolios();
  }, [user]);

  // Add a new portfolio to the state
  const addPortfolio = useCallback((portfolio: PublicPortfolioDto) => {
    setPortfolios(prev => [portfolio, ...prev]);
  }, []);

  // Update an existing portfolio in the state
  const updatePortfolio = useCallback((updatedPortfolio: PublicPortfolioDto) => {
    setPortfolios(prev => 
      prev.map(portfolio => 
        portfolio.id === updatedPortfolio.id ? updatedPortfolio : portfolio
      )
    );
  }, []);

  // Remove a portfolio from the state
  const removePortfolio = useCallback((portfolioId: string) => {
    setPortfolios(prev => prev.filter(portfolio => portfolio.id !== portfolioId));
  }, []);

  // Clear all portfolios
  const clearPortfolios = useCallback(() => {
    setPortfolios([]);
    setError(null);
  }, []);

  const contextValue: PortfoliosContextValue = useMemo(() => ({
    portfolios,
    isLoading,
    error,
    refreshPortfolios,
    addPortfolio,
    updatePortfolio,
    removePortfolio,
    clearPortfolios,
  }), [portfolios, isLoading, error, refreshPortfolios, addPortfolio, updatePortfolio, removePortfolio, clearPortfolios]);

  return (
    <PortfoliosContext.Provider value={contextValue}>
      {children}
    </PortfoliosContext.Provider>
  );
}