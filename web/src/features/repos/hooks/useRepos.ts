import { useQuery } from '@tanstack/react-query';
import { getRepos } from '../api/repos.api';

/**
 * TanStack Query hooks for repositories API
 */

// Query keys
export const reposKeys = {
  all: ['repos'] as const,
  list: () => [...reposKeys.all, 'list'] as const,
};

/**
 * Get repositories query
 */
export function useGetRepos() {
  return useQuery({
    queryKey: reposKeys.list(),
    queryFn: getRepos,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
