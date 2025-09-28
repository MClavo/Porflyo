import React, { useRef, useEffect, useCallback, useState } from 'react';

export interface HeatmapItem {
  index: number;
  value: number;
}

export interface HeatmapCanvasProps {
  items: HeatmapItem[];
  columns: number;
  cellHeight: number;
  radius?: number; // pixels
  blur?: number; // not used directly but kept for API parity
  maxValue?: number; // optional, if not provided it will be derived from items
  className?: string;
  style?: React.CSSProperties;
}

const defaultStops = [
  { pos: 0, r: 59, g: 130, b: 246, a: 0.0 },
  { pos: 0.2, r: 59, g: 130, b: 246, a: 0.4 },
  { pos: 0.4, r: 16, g: 185, b: 129, a: 0.6 },
  { pos: 0.6, r: 245, g: 158, b: 11, a: 0.7 },
  { pos: 0.8, r: 239, g: 68, b: 68, a: 0.8 },
  { pos: 1.0, r: 220, g: 38, b: 38, a: 0.9 }
];

const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({
  items,
  columns,
  cellHeight,
  radius = 60,
  blur = 20,
  maxValue,
  className,
  style
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Palette builder
  const createColorPalette = useCallback((stops: { pos: number; r: number; g: number; b: number; a: number }[]) => {
    const palette = new Uint8ClampedArray(256 * 4);
    for (let i = 0; i < 256; i++) {
      const t = i / 255;
      let lower = stops[0];
      let upper = stops[stops.length - 1];
      for (let s = 0; s < stops.length - 1; s++) {
        if (t >= stops[s].pos && t <= stops[s + 1].pos) {
          lower = stops[s];
          upper = stops[s + 1];
          break;
        }
      }
      const span = upper.pos - lower.pos || 1e-6;
      const tt = (t - lower.pos) / span;
      const r = Math.round(lower.r + (upper.r - lower.r) * tt);
      const g = Math.round(lower.g + (upper.g - lower.g) * tt);
      const b = Math.round(lower.b + (upper.b - lower.b) * tt);
      const a = Math.round((lower.a + (upper.a - lower.a) * tt) * 255);
      const idx = i * 4;
      palette[idx] = r;
      palette[idx + 1] = g;
      palette[idx + 2] = b;
      palette[idx + 3] = a;
    }
    return palette;
  }, []);

  // Draw the heatmap on the canvas
  const draw = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // accumulation canvas
    const acc = document.createElement('canvas');
    acc.width = canvas.width;
    acc.height = canvas.height;
    const actx = acc.getContext('2d');
    if (!actx) return;
    actx.clearRect(0, 0, acc.width, acc.height);
    actx.globalCompositeOperation = 'lighter';

  const rScaled = radius * dpr;

  const derivedMax = maxValue ?? Math.max(...items.map(i => Number(i.value) || 0), 1);
    const cellWidth = width / Math.max(1, columns);

  // apply blur filter on accumulation canvas (blur in px)
  actx.filter = `blur(${blur * dpr}px)`;

  // draw each item as a radial white brush into accumulation canvas
    items.forEach(it => {
      const indexNum = Number(it.index);
      if (!Number.isFinite(indexNum)) return;
      const row = Math.floor(indexNum / columns);
      const col = indexNum % columns;
      const x = Math.round(col * cellWidth + cellWidth / 2);
      const y = Math.round(row * cellHeight + cellHeight / 2);

      const intensity = Math.max(0, Math.min(1, Number(it.value) / derivedMax));
      if (intensity <= 0) return;

      const grad = actx.createRadialGradient(x * dpr, y * dpr, 0, x * dpr, y * dpr, rScaled);
      grad.addColorStop(0, `rgba(255,255,255,${Math.min(1, 0.9 * intensity)})`);
      grad.addColorStop(1, `rgba(255,255,255,0)`);
      actx.fillStyle = grad;
      actx.beginPath();
      actx.arc(x * dpr, y * dpr, rScaled, 0, Math.PI * 2);
      actx.fill();
    });

    // reset filter
    actx.filter = 'none';

    // colorize
    const src = actx.getImageData(0, 0, acc.width, acc.height);
    const dst = ctx.createImageData(acc.width, acc.height);
    const palette = createColorPalette(defaultStops);

    for (let i = 0; i < src.data.length; i += 4) {
      const alpha = src.data[i + 3];
      const idx = Math.min(255, alpha);
      const pidx = idx * 4;
      dst.data[i] = palette[pidx];
      dst.data[i + 1] = palette[pidx + 1];
      dst.data[i + 2] = palette[pidx + 2];
      dst.data[i + 3] = Math.round((palette[pidx + 3] / 255) * 255);
    }

    const tmp = document.createElement('canvas');
    tmp.width = acc.width;
    tmp.height = acc.height;
    const tctx = tmp.getContext('2d');
    if (!tctx) return;
    tctx.putImageData(dst, 0, 0);

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tmp, 0, 0, width, height);
  }, [items, columns, cellHeight, radius, maxValue, createColorPalette, blur]);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ width: r.width, height: r.height });
    });
    ro.observe(el);
    // seed initial size
    const r = el.getBoundingClientRect();
    setSize({ width: r.width, height: r.height });
    return () => ro.disconnect();
  }, []);

  // redraw on changes
  useEffect(() => {
    draw();
  }, [draw, size]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10, ...(style || {}) }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default HeatmapCanvas;
