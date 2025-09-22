import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContextDefinition';
import type { AuthContextType } from '../contexts/AuthContextDefinition';

/**
 * Hook to use the auth context
 * Must be used within an AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}