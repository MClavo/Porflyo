import { useState, useEffect, useCallback } from 'react';
import type { PublicUserDto } from '../types';
import { checkAuth } from '../clients/auth.api';
import { getUser } from '../clients/user.api';
import { ApiClientError } from '../clients/base.client';
import { isPageRefresh } from '../../lib/pageRefresh';

interface AuthUserResult {
  user: PublicUserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setAuthenticatedUser: (user: PublicUserDto) => void;
  logout: () => void;
}

/**
 * Hook to get the current authenticated user
 * 
 * Flow:
 * 1. First performs a lightweight auth status check against /auth
 * 2. If authenticated, fetches full user data with getUser
 * 3. Forces refresh when page is refreshed (F5) to get fresh data
 * 
 * Returns:
 * - user: PublicUserDto if authenticated, null if not
 * - isLoading: true while checking auth status
 * - isAuthenticated: boolean indicating auth status
 * - error: any error that occurred
 * - refetch: function to manually refetch auth status
 */
export function useAuth(): AuthUserResult {
  const [user, setUser] = useState<PublicUserDto | null>(() => {
    // Try to load user from localStorage on initial load
    try {
      const savedUser = localStorage.getItem('auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if we have a saved user
    try {
      const savedUser = localStorage.getItem('auth_user');
      return !!savedUser;
    } catch {
      return false;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const fetchAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Check auth status with lightweight endpoint
      const isAuthValid = await checkAuth();
      
      if (isAuthValid) {
        // Step 2: If authenticated, fetch full user data
        try {
          const userData = await getUser();
          setUser(userData);
          setIsAuthenticated(true);
          // Save to localStorage
          localStorage.setItem('auth_user', JSON.stringify(userData));
        } catch (userError) {
          // If user fetch fails but auth check passed, treat as unauthenticated
          console.error('Failed to fetch user data:', userError);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('auth_user');
          if (userError instanceof ApiClientError && (userError.status === 401 || userError.status === 403)) {
            setError('Session expired');
          } else {
            setError(userError instanceof Error ? userError.message : 'Failed to fetch user data');
          }
        }
      } else {
        // Not authenticated
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_user');
      }
    } catch (authError) {
      // Auth check failed
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_user');
      
      if (authError instanceof ApiClientError && (authError.status === 401 || authError.status === 403)) {
        // These are expected for unauthenticated users, don't show as error
        setError(null);
      } else {
        setError(authError instanceof Error ? authError.message : 'Authentication check failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only check authentication status when there's a specific reason to do so
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('access_token');
    const oauthReturn = sessionStorage.getItem('oauth_return');
    const hasCachedUser = localStorage.getItem('auth_user');
    
    // Check current route - only load auth on specific routes during refresh
    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath === '/home';
    const isPortfolioRoute = currentPath.startsWith('/portfolios/');
    const isProfileRoute = currentPath === '/profile' || currentPath.startsWith('/profile/');
    const isRootPage = currentPath === '/';
    
    // Check if this is a page refresh - forces fresh data
    const pageRefresh = isPageRefresh();
    
    // Only fetch auth status if:
    // 1. We just returned from OAuth (has OAuth params or oauth_return flag)
    // 2. We're on a protected route that requires auth verification AND we don't have cached user
    // 3. We're NOT on the root page (landing page should not trigger auth checks)
    // 4. This is a page refresh AND we're on an allowed route (home, portfolios, profile)
    const isAllowedRouteForRefresh = isHome || isPortfolioRoute || isProfileRoute;
    const shouldFetchAuth = (hasOAuthParams || oauthReturn === 'true') || 
                          (!isRootPage && !hasCachedUser) ||
                          (pageRefresh && isAllowedRouteForRefresh);
    
    if (shouldFetchAuth) {
      fetchAuthStatus();
    } else {
      // We either have cached data or we're on the landing page - don't make API calls
      setIsLoading(false);
    }
  }, [fetchAuthStatus]);

  const setAuthenticatedUser = useCallback((userData: PublicUserDto) => {
    setUser(userData);
    setIsAuthenticated(true);
    setError(null);
    setIsLoading(false);
    // Save to localStorage
    localStorage.setItem('auth_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    setIsLoading(false);
    // Clear localStorage
    localStorage.removeItem('auth_user');
    sessionStorage.clear();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch: fetchAuthStatus,
    setAuthenticatedUser,
    logout,
  };
}

/**
 * Hook to handle user logout
 * Clears user session and redirects to logout page
 */
export function useLogout() {
  const logout = useCallback(() => {
    // Clear session storage or cookies if needed
    sessionStorage.clear();
    localStorage.clear();

    // Redirect to logout page
    window.location.href = '/logout';
  }, []);

  return { logout };
}