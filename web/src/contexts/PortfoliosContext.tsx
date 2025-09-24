import React from 'react';
import { PortfoliosContext } from './PortfoliosContextDefinition';
import { usePortfoliosManager } from '../api/hooks/usePortfoliosManager';
import { useAuthContext } from '../hooks/ui/useAuthContext';

interface PortfoliosProviderProps {
  children: React.ReactNode;
}

/**
 * PortfoliosProvider component that provides portfolios context to the app
 * Exactly like AuthProvider - simple wrapper that uses a hook for all logic
 * This should wrap the entire app to provide global portfolios state
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