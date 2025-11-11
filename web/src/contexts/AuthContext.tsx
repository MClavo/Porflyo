import type { ReactNode } from 'react';
import { useAuth } from '../api/hooks/useAuth';
import { AuthContext } from './AuthContextDefinition';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provides authentication context to the app
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const authData = useAuth();

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
}