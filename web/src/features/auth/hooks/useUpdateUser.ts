import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '../../../services/api';
import type { UserPatchDto } from '../../../types/dto';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UserPatchDto) => updateUser(updates),
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
