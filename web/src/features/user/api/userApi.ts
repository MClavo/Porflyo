import { apiGet, apiPost, apiPut, apiDelete } from '../../../lib/http/apiClient';

/**
 * User API endpoints
 */

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  githubId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): Promise<User> {
  return apiGet<User>('/user/me');
}

/**
 * Get user by username
 */
export function getUserByUsername(username: string): Promise<User> {
  return apiGet<User>(`/user/${username}`);
}

/**
 * Update current user profile
 */
export function updateUser(data: UpdateUserRequest): Promise<User> {
  return apiPut<User>('/user/me', data);
}

/**
 * Delete current user account
 */
export function deleteUser(): Promise<void> {
  return apiDelete<void>('/user/me');
}

/**
 * Upload user avatar
 */
export function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  return apiPost<{ avatarUrl: string }>('/user/avatar', { file });
}
