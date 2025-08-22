import { useQuery } from '@tanstack/react-query';
import { getUser } from '../../user/api/user.api';
import { checkAuth } from '../api/auth.api';
import type { PublicUserDto } from '../../../types/dto';

interface AuthUserResult {
  user: PublicUserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: unknown;
}

/**
 * Hook to get the current authenticated user
 * Uses TanStack Query to manage auth state
 * 
 * Returns:
 * - user: PublicUserDto if authenticated, null if not
 * - isLoading: true while checking auth status
 * - isAuthenticated: boolean indicating auth status
 * - error: any error that occurred
 */
export function useAuthUser(): AuthUserResult {
  // First perform a lightweight auth status check against /auth
  const statusQuery = useQuery({
    queryKey: ['auth', 'status'],
    queryFn: checkAuth,
    // Don't retry on 401/403 since it's a valid unauthenticated state
    retry: (failureCount, error: unknown) => {
      if (typeof error === 'object' && error && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status === 401 || status === 403) return false;
      }
      return failureCount < 2;
    },
    staleTime: 60 * 1000, // 1 minute for cheap auth checks
  });

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    isError: userIsError
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getUser,
    enabled: statusQuery.isSuccess === true, // only fetch user when /auth returned 200
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401/403 - user is simply not authenticated
      if (typeof error === 'object' && error && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      // Retry other errors (network issues, etc.)
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Determine authentication status
  // Compose overall state: loading if status is loading or (status ok and user loading)
  const isLoading = statusQuery.isLoading || (statusQuery.isSuccess && userLoading);

  // Authenticated if status check succeeded and we have a non-null user
  const isAuthenticated = statusQuery.isSuccess === true && !userIsError && user != null;

  // Prefer exposing user-level error if fetching user failed, otherwise status error
  const error = userIsError ? userError : (statusQuery.isError ? statusQuery.error : null);

  return {
    user: isAuthenticated ? user : null,
    isLoading,
    isAuthenticated,
    error,
  };
}

/**
 * Hook to handle user logout
 * Clears user session and redirects to logout page
 */
export function useLogout() {
  const logout = () => {
    // Clear session storage or cookies if needed
    sessionStorage.clear();
    localStorage.clear();

    // Redirect to logout page
    window.location.href = '/logout';
  };

  return { logout };
}
