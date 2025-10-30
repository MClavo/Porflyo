import type { HeatmapData, TopCell } from './types';
import { produce } from 'immer';

// Heatmap configuration: Controls update frequency to prevent values from growing too fast
// Only 1 out of every HEATMAP_UPDATE_RATE mouse move events will be recorded
export const HEATMAP_UPDATE_RATE = 3; // Update every N events (1=every event, 2=every 2nd event, 3=every 3rd, etc.)
export const HEATMAP_CLICK_MULTIPLIER = 3; // Multiplier when mouse button is pressed (e.g., 3 = 3x more heat)

export class HeatmapGrid {
  private grid: Float32Array;
  private cols: number;
  private rows: number;
  private cellWidth: number;
  private cellHeight: number;
  private maxCount: number;
  private eventCounter: number; // Counter to throttle updates

  constructor(cols: number, rows: number, cellWidth: number, cellHeight: number) {
    this.cols = cols;
    this.rows = rows;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.grid = new Float32Array(cols * rows);
    this.maxCount = 1;
    this.eventCounter = 0;
  }

  resize(cols: number, rows: number, cellWidth: number, cellHeight: number): void {
    const oldGrid = this.grid;
    const oldCols = this.cols;
    const oldRows = this.rows;

    this.cols = cols;
    this.rows = rows;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;

    const newGrid = new Float32Array(cols * rows);

    // Copiar datos existentes a la nueva grilla
    for (let r = 0; r < Math.min(rows, oldRows); r++) {
      for (let c = 0; c < Math.min(cols, oldCols); c++) {
        const oldIdx = r * oldCols + c;
        const newIdx = r * cols + c;
        if (oldIdx < oldGrid.length && newIdx < newGrid.length) {
          newGrid[newIdx] = oldGrid[oldIdx];
        }
      }
    }

    this.grid = newGrid;
  }

  addHeat(x: number, y: number, isMouseDown: boolean = false): void {
    // Increment counter and check if we should update this event
    this.eventCounter++;
    if (this.eventCounter % HEATMAP_UPDATE_RATE !== 0) {
      return; // Skip this event
    }

    const cx = Math.floor(x / this.cellWidth);
    const cy = Math.floor(y / this.cellHeight);
    
    if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) return;
    
    const idx = cy * this.cols + cx;
    // Apply multiplier when mouse button is pressed
    const increment = isMouseDown ? HEATMAP_CLICK_MULTIPLIER : 1;
    this.grid[idx] = this.grid[idx] + increment;
    
    if (this.grid[idx] > this.maxCount) {
      this.maxCount = this.grid[idx];
    }
  }

  getGrid(): Float32Array {
    return this.grid;
  }

  getDimensions() {
    return {
      cols: this.cols,
      rows: this.rows,
      cellWidth: this.cellWidth,
      cellHeight: this.cellHeight,
    };
  }

  getMaxCount(): number {
    return this.maxCount;
  }

  getTotalInteractions(): number {
    return Array.from(this.grid).reduce((sum, count) => sum + count, 0);
  }

  getData(): HeatmapData {
    return produce({} as HeatmapData, draft => {
      draft.cols = this.cols;
      draft.rows = this.rows;
      draft.cellWidth = this.cellWidth;
      draft.cellHeight = this.cellHeight;
      draft.totalInteractions = this.getTotalInteractions();
      draft.maxCount = this.maxCount;
      draft.isRecording = false; // Esto se maneja en el hook principal
      draft.gridData = Array.from(this.grid);
    });
  }

  getTopCells(topN: number): TopCell[] {
    return produce([] as TopCell[], draft => {
      Array.from(this.grid)
        .map((value, index) => {
          const row = Math.floor(index / this.cols);
          const col = index % this.cols;
          return {
            index,
            value,
            col,
            row,
            x: col * this.cellWidth + this.cellWidth / 2,
            y: row * this.cellHeight + this.cellHeight / 2,
          };
        })
        .filter(cell => cell.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, topN)
        .forEach(cell => {
          draft.push(cell);
        });
    });
  }

  reset(): void {
    this.grid.fill(0);
    this.maxCount = 1;
    this.eventCounter = 0;
  }

  showTopCellsOnly(topN: number): void {
    const topCells = this.getTopCells(topN);
    const newGrid = new Float32Array(this.grid.length);
    
    topCells.forEach(cell => {
      newGrid[cell.index] = cell.value;
    });
    
    this.grid = newGrid;
    
    // Recalcular maxCount
    const newMax = Math.max(...Array.from(newGrid));
    this.maxCount = newMax > 0 ? newMax : 1;
  }
}