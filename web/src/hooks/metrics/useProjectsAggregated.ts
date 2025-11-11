/**
 * Projects aggregated data hook
 * Aggregates project metrics across slots in a date range
 */

import { useMemo } from 'react';
import { useMetricsStore } from '../../state/metrics.store';
import { sliceByLastNDays } from '../../lib/dates';
import { safeDiv, toMs } from '../../lib/derived';
import type { TimeUnit } from '../../api/types';

export interface ProjectAggregated {
  projectId: number;
  exposures: number;
  viewTimeMs: number;
  codeViews: number;
  liveViews: number;
  avgViewTimeMs: number | null;
  codeCtr: number | null; // codeViews / exposures
  liveCtr: number | null; // liveViews / exposures
}

export interface ProjectsAggregatedData {
  // Three sorted arrays for different rankings
  byExposures: ProjectAggregated[];
  byViewTime: ProjectAggregated[];
  byCtr: ProjectAggregated[]; // sorted by best CTR (code or live)
  
  // Per-day series for trend comparisons
  dailySeries: Record<string, ProjectAggregated[]>; // date -> projects for that day
  
  isLoading: boolean;
  error: string | null;
}

export function useProjectsAggregated(rangeDays: number = 30): ProjectsAggregatedData {
  const { slotByDate, slotIndex, meta, isLoading, error } = useMetricsStore();
  
  return useMemo(() => {
    if (!slotByDate || slotIndex.length === 0) {
      return {
        byExposures: [],
        byViewTime: [],
        byCtr: [],
        dailySeries: {},
        isLoading,
        error: error || null
      };
    }
    
    // Get recent dates from slot index
    const recentDates = sliceByLastNDays(slotIndex, rangeDays);
    const timeBase: TimeUnit = meta?.units?.timeBase || 'ds';
    
    // Aggregate projects across the date range
    const projectAggregates = new Map<number, {
      exposures: number;
      viewTime: number; // in original timeBase units
      codeViews: number;
      liveViews: number;
    }>();
    
    // Build daily series and aggregate totals
    const dailySeries: Record<string, ProjectAggregated[]> = {};
    
    recentDates.forEach(date => {
      const slots = Object.values(slotByDate).filter(slot => slot.date === date);
      const dayProjects: ProjectAggregated[] = [];
      
      slots.forEach(slot => {
        slot.projects.forEach(project => {
          // Add to daily series
          const dayProject: ProjectAggregated = {
            projectId: project.projectId,
            exposures: project.exposures,
            viewTimeMs: toMs(project.viewTime, timeBase),
            codeViews: project.codeViews,
            liveViews: project.liveViews,
            avgViewTimeMs: safeDiv(toMs(project.viewTime, timeBase), project.exposures),
            codeCtr: safeDiv(project.codeViews, project.exposures),
            liveCtr: safeDiv(project.liveViews, project.exposures)
          };
          dayProjects.push(dayProject);
          
          // Add to range aggregates
          const current = projectAggregates.get(project.projectId) || {
            exposures: 0,
            viewTime: 0,
            codeViews: 0,
            liveViews: 0
          };
          
          projectAggregates.set(project.projectId, {
            exposures: current.exposures + project.exposures,
            viewTime: current.viewTime + project.viewTime,
            codeViews: current.codeViews + project.codeViews,
            liveViews: current.liveViews + project.liveViews
          });
        });
      });
      
      dailySeries[date] = dayProjects;
    });
    
    // Convert aggregates to final format
    const allProjects: ProjectAggregated[] = Array.from(projectAggregates.entries()).map(
      ([projectId, agg]) => ({
        projectId,
        exposures: agg.exposures,
        viewTimeMs: toMs(agg.viewTime, timeBase),
        codeViews: agg.codeViews,
        liveViews: agg.liveViews,
        avgViewTimeMs: safeDiv(toMs(agg.viewTime, timeBase), agg.exposures),
        codeCtr: safeDiv(agg.codeViews, agg.exposures),
        liveCtr: safeDiv(agg.liveViews, agg.exposures)
      })
    );
    
    // Create sorted arrays
    const byExposures = [...allProjects].sort((a, b) => b.exposures - a.exposures);
    const byViewTime = [...allProjects].sort((a, b) => b.viewTimeMs - a.viewTimeMs);
    
    // Sort by best CTR (prioritize code CTR, fallback to live CTR)
    const byCtr = [...allProjects].sort((a, b) => {
      const aCtr = a.codeCtr || a.liveCtr || 0;
      const bCtr = b.codeCtr || b.liveCtr || 0;
      return bCtr - aCtr;
    });
    
    return {
      byExposures,
      byViewTime,
      byCtr,
      dailySeries,
      isLoading,
      error: error || null
    };
  }, [slotByDate, slotIndex, meta, rangeDays, isLoading, error]);
}