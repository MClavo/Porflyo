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
    avgSessionMinutes: number | null; // in minutes
    // optional backward-compat aliases (ms/min conversions are handled by hooks)
    avgSessionMs?: number | null;
    deviceMix: { desktop: number; mobile: number } | null; // fractions 0..1
    qualityVisitRatePct: number | null; // fraction 0..1
    emailConversionPct: number | null; // fraction 0..1
    // optional legacy bounceRate field used by some pages (fraction 0..1)
    bounceRate?: number | null;
    emailCopies: number;
    socialClicksTotal: number;
    projectExposuresTotal: number;
    projectViewTimeMs: number | null;
    projectCodeViewsTotal: number;
    projectLiveViewsTotal: number;
    zScores?: {
      visits?: number | null;
      engagement?: number | null;
      ttfi?: number | null;
    } | null;
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
    engagementAvg?: number | null;
    tffiMeanMs?: number | null;
    emailConversion?: number | null;
  }>;
  
  // Calendar heatmap data for current month
  calendarData: Array<{
    day: string; // YYYY-MM-DD format
    value: number;
    zScore?: number | null;
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
    
    // Helpers / assumptions:
    // - timeBase 'ds' means deciseconds (0.1s) => 1 ds = 100 ms
    const dsToMs = (ds: number | null | undefined) => {
      if (ds == null) return null;
      return ds * 100;
    };

    const normalizePct = (v: number | null | undefined) => {
      if (v == null) return null;
      // if backend uses 0..100 convert to 0..1
      if (v > 1) return v / 100;
      return v;
    };

    // Today's KPIs from latest daily entry (prefer derived fields but compute fallbacks from raw)
    const todayKpis = latestEntry ? (() => {
      const raw = latestEntry.raw;
      const derived = latestEntry.derived;

      const totalViews = raw.views || 0;

        // avg session: prefer derived.avgSessionTime (ds) -> convert to minutes
        // fallbacks: derived.avgViewTime (ds) or compute from raw.activeTime / views
        const dsToMinutes = (ds: number | null | undefined) => {
          if (ds == null) return null;
          // 1 ds = 0.1 seconds => minutes = ds * 0.1 / 60 = ds / 600
          return ds / 600;
        };

        let avgSessionMinutes: number | null = null;
        if (derived?.avgSessionTime != null) {
          avgSessionMinutes = dsToMinutes(derived.avgSessionTime as number);
        } else if (derived?.avgViewTime != null) {
          avgSessionMinutes = dsToMinutes(derived.avgViewTime as number);
        } else if (raw.activeTime != null && raw.views > 0) {
          avgSessionMinutes = dsToMinutes(raw.activeTime / raw.views);
        }

      // device mix: normalize to fractions 0..1
      const deviceMix = derived?.deviceMix ? {
        desktop: normalizePct(derived.deviceMix.desktopPct) || 0,
        mobile: normalizePct(derived.deviceMix.mobileTabletPct) || 0
      } : null;

      // quality visit rate: compute from raw (qualityVisits / views)
      const qualityVisitRatePct = (raw.views > 0) ? (raw.qualityVisits / raw.views) : null;

      // email conversion: prefer derived.emailConversion (fraction) else raw.emailCopies / views
      const emailConversionPct = (derived?.emailConversion != null)
        ? derived.emailConversion
        : (raw.views > 0 ? (raw.emailCopies / raw.views) : null);

      const socialClicksTotal = raw.socialClicksTotal || 0;

      // project totals and convert view time from ds to ms
      const projectExposuresTotal = raw.projectExposuresTotal || 0;
      const projectViewTimeMs = raw.projectViewTimeTotal != null ? dsToMs(raw.projectViewTimeTotal) : null;
      const projectCodeViewsTotal = raw.projectCodeViewsTotal || 0;
      const projectLiveViewsTotal = raw.projectLiveViewsTotal || 0;

      const zScores = latestEntry.zScores ? {
        visits: latestEntry.zScores.visits,
        engagement: latestEntry.zScores.engagement,
        ttfi: latestEntry.zScores.ttfi
      } : null;

      return {
        totalViews,
        avgSessionMinutes,
        // backward-compatible fields used elsewhere in the app
        avgSessionMs: avgSessionMinutes != null ? Math.round(avgSessionMinutes * 60 * 1000) : null,
        deviceMix,
        qualityVisitRatePct,
        emailConversionPct,
        emailCopies: raw.emailCopies || 0,
        socialClicksTotal,
        projectExposuresTotal,
        projectViewTimeMs,
        projectCodeViewsTotal,
        projectLiveViewsTotal,
        zScores
      };
    })() : null;
    
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
    const engagementSeries = recentEntries.map(entry => {
      const raw = entry.raw;
      const derived = entry.derived;
      const tffiMeanMs = derived?.tffiMeanMs != null ? derived.tffiMeanMs : (raw.tffiCount > 0 ? (raw.tffiSumMs / raw.tffiCount) : null);
      const avgSessionMs = derived?.avgCardViewTimeMs != null ? derived.avgCardViewTimeMs : (derived?.avgViewTime != null ? dsToMs(derived.avgViewTime as number) : (raw.views > 0 ? dsToMs(raw.activeTime / raw.views) : null));
      const qualityRate = raw.views > 0 ? (raw.qualityVisits / raw.views) : null;
      const emailConv = derived?.emailConversion != null ? derived.emailConversion : (raw.views > 0 ? (raw.emailCopies / raw.views) : null);

      return {
        date: entry.date,
        visits: raw.views,
        avgSessionMs,
        bounceRate: qualityRate,
        engagementAvg: derived?.engagementAvg ?? null,
        tffiMeanMs: tffiMeanMs ?? null,
        emailConversion: emailConv
      };
    });
    
    // Calendar data for current month (using visits as the value)
    // Calendar data: build for current month, include zScore and fill missing days with 0
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarData: Array<{ day: string; value: number; zScore?: number | null }> = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month, d).toISOString().slice(0, 10);
      const entry = dailyByDate[day];
      if (entry) {
        calendarData.push({ day, value: entry.raw.views || 0, zScore: entry.zScores?.visits ?? null });
      } else {
        // missing day -> zero value
        calendarData.push({ day, value: 0, zScore: null });
      }
    }
    
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