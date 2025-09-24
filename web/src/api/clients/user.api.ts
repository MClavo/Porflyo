import { apiGet, apiPatch, apiDelete } from './base.client';
import type { PublicUserDto, PartialUserDto } from '../types/dto';

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
export function patchUser(data: PartialUserDto): Promise<PublicUserDto> {
  return apiPatch<PublicUserDto>('/user', data);
}

/**
 * Delete current user account
 */
export function deleteUser(): Promise<void> {
  return apiDelete<void>('/user');
}