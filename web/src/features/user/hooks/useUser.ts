import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUser, patchUser, deleteUser } from '../api/user.api';
import type { PublicUserDto } from '../../../types/dto';

/**
 * TanStack Query hooks for user API
 */

// Query keys
export const userKeys = {
  all: ['user'] as const,
  detail: () => [...userKeys.all, 'detail'] as const,
};

/**
 * Get current user query
 */
export function useGetUser() {
  return useQuery({
    queryKey: userKeys.detail(),
    queryFn: getUser,
  });
}

/**
 * Update user mutation
 */
export function usePatchUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PublicUserDto>) => patchUser(data),
    onSuccess: (updatedUser) => {
      // Update the user cache
      queryClient.setQueryData(userKeys.detail(), updatedUser);
    },
  });
}

/**
 * Delete user mutation
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Clear all user-related cache
      queryClient.removeQueries({ queryKey: userKeys.all });
      // Clear all other cache as user is deleted
      queryClient.clear();
    },
  });
}
