/**
 * Type declarations for heatmap.js
 */

declare module 'heatmap.js' {
  interface HeatmapDataPoint {
    x: number;
    y: number;
    value: number;
  }

  interface HeatmapData {
    max: number;
    data: HeatmapDataPoint[];
  }

  interface HeatmapConfig {
    container: HTMLElement;
    canvas?: HTMLCanvasElement;
    radius?: number;
    maxOpacity?: number;
    minOpacity?: number;
    blur?: number;
    gradient?: Record<string, string>;
  }

  interface HeatmapInstance {
    setData(data: HeatmapData): void;
    addData(data: HeatmapDataPoint | HeatmapDataPoint[]): void;
    getData(): HeatmapData;
    getValueAt(point: { x: number; y: number }): number;
    configure(config: Partial<HeatmapConfig>): void;
  }

  interface HeatmapJS {
    create(config: HeatmapConfig): HeatmapInstance;
  }

  const heatmap: HeatmapJS;
  export default heatmap;
}