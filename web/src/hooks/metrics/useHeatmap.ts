import { useEffect, useRef } from 'react';
import type { HeatmapOptions, HeatmapData, TopCell } from '../../lib/heatmap';
import { HeatmapRenderer, HeatmapGrid } from '../../lib/heatmap';

export function useHeatmap(containerRef: React.RefObject<HTMLElement | null>, opts?: HeatmapOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gridRef = useRef<HeatmapGrid | null>(null);
  const rendererRef = useRef<HeatmapRenderer | null>(null);
  const lastMoveRef = useRef<number>(0);
  const recordingRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const lastDrawRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);
  
  // Store current mouse position for continuous counting
  const currentMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const lastHeatAddRef = useRef<number>(0);
  
  // Store current options in refs to avoid re-initialization
  const currentOptionsRef = useRef<HeatmapOptions>({});

  // Update options ref when opts change
  useEffect(() => {
    const fullOptions = {
      maxCols: 25,
      maxRows: 100,
      cellHeight: 60,
      shape: 'gradient' as const,
      radius: undefined as number | undefined,
      idleMs: 2000,
      drawIntervalMs: 100,
      disabled: false,
      gradientRadius: 30,
      intensity: 1.0,
      ...(opts ?? {}),
    };
    currentOptionsRef.current = fullOptions;

    // Update renderer options if it exists
    if (rendererRef.current) {
      rendererRef.current.updateOptions(fullOptions);
    }
  }, [opts]);

  // Initialize heatmap system once
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isInitializedRef.current) return;
    
    const options = currentOptionsRef.current;
    if (options.disabled) return;

    // ensure container positioned for overlay
    const prevPosition = container.style.position || '';
    if (!prevPosition || prevPosition === 'static') {
      container.style.position = 'relative';
    }

    // create overlay canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '999';
    canvasRef.current = canvas;
    container.appendChild(canvas);

    // initialize renderer
    rendererRef.current = new HeatmapRenderer(canvas, options);

    const resizeAndInitGrid = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      
      // detect the actual content height (scrollable height or visible height)
      const contentHeight = Math.max(container.scrollHeight, rect.height);
      const height = Math.max(1, Math.round(contentHeight));

      // always use fixed number of columns across width
      const cols = Math.max(1, options.maxCols || 25);
      const cellW = width / cols;

      // vertical: compute rows by fixed cellHeight based on actual content height
      const desiredRows = Math.max(1, Math.ceil(height / (options.cellHeight || 60)));
      const rows = Math.min(options.maxRows || 100, desiredRows);
      const cellH = options.cellHeight || 60; // fixed height per cell

      // set canvas pixel size to cover full content area
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // initialize or resize grid
      if (gridRef.current) {
        gridRef.current.resize(cols, rows, cellW, cellH);
      } else {
        gridRef.current = new HeatmapGrid(cols, rows, cellW, cellH);
      }
    };

    resizeAndInitGrid();

    // pointer tracking
    const onPointerMove = (ev: PointerEvent) => {
      if (!gridRef.current) return;

      const rect = container.getBoundingClientRect();
      
      // consider scroll offset within the container
      const scrollLeft = container.scrollLeft || 0;
      const scrollTop = container.scrollTop || 0;
      
      // calculate position relative to container's visible area
      const x = ev.clientX - rect.left + scrollLeft;
      const y = ev.clientY - rect.top + scrollTop;
      
      // check bounds considering scrollable content
      const containerWidth = container.scrollWidth || rect.width;
      const containerHeight = container.scrollHeight || rect.height;
      
      if (x < 0 || y < 0 || x > containerWidth || y > containerHeight) return;

      // Update last move time and position
      lastMoveRef.current = Date.now();
      recordingRef.current = true;
      
      // Store current mouse position for continuous counting
      currentMousePosRef.current = { x, y };

      // Add heat immediately on movement
      gridRef.current.addHeat(x, y);
      lastHeatAddRef.current = Date.now();
    };

    const onPointerLeave = () => {
      // Clear current position when mouse leaves
      currentMousePosRef.current = null;
      recordingRef.current = false;
    };

    window.addEventListener('resize', resizeAndInitGrid);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    // draw loop
    const draw = () => {
      const now = Date.now();
      const currentOptions = currentOptionsRef.current;
      
      // Check if we should continue recording (within idle time)
      if (now - lastMoveRef.current > (currentOptions.idleMs || 2000)) {
        recordingRef.current = false;
        currentMousePosRef.current = null;
      }

      // Continue adding heat while mouse is stationary (but not idle)
      if (recordingRef.current && currentMousePosRef.current && gridRef.current) {
        // Add heat every 150ms while mouse is stationary (less frequent than draw interval)
        if (now - lastHeatAddRef.current >= 150) {
          gridRef.current.addHeat(currentMousePosRef.current.x, currentMousePosRef.current.y);
          lastHeatAddRef.current = now;
        }
      }

      // Render at the normal frequency for smooth visual updates
      if (now - lastDrawRef.current >= (currentOptions.drawIntervalMs || 100)) {
        lastDrawRef.current = now;
        
        if (gridRef.current && rendererRef.current) {
          const grid = gridRef.current.getGrid();
          const { cols, rows, cellWidth, cellHeight } = gridRef.current.getDimensions();
          const maxCount = gridRef.current.getMaxCount();
          
          rendererRef.current.render(grid, cols, rows, cellWidth, cellHeight, maxCount);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    // Mark as initialized
    isInitializedRef.current = true;

    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resizeAndInitGrid);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      if (canvas && canvas.parentElement === container) container.removeChild(canvas);
      canvasRef.current = null;
      gridRef.current = null;
      rendererRef.current = null;
      isInitializedRef.current = false;
      currentMousePosRef.current = null;
      lastHeatAddRef.current = 0;
    };
  }, [containerRef]); // Only depend on container ref

  // API para obtener los datos del heatmap
  const getHeatmapData = (): HeatmapData | null => {
    if (!gridRef.current) return null;
    
    const data = gridRef.current.getData();
    return {
      ...data,
      isRecording: recordingRef.current,
    };
  };

  // API para obtener solo las métricas de las celdas filtradas (índice y valor)
  const getTopCellsMetrics = (topN?: number): { index: number; value: number }[] => {
    if (!gridRef.current) return [];
    
    const grid = gridRef.current.getGrid();
    const activeCells: { index: number; value: number }[] = [];
    
    // Obtener solo las celdas que tienen valor > 0
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] > 0) {
        activeCells.push({ index: i, value: grid[i] });
      }
    }
    
    // Ordenar por valor descendente
    activeCells.sort((a, b) => b.value - a.value);
    
    // Si se especifica topN, limitar los resultados
    if (topN) {
      return activeCells.slice(0, topN);
    }
    
    return activeCells;
  };

  // API para obtener las N celdas con mayor valor
  const getTopCells = (topN: number): TopCell[] => {
    if (!gridRef.current) return [];
    return gridRef.current.getTopCells(topN);
  };

  // Filtrar heatmap para mostrar solo las top N celdas
  const showTopCellsOnly = (topN: number) => {
    if (!gridRef.current) return;
    
    // Usar el método de la grilla que realmente filtra los datos
    gridRef.current.showTopCellsOnly(topN);
  };

  const reset = () => {
    if (gridRef.current) {
      gridRef.current.reset();
    }
    lastMoveRef.current = 0;
    recordingRef.current = false;
    currentMousePosRef.current = null;
    lastHeatAddRef.current = 0;
  };

  return { getHeatmapData, getTopCells, getTopCellsMetrics, showTopCellsOnly, reset };
}

export default useHeatmap;