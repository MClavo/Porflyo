/**
 * Slot and heatmap related types (moved from ../types.ts)
 */

export interface HeatmapCell {
  index: number; // position in flattened grid
  value: number; // intensity/heat value
  count: number; // number of interactions
}

export interface HeatmapMeta {
  rows: number;
  columns: number;
  k: number; // total possible cells (typically 400)
}

export interface Heatmap {
  meta: HeatmapMeta;
  cells: HeatmapCell[];
}

export interface ProjectRaw {
  projectId: number;
  exposures: number;
  viewTime: number; // in timeBase units (ds)
  codeViews: number;
  liveViews: number;
}

export interface SlotEntry {
  date: string; // YYYY-MM-DD format
  projects: ProjectRaw[];
  heatmap: Heatmap;
}
