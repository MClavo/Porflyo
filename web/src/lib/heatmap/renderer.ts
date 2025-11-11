import type { HeatmapOptions } from './types';
import { getHeatmapColor, createRadialGradient, applyGaussianBlur } from './colors';

type RequiredHeatmapOptions = Required<Omit<HeatmapOptions, 'radius'>> & {
  radius?: number;
};

export class HeatmapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: RequiredHeatmapOptions;

  constructor(canvas: HTMLCanvasElement, options: HeatmapOptions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.options = {
      maxCols: 25,
      maxRows: 100,
      cellHeight: 60,
      shape: 'gradient',
      radius: undefined,
      idleMs: 2000,
      drawIntervalMs: 100,
      disabled: false,
      gradientRadius: 30,
      intensity: 1.0,
      ...options,
    };
  }

  updateOptions(options: Partial<HeatmapOptions>) {
    this.options = { ...this.options, ...options };
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Renderiza el heatmap con el nuevo estilo de gradiente suave
   */
  render(
    grid: Float32Array,
    cols: number,
    rows: number,
    cellW: number,
    cellH: number,
    maxCount: number
  ) {
    this.clear();

    if (this.options.shape === 'gradient') {
      this.renderGradientHeatmap(grid, cols, rows, cellW, cellH, maxCount);
    } else {
      this.renderLegacyHeatmap(grid, cols, rows, cellW, cellH, maxCount);
    }
  }

  private renderGradientHeatmap(
    grid: Float32Array,
    cols: number,
    rows: number,
    cellW: number,
    cellH: number,
    maxCount: number
  ) {
    // Crear un canvas temporal para el efecto de blur
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;

    // Configurar el modo de composición para que los gradientes se sumen
    tempCtx.globalCompositeOperation = 'lighter';

    const max = Math.max(1, maxCount);
    const gradientRadius = this.options.gradientRadius;

    // Renderizar cada punto de calor como un gradiente radial
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const count = grid[idx];
        if (!count) continue;

        const normalizedValue = Math.min(1, (count / max) * this.options.intensity);
        const cx = c * cellW + cellW / 2;
        const cy = r * cellH + cellH / 2;

        // Crear gradiente radial
        const gradient = createRadialGradient(
          tempCtx,
          cx,
          cy,
          gradientRadius,
          normalizedValue
        );

        tempCtx.fillStyle = gradient;
        tempCtx.fillRect(
          cx - gradientRadius,
          cy - gradientRadius,
          gradientRadius * 2,
          gradientRadius * 2
        );
      }
    }

    // Aplicar blur para suavizar las transiciones
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const blurredData = applyGaussianBlur(imageData, 2);
    tempCtx.putImageData(blurredData, 0, 0);

    // Dibujar el resultado final en el canvas principal
    this.ctx.drawImage(tempCanvas, 0, 0);
  }

  private renderLegacyHeatmap(
    grid: Float32Array,
    cols: number,
    rows: number,
    cellW: number,
    cellH: number,
    maxCount: number
  ) {
    const max = Math.max(1, maxCount);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const count = grid[idx];
        if (!count) continue;

        const normalizedValue = Math.min(1, count / max);
        const cx = c * cellW + cellW / 2;
        const cy = r * cellH + cellH / 2;

        if (this.options.shape === 'circle') {
          this.ctx.beginPath();
          const radius = this.options.radius ?? Math.min(cellW, cellH) * 0.45;
          this.ctx.fillStyle = getHeatmapColor(normalizedValue, 0.8);
          this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          const w = cellW * 0.9;
          const h = cellH * 0.9;
          this.ctx.fillStyle = getHeatmapColor(normalizedValue, 0.8);
          this.ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        }
      }
    }
  }

  /**
   * Renderiza solo las top N celdas con mayor actividad
   */
  renderTopCells(
    grid: Float32Array,
    cols: number,
    rows: number,
    cellW: number,
    cellH: number,
    maxCount: number,
    topN: number
  ) {
    // Obtener las top N celdas
    const cellsWithIndex = Array.from(grid)
      .map((value, index) => ({ index, value }))
      .filter(cell => cell.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, topN);

    // Crear una grilla temporal solo con las top celdas
    const tempGrid = new Float32Array(grid.length);
    cellsWithIndex.forEach(cell => {
      tempGrid[cell.index] = cell.value;
    });

    // Renderizar usando la grilla filtrada
    this.render(tempGrid, cols, rows, cellW, cellH, maxCount);
  }
}