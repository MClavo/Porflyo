/**
 * Derived metrics calculations (unit-aware)
 * Implements the formulas from porflyo-metrics-derived-and-zscores.md
 */

import type { TimeUnit } from '../api/types';

/**
 * Safe division - returns null if denominator is 0 or negative
 * @param a - Numerator
 * @param b - Denominator
 * @returns Division result or null
 */
export function safeDiv(a: number, b: number): number | null {
  if (b <= 0) {
    return null;
  }
  return a / b;
}

/**
 * Convert time value to milliseconds based on time base
 * @param x - Time value
 * @param timeBase - Unit of the input ('ds' for deciseconds, 'ms' for milliseconds)
 * @returns Time in milliseconds
 */
export function toMs(x: number, timeBase: TimeUnit): number {
  if (timeBase === 'ds') {
    return x * 100; // deciseconds to milliseconds
  }
  return x; // already in milliseconds
}

// ============================================
// PORTFOLIO PER-DAY DERIVED METRICS
// ============================================

/**
 * Device mix breakdown (desktop vs mobile/tablet percentages)
 * @param vd - Desktop views
 * @param vm - Mobile/tablet views
 * @returns Object with desktop and mobile/tablet percentages (fractions 0..1)
 */
export function deviceMix(vd: number, vm: number) {
  const total = vd + vm;
  return {
    desktopPct: safeDiv(vd, total),
    mobileTabletPct: safeDiv(vm, total),
  };
}

/**
 * Average engagement score per view
 * @param S - Sum of scroll scores
 * @param v - Total views
 * @returns Average engagement or null
 */
export function engagementAvg(S: number, v: number): number | null {
  return safeDiv(S, v);
}

/**
 * Average scroll time per view in milliseconds
 * @param T - Sum of scroll time (in timeBase units)
 * @param v - Total views
 * @param timeBase - Unit of T ('ds' or 'ms')
 * @returns Average scroll time in ms or null
 */
export function avgScrollTimeMs(T: number, v: number, timeBase: TimeUnit): number | null {
  const result = safeDiv(T, v);
  return result !== null ? toMs(result, timeBase) : null;
}

/**
 * Average card view time per exposure in milliseconds
 * @param PVT - Project view time total (in timeBase units)
 * @param PE - Project exposures total
 * @param timeBase - Unit of PVT ('ds' or 'ms')
 * @returns Average card view time in ms or null
 */
export function avgCardViewTimeMs(PVT: number, PE: number, timeBase: TimeUnit): number | null {
  const result = safeDiv(PVT, PE);
  return result !== null ? toMs(result, timeBase) : null;
}

/**
 * Time to First Interactive mean in milliseconds
 * @param TS - TTFI sum in milliseconds
 * @param TC - TTFI count
 * @returns Mean TTFI in ms or null
 */
export function tffiMeanMs(TS: number, TC: number): number | null {
  return safeDiv(TS, TC);
}

/**
 * Email conversion rate (fraction 0..1)
 * @param e - Email copies
 * @param v - Total views
 * @returns Email conversion rate or null
 */
export function emailConv(e: number, v: number): number | null {
  return safeDiv(e, v);
}

/**
 * Quality visit rate (fraction 0..1)
 * @param q - Quality visits
 * @param v - Total views
 * @returns Quality visit rate or null
 */
export function qualityVisitRate(q: number, v: number): number | null {
  return safeDiv(q, v);
}

/**
 * Social click-through rate (fraction 0..1)
 * @param SC - Social clicks total
 * @param v - Total views
 * @returns Social CTR or null
 */
export function socialCtr(SC: number, v: number): number | null {
  return safeDiv(SC, v);
}

// ============================================
// PROJECT PER-DAY DERIVED METRICS
// ============================================

/**
 * Average view time per project exposure in milliseconds
 * @param VTp - Project view time (in timeBase units)
 * @param Xp - Project exposures
 * @param timeBase - Unit of VTp ('ds' or 'ms')
 * @returns Average view time in ms or null
 */
export function avgViewTimeMs(VTp: number, Xp: number, timeBase: TimeUnit): number | null {
  const result = safeDiv(VTp, Xp);
  return result !== null ? toMs(result, timeBase) : null;
}

/**
 * Code click-through rate (fraction 0..1)
 * @param CVp - Code views for project
 * @param Xp - Project exposures
 * @returns Code CTR or null
 */
export function codeCtr(CVp: number, Xp: number): number | null {
  return safeDiv(CVp, Xp);
}

/**
 * Live demo click-through rate (fraction 0..1)
 * @param LVp - Live views for project
 * @param Xp - Project exposures
 * @returns Live CTR or null
 */
export function liveCtr(LVp: number, Xp: number): number | null {
  return safeDiv(LVp, Xp);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate delta percentage vs previous period
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Delta percentage (fraction, can be negative) or null
 */
export function deltaPct(current: number, previous: number): number | null {
  const denominator = Math.abs(previous) + 1e-9; // Small epsilon to avoid division by zero
  return (current - previous) / denominator;
}

/**
 * Clamp value to a range
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}