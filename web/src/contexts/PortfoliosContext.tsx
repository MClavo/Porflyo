import React from 'react';
import { PortfoliosContext } from './PortfoliosContextDefinition';
import { usePortfoliosManager } from '../api/hooks/usePortfoliosManager';
import { useAuthContext } from '../hooks/ui/useAuthContext';

interface PortfoliosProviderProps {
  children: React.ReactNode;
}

/**
 * Provides portfolios context to the app.
 * Uses authentication context to fetch user-specific portfolios.
 */
export function PortfoliosProvider({ children }: PortfoliosProviderProps) {
  const { user, isLoading: authIsLoading } = useAuthContext();
  const portfoliosData = usePortfoliosManager(user, authIsLoading);

  return (
    <PortfoliosContext.Provider value={portfoliosData}>
      {children}
    </PortfoliosContext.Provider>
  );
}