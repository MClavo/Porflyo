/**
 * Trends data hook
 * Provides trend analysis data for various metrics over time
 */

import { useMemo } from 'react';
import { useMetricsStore } from '../../state/metrics.store';
import { sliceByLastNDays } from '../../lib/dates';

export type TrendMetric = 'visits' | 'engagement' | 'tffi';

export interface TrendSeries {
  date: string;
  value: number;
  label: string;
}

export interface TrendsData {
  // Calendar values for heatmap display
  calendarValues: Array<{
    day: string;
    value: number;
  }>;
  
  // 2-3 series for line/area charts
  primarySeries: TrendSeries[]; // Main metric trend
  secondarySeries: TrendSeries[]; // Related metric for comparison
  tertiarySeries?: TrendSeries[]; // Optional third metric
  
  // Summary stats
  summary: {
    current: number | null;
    previous: number | null;
    changePct: number | null;
    trend: 'up' | 'down' | 'stable' | null;
  };
  
  isLoading: boolean;
  error: string | null;
}

export function useTrends(
  rangeDays: number = 30, 
  metric: TrendMetric = 'visits'
): TrendsData {
  const { dailyByDate, dailyIndex, isLoading, error } = useMetricsStore();
  
  return useMemo(() => {
    if (!dailyByDate || dailyIndex.length === 0) {
      return {
        calendarValues: [],
        primarySeries: [],
        secondarySeries: [],
        summary: {
          current: null,
          previous: null,
          changePct: null,
          trend: null
        },
        isLoading,
        error: error || null
      };
    }
    
    // Get recent dates
    const recentDates = sliceByLastNDays(dailyIndex, rangeDays).reverse(); // chronological order
    const recentEntries = recentDates.map(date => dailyByDate[date]).filter(Boolean);
    
    if (recentEntries.length === 0) {
      return {
        calendarValues: [],
        primarySeries: [],
        secondarySeries: [],
        summary: {
          current: null,
          previous: null,
          changePct: null,
          trend: null
        },
        isLoading,
        error: error || null
      };
    }
    
    // Build series based on selected metric
    let primarySeries: TrendSeries[] = [];
    let secondarySeries: TrendSeries[] = [];
    let tertiarySeries: TrendSeries[] | undefined;
    
    switch (metric) {
      case 'visits':
        primarySeries = recentEntries.map(entry => ({
          date: entry.date,
          value: entry.raw.views,
          label: 'Total Views'
        }));
        
        secondarySeries = recentEntries.map(entry => ({
          date: entry.date,
          value: entry.raw.qualityVisits,
          label: 'Quality Visits'
        }));
        
        tertiarySeries = recentEntries.map(entry => ({
          date: entry.date,
          value: entry.raw.emailCopies,
          label: 'Email Copies'
        }));
        break;
        
      case 'engagement':
        primarySeries = recentEntries.map(entry => ({
          date: entry.date,
          value: entry.derived?.engagementAvg || 0,
          label: 'Engagement Average'
        }));
        
        secondarySeries = recentEntries.map(entry => ({
          date: entry.date,
          value: entry.derived?.avgScrollTimeMs || 0,
          label: 'Avg Scroll Time (ms)'
        }));
        
        tertiarySeries = recentEntries.map(entry => ({
          date: entry.date,
          value: (entry.derived?.qualityVisitRate || 0) * 100,
          label: 'Quality Visit Rate (%)'
        }));
        break;
        
      case 'tffi':
        primarySeries = recentEntries.map(entry => ({
          date: entry.date,
          value: entry.derived?.tffiMeanMs || 0,
          label: 'TFFI Mean (ms)'
        }));
        
        secondarySeries = recentEntries.map(entry => ({
          date: entry.date,
          value: entry.raw.tffiCount,
          label: 'TFFI Count'
        }));
        break;
    }
    
    // Calendar values (use primary metric)
    const calendarValues = primarySeries.map(point => ({
      day: point.date,
      value: point.value
    }));
    
    // Calculate summary stats
    const currentValue = primarySeries[primarySeries.length - 1]?.value || null;
    const previousValue = primarySeries[primarySeries.length - 2]?.value || null;
    
    let changePct: number | null = null;
    let trend: 'up' | 'down' | 'stable' | null = null;
    
    if (currentValue !== null && previousValue !== null && previousValue !== 0) {
      changePct = ((currentValue - previousValue) / previousValue) * 100;
      
      if (Math.abs(changePct) < 5) {
        trend = 'stable';
      } else if (changePct > 0) {
        trend = 'up';
      } else {
        trend = 'down';
      }
    }
    
    return {
      calendarValues,
      primarySeries,
      secondarySeries,
      tertiarySeries,
      summary: {
        current: currentValue,
        previous: previousValue,
        changePct,
        trend
      },
      isLoading,
      error: error || null
    };
  }, [dailyByDate, dailyIndex, rangeDays, metric, isLoading, error]);
}