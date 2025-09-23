// DEPRECATED: Use ProviderRepo from dto.ts instead
// Types for GitHub repositories from the backend API

export interface GithubRepo {
  id: number;
  name: string;
  description?: string | null;
  html_url: string;
  homepage?: string | null;
  languages_url: string;
  stargazers_count?: number | null;
  forks_count?: number | null;
  topics?: string[];
}