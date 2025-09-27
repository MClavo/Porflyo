/**
 * Response wrappers for metrics endpoints
 */

import type { Meta } from './shared.types';
import type { DailyEntry } from './metrics.types';
import type { SlotEntry } from './slots.types';

export interface BootstrapResponse {
  meta: Meta;
  dailyAgg: DailyEntry[];
  slots: SlotEntry[];
}

export interface TodayResponse {
  meta: Meta;
  date: string; // YYYY-MM-DD format
  daily: {
    raw: import('./metrics.types').DailyRaw;
    derived?: import('./metrics.types').DailyDerived;
    zScores?: { [metricName: string]: number };
  };
  slot: {
    projects: import('./slots.types').ProjectRaw[];
    heatmap: import('./slots.types').Heatmap;
  };
}

export interface MonthResponse {
  meta: Meta;
  dailyAgg: DailyEntry[];
}
