// API client for GitHub repositories

import { apiGet } from '../../lib/http/apiClient';
import type { GithubRepo } from '../../types/repoDto';

/**
 * Get user's GitHub repositories
 */
export function getUserRepos(): Promise<GithubRepo[]> {
  return apiGet<GithubRepo[]>('/repos');
}
