// Web Worker: handles heat injection and decay (CPU-heavy parts) for DotGrid
// Receives: init, pointerBatch, step messages
// Posts: { type: 'heats', heats: Float32Array } each step

type RawPoint = { x: number; y: number; t: number };

let cols = 0;
let rows = 0;
let spacing = 24;
let influenceRadius = 180;
let heatGain = 0.12;
let speedGain = 0.02;
let speedGamma = 3.2;
let heatDecay = 0.9;

let heats: Float32Array | null = null;

const idxOf = (gx: number, gy: number) => gy * cols + gx;

const injectHeatAt = (cx: number, cy: number, speedPxPerSec: number, dt: number) => {
  if (!heats) return;
  const sp = Math.max(0, speedPxPerSec);
  const sfRaw = Math.tanh(speedGain * sp);
  const speedFactor = Math.pow(sfRaw, Math.max(1, speedGamma));
  const segmentLen = sp * dt;

  const r = influenceRadius, r2 = r * r;
  const gxc = Math.round(cx / spacing), gyc = Math.round(cy / spacing);
  const maxCells = Math.ceil(r / spacing) + 2;
  const len = cols * rows;

  for (let gy = Math.max(0, gyc - maxCells); gy <= Math.min(rows - 1, gyc + maxCells); gy++) {
    for (let gx = Math.max(0, gxc - maxCells); gx <= Math.min(cols - 1, gxc + maxCells); gx++) {
      const i = idxOf(gx, gy);
      if (i < 0 || i >= len) continue;
      const px = gx * spacing, py = gy * spacing;
      const dx = cx - px, dy = cy - py;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      const dist = Math.sqrt(d2);
      const t = Math.max(0, 1 - dist / r);
      const proximity = Math.pow(t, 3);
      const base = (segmentLen / Math.max(1, spacing)) * speedFactor * heatGain;
      const maxAddPerInjection = 0.06;
      const add = Math.min(base * proximity, maxAddPerInjection);
      const next = heats[i] + add;
      heats[i] = next > 1 ? 1 : next;
    }
  }
};

const injectAlongSegment = (prev: RawPoint, curr: RawPoint) => {
  const dx = curr.x - prev.x;
  const dy = curr.y - prev.y;
  const dist = Math.hypot(dx, dy);
  const dt = Math.max(0.0005, (curr.t - prev.t) / 1000);
  const speed = dist / dt;

  const stepPx = Math.max(4, spacing * 0.5);
  const steps = Math.max(1, Math.ceil(dist / stepPx));
  const inv = 1 / steps;
  for (let i = 0; i <= steps; i++) {
    const a = i * inv;
    injectHeatAt(prev.x + dx * a, prev.y + dy * a, speed, dt * inv);
  }
};

onmessage = (ev: MessageEvent) => {
  const msg = ev.data;
  if (!msg || !msg.type) return;
  if (msg.type === 'init') {
    cols = msg.cols; rows = msg.rows; spacing = msg.spacing || spacing;
    influenceRadius = msg.influenceRadius || influenceRadius;
    heatGain = msg.heatGain || heatGain;
    speedGain = msg.speedGain || speedGain;
    speedGamma = msg.speedGamma || speedGamma;
    heatDecay = msg.heatDecay || heatDecay;
    heats = new Float32Array(cols * rows);
  } else if (msg.type === 'pointerBatch') {
    const pts: RawPoint[] = msg.points || [];
    if (pts && pts.length >= 2) {
      let prev = pts[0];
      for (let i = 1; i < pts.length; i++) {
        const cur = pts[i];
        injectAlongSegment(prev, cur);
        prev = cur;
      }
    }
  } else if (msg.type === 'step') {
    const dt = msg.dt || 0.016;
    if (!heats) return;
    const len = heats.length;
    const dec = heatDecay * dt;
    for (let i = 0; i < len; i++) {
      let h = heats[i] - dec;
      if (h < 0) h = 0;
      heats[i] = h;
    }
  // post a copy of heats back to main thread using a transferable ArrayBuffer for efficiency
  const copy = heats.slice();
  // transfer the ArrayBuffer so main thread receives the data without cloning overhead
  // @ts-expect-error - postMessage with transferable ArrayBuffer in a worker
  self.postMessage({ type: 'heats', heats: copy.buffer, cols, rows }, [copy.buffer]);
  }
};
