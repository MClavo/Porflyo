import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '../../../services/api';
import type { UserPatchDto, PublicUserDto } from '../../../types/dto';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (updates: UserPatchDto) => updateUser(updates),
    onSuccess: (updatedUser) => {
      // Update the cache directly with the new user data
      queryClient.setQueryData(['auth', 'user'], updatedUser);
      // Also invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });

  // Function to manually update user data in cache
  const updateUserInCache = (userData: Partial<PublicUserDto>) => {
    queryClient.setQueryData(['auth', 'user'], (oldData: PublicUserDto | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        ...userData,
        // Add a timestamp to force image reload
        profileImage: userData.profileImage ? `${userData.profileImage}?t=${Date.now()}` : oldData.profileImage
      };
    });
  };

  return {
    ...mutation,
    updateUserInCache
  };
};
