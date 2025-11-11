/**
 * Projects page data hook
 * Provides ranking data and comparison capabilities for projects
 */

import { useMemo } from 'react';
import { useProjectsAggregated, type ProjectAggregated } from './useProjectsAggregated';

export type SortBy = 'avgViewTime' | 'codeCtr' | 'liveCtr';

export interface ProjectsData {
  // Rankings by different metrics
  avgViewTimeRanking: ProjectAggregated[];
  codeCtrRanking: ProjectAggregated[];
  liveCtrRanking: ProjectAggregated[];
  
  // All projects for selectors
  allProjects: ProjectAggregated[];
  
  // Comparison data - daily series for selected projects
  getComparisonData: (projectAId: number, projectBId: number) => {
    projectA: { date: string; value: number | null }[];
    projectB: { date: string; value: number | null }[];
  };
  
  // Helper functions
  formatValue: (value: number | null, type: SortBy) => string;
  getProjectName: (projectId: number) => string;
  
  isLoading: boolean;
  error: string | null;
}

export function useProjectsData(rangeDays: number = 30, sortBy: SortBy = 'avgViewTime'): ProjectsData {
  const aggregatedData = useProjectsAggregated(rangeDays);
  
  return useMemo(() => {
    const { byViewTime, dailySeries, isLoading, error } = aggregatedData;
    
    // Create rankings
    const avgViewTimeRanking = [...byViewTime]; // Already sorted by viewTime
    
    const codeCtrRanking = [...byViewTime].sort((a, b) => {
      const aCtr = a.codeCtr || 0;
      const bCtr = b.codeCtr || 0;
      return bCtr - aCtr;
    });
    
    const liveCtrRanking = [...byViewTime].sort((a, b) => {
      const aCtr = a.liveCtr || 0;
      const bCtr = b.liveCtr || 0;
      return bCtr - aCtr;
    });
    
    // All projects for comparison selectors
    const allProjects = byViewTime;
    
    // Comparison data generator
    const getComparisonData = (projectAId: number, projectBId: number) => {
      const dates = Object.keys(dailySeries).sort();
      
      const projectA = dates.map(date => {
        const dayProjects = dailySeries[date] || [];
        const project = dayProjects.find(p => p.projectId === projectAId);
        let value: number | null = null;
        
        if (project) {
          switch (sortBy) {
            case 'avgViewTime':
              value = project.avgViewTimeMs;
              break;
            case 'codeCtr':
              value = project.codeCtr;
              break;
            case 'liveCtr':
              value = project.liveCtr;
              break;
          }
        }
        
        return { date, value };
      });
      
      const projectB = dates.map(date => {
        const dayProjects = dailySeries[date] || [];
        const project = dayProjects.find(p => p.projectId === projectBId);
        let value: number | null = null;
        
        if (project) {
          switch (sortBy) {
            case 'avgViewTime':
              value = project.avgViewTimeMs;
              break;
            case 'codeCtr':
              value = project.codeCtr;
              break;
            case 'liveCtr':
              value = project.liveCtr;
              break;
          }
        }
        
        return { date, value };
      });
      
      return { projectA, projectB };
    };
    
    // Format values with proper units and handle divide-by-zero
    const formatValue = (value: number | null, type: SortBy): string => {
      if (value === null || value === undefined) return '—';
      
      switch (type) {
        case 'avgViewTime':
          return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`;
        case 'codeCtr':
        case 'liveCtr':
          return `${(value * 100).toFixed(1)}%`;
        default:
          return '—';
      }
    };
    
    // Project name helper (for now just use ID, can be enhanced later)
    const getProjectName = (projectId: number): string => {
      return `Project ${projectId}`;
    };
    
    return {
      avgViewTimeRanking,
      codeCtrRanking,
      liveCtrRanking,
      allProjects,
      getComparisonData,
      formatValue,
      getProjectName,
      isLoading,
      error
    };
  }, [aggregatedData, sortBy]);
}