import { apiPost, apiDelete } from '../../../lib/http/apiClient';
import type { PresignRequestDto } from '../../../types/dto';

/**
 * Media API client
 * Mirrors backend media endpoints exactly
 */

/**
 * Presign media upload request
 */
export function presignMedia(req: PresignRequestDto): Promise<unknown> {
  return apiPost<unknown>('/media/presign', req);
}

/**
 * Delete media by key
 */
export function deleteMedia(key: string): Promise<void> {
  return apiDelete<void>(`/media/${key}`);
}
