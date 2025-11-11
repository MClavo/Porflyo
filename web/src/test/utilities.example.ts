/**
 * Example usage of centralized formatting, derived calculations, and date utilities
 * This demonstrates how components should import and use these helpers
 */

import {
  // Formatting utilities
  formatMs,
  formatPct,
  formatInt,
  formatNumber,
  formatCompact,
  
  // Derived calculations
  safeDiv,
  toMs,
  deviceMix,
  engagementAvg,
  avgScrollTimeMs,
  avgCardViewTimeMs,
  tffiMeanMs,
  emailConv,
  qualityVisitRate,
  socialCtr,
  avgViewTimeMs,
  codeCtr,
  liveCtr,
  deltaPct,
  clamp,
  
  // Date utilities
  latest,
  sliceByLastNDays,
  groupByMonth,
  filterDateRange,
  windowStartDate,
  getUniqueMonths,
  formatDate,
  
  // Types
  type TimeUnit,
} from '../lib';

import type { DailyRaw, Meta } from '../api/types';

/**
 * Example: Format various metrics for display
 */
export function formatMetricsExample() {
  // Sample raw values
  const scrollTime = 1500; // milliseconds
  const emailConversionRate = 0.0273; // fraction
  const views = 1234;
  const avgEngagement = 43.636;
  
  return {
    scrollTime: formatMs(scrollTime), // "1.5s"
    conversion: formatPct(emailConversionRate), // "3%"
    conversionPrecise: formatPct(emailConversionRate, 2), // "2.73%"
    views: formatInt(views), // "1,234"
    viewsCompact: formatCompact(views), // "1.2K"
    engagement: formatNumber(avgEngagement), // "43.6"
    nullValue: formatMs(null), // "N/A"
  };
}

/**
 * Example: Calculate derived metrics from raw daily data
 */
export function calculateDerivedExample(raw: DailyRaw, meta: Meta) {
  const timeBase: TimeUnit = meta.units.timeBase;
  
  // Portfolio-level derived metrics
  const deviceBreakdown = deviceMix(raw.desktopViews, raw.mobileTabletViews);
  const engagement = engagementAvg(raw.sumScrollScore, raw.views);
  const scrollTime = avgScrollTimeMs(raw.sumScrollTime, raw.views, timeBase);
  const cardViewTime = avgCardViewTimeMs(raw.projectViewTimeTotal, raw.projectExposuresTotal, timeBase);
  const ttfi = tffiMeanMs(raw.tffiSumMs, raw.tffiCount);
  const emailConversion = emailConv(raw.emailCopies, raw.views);
  
  // Optional metrics
  const qualityRate = qualityVisitRate(raw.qualityVisits, raw.views);
  const socialClickRate = raw.socialClicksTotal 
    ? socialCtr(raw.socialClicksTotal, raw.views) 
    : null;
  
  return {
    deviceMix: {
      desktop: formatPct(deviceBreakdown.desktopPct),
      mobileTablet: formatPct(deviceBreakdown.mobileTabletPct),
    },
    engagement: formatNumber(engagement),
    scrollTime: formatMs(scrollTime),
    cardViewTime: formatMs(cardViewTime),
    ttfi: formatMs(ttfi),
    emailConversion: formatPct(emailConversion, 1),
    qualityRate: formatPct(qualityRate, 1),
    socialCtr: formatPct(socialClickRate, 2),
  };
}

/**
 * Example: Calculate project-level derived metrics
 */
export function calculateProjectDerivedExample(
  projectId: number,
  exposures: number,
  viewTime: number,
  codeViews: number,
  liveViews: number,
  timeBase: TimeUnit
) {
  const avgViewTime = avgViewTimeMs(viewTime, exposures, timeBase);
  const codeClickRate = codeCtr(codeViews, exposures);
  const liveClickRate = liveCtr(liveViews, exposures);
  
  return {
    projectId,
    avgViewTime: formatMs(avgViewTime),
    codeClickRate: formatPct(codeClickRate, 1),
    liveClickRate: formatPct(liveClickRate, 1),
    exposures: formatInt(exposures),
  };
}

/**
 * Example: Work with date ranges and filtering  
 */
export function dateUtilitiesExample(dailyIndex: string[]) {
  // Get latest date
  const latestDate = latest(dailyIndex); // "2025-09-26"
  
  // Get last 7 days
  const lastWeek = sliceByLastNDays(dailyIndex, 7);
  
  // Group by month
  const byMonth = groupByMonth(dailyIndex);
  // { "2025-09": ["2025-09-26", "2025-09-25", ...], "2025-08": [...] }
  
  // Filter date range
  const september = filterDateRange(dailyIndex, '2025-09-01', '2025-09-30');
  
  // Get dates from 28 days ago
  const windowStart = latestDate ? windowStartDate(latestDate, 28) : null;
  
  // Format dates for display
  const formattedDates = lastWeek.map(date => ({
    date,
    short: formatDate(date, 'short'), // "9/26"
    medium: formatDate(date, 'medium'), // "Sep 26, 2025"  
    long: formatDate(date, 'long'), // "Thursday, September 26, 2025"
  }));
  
  return {
    latestDate,
    lastWeek,
    byMonth,
    september: september.length,
    windowStart,
    formattedDates,
    uniqueMonths: getUniqueMonths(dailyIndex),
  };
}

/**
 * Example: Calculate window aggregations and deltas
 */
export function windowAggregationExample(
  currentViews: number,
  previousViews: number,
  currentEngagement: number,
  previousEngagement: number
) {
  // Calculate deltas
  const viewsDelta = deltaPct(currentViews, previousViews);
  const engagementDelta = deltaPct(currentEngagement, previousEngagement);
  
  // Clamp z-scores for display
  const clampedZScore = clamp(-4.2, -3, 3); // -3
  
  return {
    currentViews: formatInt(currentViews),
    viewsDelta: formatPct(viewsDelta, 1),
    viewsDeltaText: viewsDelta !== null && viewsDelta > 0 ? '↗️' : '↘️',
    
    currentEngagement: formatNumber(currentEngagement),
    engagementDelta: formatPct(engagementDelta, 1),
    
    clampedZScore: formatNumber(clampedZScore, 2),
  };
}

/**
 * Example: Unit conversion utilities
 */
export function unitConversionExample() {
  const deciseconds = 15; // 1.5 seconds in deciseconds
  const milliseconds = 1500; // 1.5 seconds in milliseconds
  
  return {
    fromDeciseconds: {
      original: deciseconds,
      converted: toMs(deciseconds, 'ds'), // 1500ms
      formatted: formatMs(toMs(deciseconds, 'ds')), // "1.5s"
    },
    fromMilliseconds: {
      original: milliseconds,
      converted: toMs(milliseconds, 'ms'), // 1500ms (unchanged)
      formatted: formatMs(toMs(milliseconds, 'ms')), // "1.5s"
    },
    safeDivision: {
      valid: safeDiv(10, 2), // 5
      invalid: safeDiv(10, 0), // null
      formatted: formatNumber(safeDiv(10, 0)), // "N/A"
    },
  };
}

/**
 * Example component showing how to use all utilities together
 */
export function MetricsDisplayExample({ 
  dailyData, 
  meta, 
  dailyIndex 
}: {
  dailyData: DailyRaw;
  meta: Meta;
  dailyIndex: string[];
}) {
  // Calculate derived metrics
  const derived = calculateDerivedExample(dailyData, meta);
  
  // Work with dates
  const dateInfo = dateUtilitiesExample(dailyIndex);
  
  // Example project data
  const projectExample = calculateProjectDerivedExample(
    101, 
    62, 
    1850, // in timeBase units
    14, 
    6, 
    meta.units.timeBase
  );
  
  return {
    title: `Metrics for ${formatDate(dateInfo.latestDate || '2025-09-26')}`,
    summary: {
      views: formatInt(dailyData.views),
      engagement: derived.engagement,
      scrollTime: derived.scrollTime,
      emailConversion: derived.emailConversion,
    },
    deviceBreakdown: derived.deviceMix,
    projectExample,
    dateRange: `Last ${dateInfo.lastWeek.length} days`,
    availableMonths: dateInfo.uniqueMonths,
  };
}

console.log('✅ All formatting, derived calculations, and date utilities compiled successfully!');