import { useQuery } from '@tanstack/react-query';
import { getUser } from '../../user/api/user.api';
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
  const {
    data: user,
    isLoading,
    error,
    isError
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getUser,
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
  const isAuthenticated = !isError && user != null;

  return {
    user: isAuthenticated ? user : null,
    isLoading,
    isAuthenticated,
    error: isError ? error : null,
  };
}
