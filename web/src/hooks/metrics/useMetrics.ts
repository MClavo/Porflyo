/**
 * Selector hooks for metrics data
 */

import { useMetricsStore } from '../../state/metrics.store';
import type { Meta, DailyEntry, SlotEntry } from '../../api/types';

/**
 * Get metadata information
 */
export function useMeta(): Meta | null {
  return useMetricsStore((state) => state.meta);
}

/**
 * Get daily entry by date
 */
export function useDailyByDate(date: string): DailyEntry | undefined {
  return useMetricsStore((state) => state.dailyByDate[date]);
}

/**
 * Get slot entry by date
 */
export function useSlotByDate(date: string): SlotEntry | undefined {
  return useMetricsStore((state) => state.slotByDate[date]);
}

/**
 * Get the latest (most recent) date available
 */
export function useLatestDate(): string | null {
  return useMetricsStore((state) => {
    if (state.dailyIndex.length > 0) {
      return state.dailyIndex[0]; // Already sorted desc (newest first)
    }
    return null;
  });
}

/**
 * Get all daily entries in chronological order (newest first)
 */
export function useAllDaily(): DailyEntry[] {
  return useMetricsStore((state) => {
    return state.dailyIndex.map(date => state.dailyByDate[date]);
  });
}

/**
 * Get all slot dates in chronological order (newest first)
 */
export function useSlotDates(): string[] {
  return useMetricsStore((state) => state.slotIndex);
}

/**
 * Get all slots in chronological order (newest first)
 */
export function useAllSlots(): SlotEntry[] {
  return useMetricsStore((state) => {
    return state.slotIndex.map(date => state.slotByDate[date]);
  });
}

/**
 * Get loading state
 */
export function useMetricsLoading(): boolean {
  return useMetricsStore((state) => state.isLoading);
}

/**
 * Get error state
 */
export function useMetricsError(): string | undefined {
  return useMetricsStore((state) => state.error);
}

/**
 * Get daily entries for a date range (inclusive)
 */
export function useDailyRange(startDate: string, endDate: string): DailyEntry[] {
  return useMetricsStore((state) => {
    return state.dailyIndex
      .filter(date => date >= startDate && date <= endDate)
      .map(date => state.dailyByDate[date]);
  });
}

/**
 * Get the latest N daily entries
 */
export function useLatestDaily(count: number): DailyEntry[] {
  return useMetricsStore((state) => {
    return state.dailyIndex
      .slice(0, count)
      .map(date => state.dailyByDate[date]);
  });
}

/**
 * Get metrics store actions
 */
export function useMetricsActions() {
  return useMetricsStore((state) => ({
    loadBootstrap: state.loadBootstrap,
    clearError: state.clearError,
    reset: state.reset,
  }));
}

/**
 * Check if metrics data is available
 */
export function useHasMetricsData(): boolean {
  return useMetricsStore((state) => {
    return state.meta !== null && state.dailyIndex.length > 0;
  });
}