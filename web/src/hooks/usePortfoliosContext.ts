import { useContext } from 'react';
import { PortfoliosContext } from '../contexts/PortfoliosContextDefinition';

export function usePortfoliosContext() {
  const context = useContext(PortfoliosContext);
  
  if (!context) {
    throw new Error('usePortfoliosContext must be used within a PortfoliosProvider');
  }
  
  return context;
}