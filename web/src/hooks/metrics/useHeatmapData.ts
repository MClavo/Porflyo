/**
 * Heatmap data hook
 * Provides slot-level data for portfolio heatmap visualization
 */

import { useMemo } from 'react';
import { useMetricsStore } from '../../state/metrics.store';
import { latest } from '../../lib/dates';
import type { Meta } from '../../api/types';

export interface HeatmapCell {
  slotId: string;
  projectId: number;
  value: number; // engagement or views metric
  x: number; // grid position
  y: number; // grid position
}

export interface HeatmapData {
  meta: Meta | null;
  cells: HeatmapCell[];
  kpis: {
    coverage: number | null; // percentage of slots with data
    k: number; // total number of projects
    top: {
      projectId: number;
      value: number;
      percentage: number;
    } | null; // top performing project
  };
  isLoading: boolean;
  error: string | null;
}

export function useHeatmapData(date?: string): HeatmapData {
  const { slotByDate, slotIndex, meta, isLoading, error } = useMetricsStore();
  
  return useMemo(() => {
    if (!slotByDate || slotIndex.length === 0) {
      return {
        meta: meta || null,
        cells: [],
        kpis: {
          coverage: null,
          k: 0,
          top: null
        },
        isLoading,
        error: error || null
      };
    }
    
    // Use provided date or latest slot date
    const targetDate = date || latest(slotIndex);
    if (!targetDate) {
      return {
        meta: meta || null,
        cells: [],
        kpis: {
          coverage: null,
          k: 0,
          top: null
        },
        isLoading,
        error: error || null
      };
    }
    
    // Get all slots for the target date
    const daySlots = Object.values(slotByDate).filter(slot => 
      slot.date === targetDate
    );
    
    if (daySlots.length === 0) {
      return {
        meta: meta || null,
        cells: [],
        kpis: {
          coverage: null,
          k: 0,
          top: null
        },
        isLoading,
        error: error || null
      };
    }
    
    // Get the first slot for the date (assuming one slot per date for now)
    const slot = daySlots[0];
    
    // Transform heatmap cells from the slot
    const cells: HeatmapCell[] = slot.heatmap.cells.map((cell, index) => ({
      slotId: `${slot.date}-${index}`,
      projectId: 0, // Will be mapped from cell index to project
      value: cell.value,
      x: index % slot.heatmap.meta.columns,
      y: Math.floor(index / slot.heatmap.meta.columns)
    }));
    
    // Calculate KPIs
    const totalCells = slot.heatmap.meta.k;
    const cellsWithData = slot.heatmap.cells.filter(cell => cell.value > 0).length;
    const coverage = totalCells > 0 ? (cellsWithData / totalCells) * 100 : null;
    
    // Count unique projects
    const uniqueProjects = new Set(slot.projects.map(p => p.projectId));
    const k = uniqueProjects.size;
    
    // Find top performing project
    const projectTotals = new Map<number, number>();
    slot.projects.forEach(project => {
      const value = project.viewTime; // use viewTime as primary metric
      projectTotals.set(project.projectId, value);
    });
    
    let top: HeatmapData['kpis']['top'] = null;
    if (projectTotals.size > 0) {
      const [topProjectId, topValue] = Array.from(projectTotals.entries())
        .sort(([, a], [, b]) => b - a)[0];
      
      const totalValue = Array.from(projectTotals.values()).reduce((sum, val) => sum + val, 0);
      const percentage = totalValue > 0 ? (topValue / totalValue) * 100 : 0;
      
      top = {
        projectId: topProjectId,
        value: topValue,
        percentage
      };
    }
    
    return {
      meta: meta || null,
      cells,
      kpis: {
        coverage,
        k,
        top
      },
      isLoading,
      error: error || null
    };
  }, [slotByDate, slotIndex, meta, date, isLoading, error]);
}