import { apiGet } from './base.client';
import type { ProviderRepo } from '../types/dto';

/**
 * API client for repositories
 * Mirrors backend repositories endpoints exactly
 */

/**
 * Get user repositories
 */
export function getRepos(): Promise<ProviderRepo[]> {
  return apiGet<ProviderRepo[]>('/repos');
}