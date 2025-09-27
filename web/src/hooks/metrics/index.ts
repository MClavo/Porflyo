/**
 * Metrics hooks for assembling view-ready data from metrics store
 * Pages stay dumb; hooks provide composed, memoized data
 */

// Legacy metrics hooks
export { useScrollMetrics, type UseScrollMetricsOptions, type UseScrollMetricsReturn } from './useScrollMetrics';
export { useHeatmap } from './useHeatmap';
export { useMetrics } from './useGetMetrics';

// New data assembly hooks
export { useOverviewData } from './useOverviewData';
export type { OverviewData } from './useOverviewData';

export { useHeatmapData } from './useHeatmapData';
export type { HeatmapData, HeatmapCell } from './useHeatmapData';

export { useProjectsAggregated } from './useProjectsAggregated';
export type { 
  ProjectsAggregatedData, 
  ProjectAggregated 
} from './useProjectsAggregated';

export { useProjectsData } from './useProjectsData';
export type { ProjectsData, SortBy } from './useProjectsData';

export { useDailyPageData } from './useDailyPageData';
export type { DailyPageData, DailySortBy } from './useDailyPageData';

export { useDaily } from './useDaily';
export type { DailyData, SlotRow } from './useDaily';

export { useTrends } from './useTrends';
export type { 
  TrendsData, 
  TrendSeries, 
  TrendMetric 
} from './useTrends';