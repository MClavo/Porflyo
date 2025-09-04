import { apiGet } from '../../../lib/http/apiClient';
import type { ProviderRepo } from '../../../types/dto';

/**
 * Repositories API client
 * Mirrors backend repositories endpoints exactly
 */

/**
 * Get user repositories
 */
export function getRepos(): Promise<ProviderRepo[]> {
  return apiGet<ProviderRepo[]>('/repos');
}
