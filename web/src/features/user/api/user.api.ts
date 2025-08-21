import { apiGet, apiPatch, apiDelete } from '../../../lib/http/apiClient';
import type { PublicUserDto } from '../../../types/dto';

/**
 * User API client
 * Mirrors backend user endpoints exactly
 */

/**
 * Get current authenticated user
 */
export function getUser(): Promise<PublicUserDto> {
  return apiGet<PublicUserDto>('/user');
}

/**
 * Update current user profile
 */
export function patchUser(data: Partial<PublicUserDto>): Promise<PublicUserDto> {
  return apiPatch<PublicUserDto>('/user', data);
}

/**
 * Delete current user account
 */
export function deleteUser(): Promise<void> {
  return apiDelete<void>('/user');
}
