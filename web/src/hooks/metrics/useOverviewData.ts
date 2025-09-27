/**
 * Overview dashboard data hook
 * Provides KPIs and chart data for the main dashboard view
 */

import { useMemo } from 'react';
import { useMetricsStore } from '../../state/metrics.store';
import { latest, sliceByLastNDays } from '../../lib/dates';

export interface OverviewData {
  // Today's KPIs from latest daily entry
  todayKpis: {
    totalViews: number;
    avgSessionMs: number | null;
    deviceMix: { desktop: number; mobile: number } | null;
    bounceRate: number | null;
  } | null;
  
  // Area chart data for visits by device (last N days)
  visitsByDeviceSeries: Array<{
    date: string;
    desktop: number;
    mobile: number;
  }>;
  
  // Line chart data for engagement metrics (last N days)
  engagementSeries: Array<{
    date: string;
    visits: number;
    avgSessionMs: number | null;
    bounceRate: number | null;
  }>;
  
  // Calendar heatmap data for current month
  calendarData: Array<{
    day: string; // YYYY-MM-DD format
    value: number;
  }>;
  
  isLoading: boolean;
  error: string | null;
}

export function useOverviewData(rangeDays: number = 30): OverviewData {
  const { dailyByDate, dailyIndex, isLoading, error } = useMetricsStore();
  
  return useMemo(() => {
    if (!dailyByDate || dailyIndex.length === 0) {
      return {
        todayKpis: null,
        visitsByDeviceSeries: [],
        engagementSeries: [],
        calendarData: [],
        isLoading,
        error: error || null
      };
    }
    
    // Get latest entry from the index (first item in desc-sorted array)
    const latestDate = latest(dailyIndex);
    const latestEntry = latestDate ? dailyByDate[latestDate] : null;
    
    // Today's KPIs from latest daily entry
    const todayKpis = latestEntry ? {
      totalViews: latestEntry.raw.views,
      avgSessionMs: latestEntry.derived?.avgCardViewTimeMs || null,
      deviceMix: latestEntry.derived?.deviceMix ? {
        desktop: latestEntry.derived.deviceMix.desktopPct || 0,
        mobile: latestEntry.derived.deviceMix.mobileTabletPct || 0
      } : null,
      bounceRate: latestEntry.derived?.qualityVisitRate || null
    } : null;
    
    // Get last N days of data from the index
    const recentDates = sliceByLastNDays(dailyIndex, rangeDays).reverse(); // reverse to get chronological order
    const recentEntries = recentDates.map(date => dailyByDate[date]).filter(Boolean);
    
    // Area series for visits by device
    const visitsByDeviceSeries = recentEntries.map(entry => ({
      date: entry.date,
      desktop: entry.raw.desktopViews || 0,
      mobile: entry.raw.mobileTabletViews || 0
    }));
    
    // Line series for engagement metrics
    const engagementSeries = recentEntries.map(entry => ({
      date: entry.date,
      visits: entry.raw.views,
      avgSessionMs: entry.derived?.avgCardViewTimeMs || null,
      bounceRate: entry.derived?.qualityVisitRate || null
    }));
    
    // Calendar data for current month (using visits as the value)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthEntries = Object.values(dailyByDate).filter(entry => 
      entry.date.startsWith(currentMonth)
    );
    
    const calendarData = currentMonthEntries.map(entry => ({
      day: entry.date,
      value: entry.raw.views
    }));
    
    return {
      todayKpis,
      visitsByDeviceSeries,
      engagementSeries,
      calendarData,
      isLoading,
      error: error || null
    };
  }, [dailyByDate, dailyIndex, rangeDays, isLoading, error]);
}