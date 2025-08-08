import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { getUser, getRepos } from '../services/api';

export interface User {
  name: string;
  email: string;
  profileImage: string;
  profileImageKey: string;
  providerUserName: string;
  providerAvatarUrl: string;
  socials: Record<string, string>;
}

export interface Repository {
  id: string;
  name: string;
  description?: string;
  htmlUrl?: string;
  html_url?: string; // Fallback for compatibility
  language?: string;
  stargazersCount?: number;
  stargazers_count?: number; // Fallback for compatibility
  forksCount?: number;
  forks_count?: number; // Fallback for compatibility
}

interface UserContextType {
  user: User | null;
  repos: Repository[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasCheckedAuth: boolean;
  checkAuthStatus: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  updateUser: (userData: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const checkAuthStatus = async () => {
    // Prevent multiple simultaneous auth checks
    if (loading || hasCheckedAuth) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userData = await getUser();
      // Ensure socials is always an object
      if (!userData.socials) {
        userData.socials = {};
      }
      setUser(userData);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear any previous state
      setUser(null);
      setIsAuthenticated(false);
      setRepos([]);
      
      // Only set error if it's not a 401/unauthorized error
      if (error instanceof Error && 
          !error.message.toLowerCase().includes('unauthorized') && 
          !error.message.includes('401')) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setHasCheckedAuth(true);
    }
  };

  const fetchUserData = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get user data (might be cached from auth check)
      if (!user) {
        const userData = await getUser();
        // Ensure socials is always an object
        if (!userData.socials) {
          userData.socials = {};
        }
        setUser(userData);
      }
      
      // Get repositories
      const repoData = await getRepos();
      setRepos(repoData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // If we get auth errors, reset auth state
      if (error instanceof Error && 
          (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401'))) {
        setUser(null);
        setRepos([]);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: User) => {
    // Ensure socials is always an object
    if (!userData.socials) {
      userData.socials = {};
    }
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setRepos([]);
    setError(null);
    setIsAuthenticated(false);
    setHasCheckedAuth(false);
  };

  const value = {
    user,
    repos,
    loading,
    error,
    isAuthenticated,
    hasCheckedAuth,
    checkAuthStatus,
    fetchUserData,
    updateUser,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
