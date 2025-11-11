/**
 * Daily page data hook
 * Provides daily KPIs and sortable project table data for a specific date
 */

import { useMemo } from 'react';
import { useDaily, type SlotRow } from './useDaily';
import { useMetricsStore } from '../../state/metrics.store';

export type DailySortBy = 'exposures' | 'viewTimeMs' | 'avgViewTimeMs' | 'codeCtr' | 'liveCtr';

export interface DailyPageData {
  // Selected date
  selectedDate: string | null;
  
  // Available dates for picker
  availableDates: string[];
  
  // Daily KPIs
  dailyKpis: {
    date: string;
    totalViews: number;
    avgSessionMs: number | null;
    engagementAvg: number | null;
    deviceMix: {
      desktopPct: number | null;
      mobileTabletPct: number | null;
    } | null;
    qualityVisitRate: number | null;
  } | null;
  
  // Sorted project rows
  projectRows: SlotRow[];
  
  // Helper functions
  formatValue: (value: number | null, type: DailySortBy) => string;
  getProjectName: (projectId: number) => string;
  
  isLoading: boolean;
  error: string | null;
}

export function useDailyPageData(
  selectedDate?: string,
  sortBy: DailySortBy = 'exposures',
  sortDirection: 'asc' | 'desc' = 'desc'
): DailyPageData {
  const { dailyIndex } = useMetricsStore();
  const { dailyKpis, slotRows, isLoading, error } = useDaily(selectedDate);
  
  return useMemo(() => {
    // Available dates from dailyIndex (sorted newest first)
    const availableDates = [...dailyIndex].reverse();
    
    // Selected date (use provided or latest)
    const currentDate = selectedDate || (availableDates[0] || null);
    
    // Sort project rows by selected metric
    const sortedRows = [...slotRows].sort((a, b) => {
      let aValue: number | null = null;
      let bValue: number | null = null;
      
      switch (sortBy) {
        case 'exposures':
          aValue = a.exposures;
          bValue = b.exposures;
          break;
        case 'viewTimeMs':
          aValue = a.viewTimeMs;
          bValue = b.viewTimeMs;
          break;
        case 'avgViewTimeMs':
          aValue = a.avgViewTimeMs;
          bValue = b.avgViewTimeMs;
          break;
        case 'codeCtr':
          aValue = a.codeCtr;
          bValue = b.codeCtr;
          break;
        case 'liveCtr':
          aValue = a.liveCtr;
          bValue = b.liveCtr;
          break;
      }
      
      // Handle null values (push to end)
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      const diff = sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
      return diff;
    });
    
    // Format values with proper units and handle null gracefully
    const formatValue = (value: number | null, type: DailySortBy): string => {
      if (value === null || value === undefined) return '—';
      
      switch (type) {
        case 'exposures':
          return value.toLocaleString();
        case 'viewTimeMs':
          return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`;
        case 'avgViewTimeMs':
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
      selectedDate: currentDate,
      availableDates,
      dailyKpis,
      projectRows: sortedRows,
      formatValue,
      getProjectName,
      isLoading,
      error
    };
  }, [dailyIndex, selectedDate, slotRows, dailyKpis, sortBy, sortDirection, isLoading, error]);
}