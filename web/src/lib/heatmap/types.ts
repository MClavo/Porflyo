export type HeatmapOptions = {
  // horizontal: fixed number of columns (always fill width)
  maxCols?: number;           // default 20
  // vertical: compute rows from container height and cellHeight, capped by maxRows
  maxRows?: number;           // default 100
  cellHeight?: number;        // px height of each cell (vertical), default 60
  // appearance
  shape?: 'circle' | 'rect' | 'gradient';
  radius?: number;            // visual radius for circles (overrides relative)
  // idle threshold in ms (stop recording when idle)
  idleMs?: number;            // default 2000
  // draw throttle
  drawIntervalMs?: number;    // default 100
  // disable heatmap functionality
  disabled?: boolean;         // default false
  // gradient options
  gradientRadius?: number;    // radius for gradient blur effect
  intensity?: number;         // intensity multiplier for heat values
};

export type HeatmapData = {
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  totalInteractions: number;
  maxCount: number;
  isRecording: boolean;
  gridData: number[];
  topCellsOnly?: boolean;
};

export type TopCell = {
  index: number;
  value: number;
  col: number;
  row: number;
  x: number;
  y: number;
};