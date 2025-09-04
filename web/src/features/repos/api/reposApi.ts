import { apiGet } from '../../../lib/http/apiClient';
import { publicGet } from '../../../lib/http/publicClient';

/**
 * GitHub repositories API endpoints
 */

export interface Repository {
  id: number;
  name: string;
  fullName: string;
  description?: string;
  htmlUrl: string;
  language?: string;
  stargazersCount: number;
  forksCount: number;
  updatedAt: string;
  topics: string[];
  isPrivate: boolean;
}

export interface RepositoriesResponse {
  repositories: Repository[];
  totalCount: number;
}

/**
 * Get current user's repositories
 */
export function getUserRepositories(): Promise<RepositoriesResponse> {
  return apiGet<RepositoriesResponse>('/repos/user');
}

/**
 * Get public repositories for a user
 */
export function getPublicRepositories(username: string): Promise<RepositoriesResponse> {
  return publicGet<RepositoriesResponse>(`/repos/${username}`);
}

/**
 * Sync repositories from GitHub
 */
export function syncRepositories(): Promise<{ synced: number; message: string }> {
  return apiGet<{ synced: number; message: string }>('/repos/sync');
}
