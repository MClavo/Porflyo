/**
 * Repository types for the portfolio project cards
 * These types are based on the ProviderRepo from dto.ts but extended for UI needs
 */

import type { ProviderRepo } from './dto';

/**
 * Extended repository interface with additional fields for display
 */
export interface Repository extends ProviderRepo {
  // Additional fields that might come from the API
  stargazers_count?: number | null;
  forks_count?: number | null;
  topics?: string[];
  homepage?: string | null;
  languages?: string[];
}

/**
 * Repository with UI-specific fields for project cards
 */
export interface RepositoryForCard {
  name: string;
  description: string;
  html_url: string;
  homepage?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  topics: string[];
  languages: string[];
}

/**
 * Mapper function to convert API repository to card-ready repository
 */
export function mapRepositoryForCard(repo: Repository): RepositoryForCard {
  return {
    name: repo.name,
    description: repo.description || '',
    html_url: repo.html_url,
    homepage: repo.homepage || undefined,
    stargazers_count: repo.stargazers_count || undefined,
    forks_count: repo.forks_count || undefined,
    topics: repo.topics || [],
    languages: repo.languages || []
  };
}