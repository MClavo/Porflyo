/**
 * TimeRange utilities
 */

export type TimeRangeOption = '1week' | '2weeks' | '1month' | '3months';

export interface RangeOption {
  value: TimeRangeOption;
  label: string;
  days: number;
}

export const RANGE_OPTIONS: RangeOption[] = [
  { value: '1week', label: '1 Week', days: 7 },
  { value: '2weeks', label: '2 Weeks', days: 14 },
  { value: '1month', label: '1 Month', days: 30 },
  { value: '3months', label: '3 Months', days: 90 }
];

// Helper para convertir el valor a días
export const getTimeRangeDays = (range: TimeRangeOption): number => {
  const option = RANGE_OPTIONS.find(opt => opt.value === range);
  return option?.days || 30;
};