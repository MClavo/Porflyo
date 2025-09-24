import type { ReactNode } from 'react';
import { useAuth } from '../api/hooks/useAuth';
import { AuthContext } from './AuthContextDefinition';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that provides authentication context to the app
 * This should wrap the entire app to provide global auth state
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const authData = useAuth();

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
}