import { createContext } from 'react';
import type { PublicUserDto } from '../api/types';

export interface AuthContextType {
  user: PublicUserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setAuthenticatedUser: (user: PublicUserDto) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);