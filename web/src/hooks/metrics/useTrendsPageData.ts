/**
 * Trends page data hook
 * Provides calendar heatmap and time series data for bigger picture analysis
 */

import { useMemo } from 'react';
import { useMetricsStore } from '../../state/metrics.store';
import { sliceByLastNDays } from '../../lib/dates';

export interface TrendsPageData {
  // Calendar heatmap data (visits by default)
  calendarData: Array<{
    date: string;
    value: number;
  }>;
  
  // Series data for 3 panels
  visitsData: Array<{
    date: string;
    desktop: number;
    mobile: number;
    total: number;
  }>;
  
  engagementData: Array<{
    date: string;
    value: number;
  }>;
  
  ttfiData: Array<{
    date: string;
    value: number;
  }>;
  
  // Available months for calendar picker
  availableMonths: Array<{
    label: string;
    value: string; // YYYY-MM format
  }>;
  
  isLoading: boolean;
  error: string | null;
}

export function useTrendsPageData(selectedMonth?: string): TrendsPageData {
  const { dailyByDate, dailyIndex, isLoading, error } = useMetricsStore();
  
  return useMemo(() => {
    if (!dailyByDate || dailyIndex.length === 0) {
      return {
        calendarData: [],
        visitsData: [],
        engagementData: [],
        ttfiData: [],
        availableMonths: [],
        isLoading,
        error: error || null
      };
    }
    
    // Get available months from dailyIndex
    const monthsSet = new Set<string>();
    dailyIndex.forEach(date => {
      const monthKey = date.substring(0, 7); // YYYY-MM
      monthsSet.add(monthKey);
    });
    
    const availableMonths = Array.from(monthsSet)
      .sort()
      .reverse() // newest first
      .map(monthKey => ({
        label: new Date(monthKey + '-01').toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
        value: monthKey
      }));
    
    // Use selected month or current month
    const targetMonth = selectedMonth || (availableMonths[0]?.value || '');
    
    // Filter dates for the selected month
    const monthDates = dailyIndex.filter(date => date.startsWith(targetMonth));
    const monthEntries = monthDates.map(date => dailyByDate[date]).filter(Boolean);
    
    // Get last 90 days for series data (bigger picture)
    const recentDates = sliceByLastNDays(dailyIndex, 90).reverse();
    const recentEntries = recentDates.map(date => dailyByDate[date]).filter(Boolean);
    
    // Calendar data (visits for selected month)
    const calendarData = monthEntries.map(entry => ({
      date: entry.date,
      value: entry.raw.views
    }));
    
    // Visits data with device breakdown
    const visitsData = recentEntries.map(entry => ({
      date: entry.date,
      desktop: entry.raw.desktopViews,
      mobile: entry.raw.mobileTabletViews,
      total: entry.raw.views
    }));
    
    // Engagement data
    const engagementData = recentEntries.map(entry => ({
      date: entry.date,
      value: entry.derived?.engagementAvg || 0
    }));
    
    // TTFI data
    const ttfiData = recentEntries.map(entry => ({
      date: entry.date,
      value: entry.derived?.tffiMeanMs || 0
    }));
    
    return {
      calendarData,
      visitsData,
      engagementData,
      ttfiData,
      availableMonths,
      isLoading,
      error: error || null
    };
  }, [dailyByDate, dailyIndex, selectedMonth, isLoading, error]);
}