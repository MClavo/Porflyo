import { useState, useEffect, useCallback } from 'react';
import type { PublicUserDto, PartialUserDto } from '../types';
import { getUser, patchUser, deleteUser } from '../clients/user.api';

/**
 * Simple hooks for user API
 */

interface UseUserResult {
  user: PublicUserDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get current authenticated user
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<PublicUserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUser();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}

interface UpdateUserResult {
  mutate: (data: PartialUserDto) => Promise<PublicUserDto>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to update user profile
 */
export function useUpdateUser(): UpdateUserResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: PartialUserDto): Promise<PublicUserDto> => {
    try {
      setLoading(true);
      setError(null);
      const result = await patchUser(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

interface DeleteUserResult {
  mutate: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to delete user account
 */
export function useDeleteUser(): DeleteUserResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteUser();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}