import { useMutation, useQueryClient } from '@tanstack/react-query';
import { presignMedia, deleteMedia } from '../api/media.api';
import type { PresignRequestDto } from '../../../types/dto';

/**
 * TanStack Query hooks for media API
 */

/**
 * Presign media upload mutation
 */
export function usePresignMedia() {
  return useMutation({
    mutationFn: (req: PresignRequestDto) => presignMedia(req),
  });
}

/**
 * Delete media mutation
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteMedia(key),
    onSuccess: () => {
      // Invalidate portfolios to refresh media lists
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}
