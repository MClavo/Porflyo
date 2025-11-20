/**
 * DashboardContext - Estado compartido del dashboard o
 */

import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TimeRangeOption } from '../lib/timeRange';
import type { PageOption } from '../components/dashboard/layout/DashboardNavbar';
import type { ProviderRepo } from '../api/types/dto';
import { getRepos } from '../api/clients/repos.api';

interface DashboardContextType {
  currentPage: PageOption;
  timeRange: TimeRangeOption;
  portfolioId: string;
  repositories: Map<number, ProviderRepo>;
  repositoriesLoading: boolean;
  setCurrentPage: (page: PageOption) => void;
  setTimeRange: (range: TimeRangeOption) => void;
  setPortfolioId: (id: string) => void;
  getProjectName: (projectId: number) => string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  portfolioId: string;
}

export function DashboardProvider({ children, portfolioId: initialPortfolioId }: DashboardProviderProps) {
  const [currentPage, setCurrentPage] = useState<PageOption>('overview');
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('1month');
  const [portfolioId, setPortfolioId] = useState<string>(initialPortfolioId);
  const [repositories, setRepositories] = useState<Map<number, ProviderRepo>>(new Map());
  const [repositoriesLoading, setRepositoriesLoading] = useState(true);

  // Load repositories on mount
  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setRepositoriesLoading(true);
        const repos = await getRepos();
        const repoMap = new Map<number, ProviderRepo>();
        repos.forEach(repo => {
          if (repo.id !== undefined) {
            repoMap.set(repo.id, repo);
          }
        });
        setRepositories(repoMap);
      } catch (error) {
        console.error('Failed to load repositories:', error);
      } finally {
        setRepositoriesLoading(false);
      }
    };

    loadRepositories();
  }, []);

  // Helper function to get project name from ID
  const getProjectName = (projectId: number): string => {
    const repo = repositories.get(projectId);
    return repo?.name || 'Old Project';
  };

  return (
    <DashboardContext.Provider
      value={{
        currentPage,
        timeRange,
        portfolioId,
        repositories,
        repositoriesLoading,
        setCurrentPage,
        setTimeRange,
        setPortfolioId,
        getProjectName,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}