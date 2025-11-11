/**
 * Zustand store for metrics data with normalization and loading state
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getMetrics } from '../api';
import type { Meta, DailyEntry, SlotEntry } from '../api/types';

/**
 * Metrics store state interface
 */
interface MetricsState {
  // Data
  meta: Meta | null;
  dailyByDate: Record<string, DailyEntry>;
  slotByDate: Record<string, SlotEntry>;
  dailyIndex: string[]; // sorted desc (newest first)
  slotIndex: string[]; // sorted desc (newest first)
  
  // Loading state
  isLoading: boolean;
  error?: string;
  
  // Actions
  loadBootstrap: (portfolioId: string, months?: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  meta: null,
  dailyByDate: {},
  slotByDate: {},
  dailyIndex: [],
  slotIndex: [],
  isLoading: false,
  error: undefined,
};

/**
 * Sort dates in descending order (newest first)
 */
function sortDatesDesc(dates: string[]): string[] {
  return dates.sort((a, b) => b.localeCompare(a));
}

/**
 * Normalize daily entries into map and sorted index
 */
function normalizeDailyData(dailyAgg: DailyEntry[]) {
  const dailyByDate: Record<string, DailyEntry> = {};
  const dates: string[] = [];
  
  for (const entry of dailyAgg) {
    dailyByDate[entry.date] = entry;
    dates.push(entry.date);
  }
  
  return {
    dailyByDate,
    dailyIndex: sortDatesDesc(dates),
  };
}

/**
 * Normalize slot entries into map and sorted index
 */
function normalizeSlotData(slots: SlotEntry[]) {
  const slotByDate: Record<string, SlotEntry> = {};
  const dates: string[] = [];
  
  for (const entry of slots) {
    slotByDate[entry.date] = entry;
    dates.push(entry.date);
  }
  
  return {
    slotByDate,
    slotIndex: sortDatesDesc(dates),
  };
}

/**
 * Zustand store with immer middleware for metrics data
 */
export const useMetricsStore = create<MetricsState>()(
  immer((set, get) => ({
    ...initialState,
    
    /**
     * Load bootstrap data for a portfolio
     */
    loadBootstrap: async (portfolioId: string, months: number = 3) => {
      // Prevent concurrent loads
      if (get().isLoading) {
        return;
      }
      
      set((state) => {
        state.isLoading = true;
        state.error = undefined;
      });
      
      try {
        const response = await getMetrics({ portfolioId, months });
        
        // Normalize data
        const { dailyByDate, dailyIndex } = normalizeDailyData(response.dailyAgg);
        const { slotByDate, slotIndex } = normalizeSlotData(response.slots);
        
        set((state) => {
          state.meta = response.meta;
          state.dailyByDate = dailyByDate;
          state.slotByDate = slotByDate;
          state.dailyIndex = dailyIndex;
          state.slotIndex = slotIndex;
          state.isLoading = false;
          state.error = undefined;
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to load metrics data';
          
        set((state) => {
          state.isLoading = false;
          state.error = errorMessage;
        });
        
        throw error; // Re-throw for caller handling
      }
    },
    
    /**
     * Clear error state
     */
    clearError: () => {
      set((state) => {
        state.error = undefined;
      });
    },
    
    /**
     * Reset store to initial state
     */
    reset: () => {
      set((state) => {
        Object.assign(state, initialState);
      });
    },
  }))
);
