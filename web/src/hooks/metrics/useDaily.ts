/**
 * Daily data hook
 * Provides daily KPIs and slot rows for a specific date
 */

import { useMemo } from 'react';
import { useMetricsStore } from '../../state/metrics.store';
import { latest } from '../../lib/dates';
import { toMs, safeDiv } from '../../lib/derived';
import type { TimeUnit } from '../../api/types';

export interface SlotRow {
  date: string;
  projectId: number;
  exposures: number;
  viewTimeMs: number;
  codeViews: number;
  liveViews: number;
  avgViewTimeMs: number | null;
  codeCtr: number | null;
  liveCtr: number | null;
}

export interface DailyData {
  // Daily-level KPIs
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
  
  // Slot-level data shaped for table display
  slotRows: SlotRow[];
  
  isLoading: boolean;
  error: string | null;
}

export function useDaily(date?: string): DailyData {
  const { dailyByDate, dailyIndex, slotByDate, meta, isLoading, error } = useMetricsStore();
  
  return useMemo(() => {
    if (!dailyByDate || !slotByDate) {
      return {
        dailyKpis: null,
        slotRows: [],
        isLoading,
        error: error || null
      };
    }
    
    // Use provided date or latest available date
    const targetDate = date || latest(dailyIndex);
    if (!targetDate) {
      return {
        dailyKpis: null,
        slotRows: [],
        isLoading,
        error: error || null
      };
    }
    
    const timeBase: TimeUnit = meta?.units?.timeBase || 'ds';
    
    // Get daily entry
    const dailyEntry = dailyByDate[targetDate];
    const dailyKpis = dailyEntry ? {
      date: dailyEntry.date,
      totalViews: dailyEntry.raw.views,
      avgSessionMs: dailyEntry.derived?.avgCardViewTimeMs || null,
      engagementAvg: dailyEntry.derived?.engagementAvg || null,
      deviceMix: dailyEntry.derived?.deviceMix || null,
      qualityVisitRate: dailyEntry.derived?.qualityVisitRate || null
    } : null;
    
    // Get slot entries for the date
    const daySlots = Object.values(slotByDate).filter(slot => slot.date === targetDate);
    
    // Transform slots into table rows
    const slotRows: SlotRow[] = [];
    daySlots.forEach(slot => {
      slot.projects.forEach(project => {
        slotRows.push({
          date: slot.date,
          projectId: project.projectId,
          exposures: project.exposures,
          viewTimeMs: toMs(project.viewTime, timeBase),
          codeViews: project.codeViews,
          liveViews: project.liveViews,
          avgViewTimeMs: safeDiv(toMs(project.viewTime, timeBase), project.exposures),
          codeCtr: safeDiv(project.codeViews, project.exposures),
          liveCtr: safeDiv(project.liveViews, project.exposures)
        });
      });
    });
    
    // Sort rows by exposures descending
    slotRows.sort((a, b) => b.exposures - a.exposures);
    
    return {
      dailyKpis,
      slotRows,
      isLoading,
      error: error || null
    };
  }, [dailyByDate, dailyIndex, slotByDate, meta, date, isLoading, error]);
}