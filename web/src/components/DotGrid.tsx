// DotGridBackground.tsx
import { useEffect, useRef } from "react";
import { noise2 as utilNoise2, rngPool } from "./dotgridUtils";
import { createDotAndGlow, createStarSprites } from "./dotgrid/sprites";
import { createQualityManager } from "./dotgrid/quality";
import { createOffscreen } from "./dotgrid/offscreen";
import { createParticlePool } from "./dotgrid/particles";
// import world PNG to layer above the star canvas but below UI
import worldImg from "../assets/world3.png";
// worker loader (dynamic import for bundlers that support web workers)
// create Worker via import.meta URL (works with Vite/Rollup)
const createWorker = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - bundler will replace new URL for worker file
    return new Worker(
      new URL("../workers/dotgrid.worker.ts", import.meta.url),
      { type: "module" }
    );
  } catch {
    return null;
  }
};

type RawPoint = { x: number; y: number; t: number };

export default function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const parseCssNumber = (
      raw: string | null | undefined,
      fallback: number
    ): number => {
      if (!raw) return fallback;
      const v = String(raw).trim();
      if (!v) return fallback;
      const m = v.match(/^(-?\d+(?:\.\d+)?)(px)?$/i);
      if (m) return parseFloat(m[1]);
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : fallback;
    };
    const cssNum = (name: string, fallback: number) =>
      parseCssNumber(
        getComputedStyle(document.documentElement).getPropertyValue(name),
        fallback
      );

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ────────────────────────── CSS-driven parameters ──────────────────────────
    let spacing = 24;
    let influenceRadius = 180;
    let maxOffset = 4; // menos desplazamiento para un efecto más suave
    let dotSize = 0.3;
    let heatDecay = 0.9; // color tarda un poco más en apagarse
    let heatGain = 0.12; // muy poco color por movimiento: se necesita esfuerzo
    let speedGain = 0.02; // rango para mapear velocidad (requiere más movimiento)
    let speedGamma = 3.2; // curva más dura para que sólo velocidades altas cuenten
    let proximityGamma = 1.6; // base, but we'll use stronger power in injection
    let colorGamma = 4.0; // todavía más difícil llegar a rojo
    let returnLerp = 0.05; // retorno más lento para fluidizar

    // gloom tuning defaults (overridable via CSS)
    let starGloomProb = 0.06;
    let gloomActivationThreshold = 0.12;

    const readCss = () => {
      spacing = cssNum("--spacing", spacing);
      influenceRadius = cssNum("--influence-radius", influenceRadius);
      maxOffset = cssNum("--max-offset", maxOffset);
      dotSize = cssNum("--dot-size", dotSize);

      heatDecay = cssNum("--heat-decay", heatDecay);
      heatGain = cssNum("--heat-gain", heatGain);
      speedGain = cssNum("--speed-gain", speedGain);
      speedGamma = cssNum("--speed-gamma", speedGamma);
      proximityGamma = cssNum("--proximity-gamma", proximityGamma);
      colorGamma = cssNum("--color-gamma", colorGamma);
      returnLerp = Math.min(
        0.5,
        Math.max(0.001, cssNum("--return-lerp", returnLerp))
      );

      // read star/dot CSS vars
      const style = getComputedStyle(document.documentElement);
      const dotColorRaw = style.getPropertyValue("--dot-color");
      if (dotColorRaw) cssDotColor = dotColorRaw.trim() || cssDotColor;
      cssDotGrowth = cssNum("--dot-growth", cssDotGrowth);
      cssDotBrightnessBase = cssNum(
        "--dot-brightness-base",
        cssDotBrightnessBase
      );
      cssDotBrightnessPeak = cssNum(
        "--dot-brightness-peak",
        cssDotBrightnessPeak
      );
      cssStarProb = Math.max(
        0,
        Math.min(1, cssNum("--star-probability", cssStarProb))
      );
      cssStarLength = cssNum("--star-length", cssStarLength);
      cssStarThickness = cssNum("--star-thickness", cssStarThickness);
      cssStarRotationVar = cssNum(
        "--star-rotation-variance",
        cssStarRotationVar
      );
      cssStarFlickerSpeed = cssNum("--star-flicker-speed", cssStarFlickerSpeed);
      cssStarActivationThreshold = cssNum(
        "--star-activation-threshold",
        cssStarActivationThreshold
      );
      cssStarAnimLerp = Math.max(
        0.001,
        Math.min(0.5, cssNum("--star-anim-lerp", cssStarAnimLerp))
      );
      cssStarSelectionSpeed = Math.max(
        0,
        cssNum("--star-selection-speed", cssStarSelectionSpeed)
      );
      // parallax / bloom tuning
      parallaxCenterStrength = cssNum(
        "--parallax-center-strength",
        parallaxCenterStrength
      );
      parallaxNearMult = cssNum("--parallax-near-mult", parallaxNearMult);
      bloomAlpha = Math.max(
        0,
        Math.min(1, cssNum("--bloom-alpha", bloomAlpha))
      );
      bloomDownscale = Math.max(
        2,
        Math.floor(cssNum("--bloom-downscale", bloomDownscale))
      );
      bloomSizeMult = Math.max(0.5, cssNum("--bloom-size-mult", bloomSizeMult));
      bloomFade = Math.max(0, Math.min(1, cssNum("--bloom-fade", bloomFade)));
      // gloom tuning
      const starGloomDefault = 0.06;
      const gloomActDefault = 0.12;
      starGloomProb = Math.max(
        0,
        Math.min(1, cssNum("--star-gloom-prob", starGloomDefault))
      );
      gloomActivationThreshold = Math.max(
        0,
        cssNum("--gloom-activation-threshold", gloomActDefault)
      );
    };

    // ────────────────────────── Grid state ──────────────────────────
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let width = 1,
      height = 1;
    let cols = 0,
      rows = 0;

    // ────────────────────────── Flow / temporal evolution ──────────────────────────
    let flowTime = 0;
    let flowTimeScale = 0.002; // smaller = slower temporal evolution

    // ────────────────────────── Per-point buffers ──────────────────────────
    let heats = new Float32Array(0);
    let dispX = new Float32Array(0); // posición mostrada (con amortiguación)
    let dispY = new Float32Array(0);
    // per-point randomness / animation
    let pointSeed: Float32Array;
    let pointRot: Float32Array;
    let pointFlickPhase: Float32Array;
    let pointFlickSpeed: Float32Array;
    let activations: Float32Array;

    // ────────────────────────── Layers, particles and bloom ──────────────────────────
    const layersCount = 3;
    // create a small particle pool helper
    const particles = createParticlePool(800);
    // offscreen buffers helper (glow canvas + bloom buffer)
    const offscreen = createOffscreen();
    // precomputed base positions to avoid recomputing gx*spacing inside hot loops
    let baseXArr: Float32Array | null = null;
    let baseYArr: Float32Array | null = null;

    // ────────────────────────── Prerendered sprites (built at resize / CSS change) ──────────────────────────
    let dotSprite: HTMLCanvasElement | null = null;
    let glowSprite: HTMLCanvasElement | null = null;
    let starSprites: HTMLCanvasElement[] = [];

    // interactive modes removed: always use normal

    // reuse optimized implementations
    const noise2 = utilNoise2;
    // worker state
    let worker: Worker | null = null;

    // Quality manager provided by module

    // particle push handled by particle pool helper

    const idxOf = (gx: number, gy: number) => gy * cols + gx;

    // build sprites via helpers
    const qualityMgr = createQualityManager(3);

    // ── Capa interior: parámetros
    let innerOffsetMax = 0.18; // fraction of distance-to-center
    let innerDotSize = 0.6;
    let innerHue = 200;
    let innerSat = 36;
    let innerLight = 36;
    let innerOpacity = 0.55;
    let innerPower = 2.6;
    let innerMouseStrength = 0.06; // how strongly inner points follow the mouse

    // star / mini-point params (defaults; overridable via CSS)
    let cssDotColor = "#6199c4";
    let cssDotGrowth = 1.0;
    let cssDotBrightnessBase = 0.35;
    let cssDotBrightnessPeak = 1.0;
    let cssStarProb = 0.22;
    let cssStarLength = 4;
    let cssStarThickness = 1.0;
    let cssStarRotationVar = 0.9;
    let cssStarFlickerSpeed = 6.0;
    let cssStarActivationThreshold = 0.03;
    let cssStarAnimLerp = 0.06;
    let cssStarSelectionSpeed = 0.02;
    // parallax / bloom tuning defaults (overridable via CSS)
    let parallaxCenterStrength = 0.02;
    let parallaxNearMult = 0.22;
    let bloomAlpha = 0.45;
    let bloomDownscale = 8;
    let bloomSizeMult = 2.8;
    let bloomFade = 0.06; // 0..1 smaller = more persistence for glow buffer

    // ratón (suavizado para visual) + cola cruda para física
    const displayMouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const displayTarget = { x: displayMouse.x, y: displayMouse.y };
    const smoothFactor = 0.16;
    // pointer tracking to compute true movement velocity
    const lastPointerPos = { x: displayMouse.x, y: displayMouse.y };
    let lastPointerMoveTime = 0; // ms

    const rawQueue: RawPoint[] = [];
    const pushRaw = (x: number, y: number, t: number) => {
      rawQueue.push({ x, y, t });
      if (rawQueue.length > 4096) rawQueue.splice(0, rawQueue.length - 2048);
    };
    // lastRawTime removed; worker batches use timestamps in RawPoint entries

    // color helpers removed: points no longer change color by heat; color controlled with CSS

    // resize
    const resize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      readCss();

      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;

      heats = new Float32Array(cols * rows);
      dispX = new Float32Array(cols * rows);
      dispY = new Float32Array(cols * rows);
      pointSeed = new Float32Array(cols * rows);
      pointRot = new Float32Array(cols * rows);
      pointFlickPhase = new Float32Array(cols * rows);
      pointFlickSpeed = new Float32Array(cols * rows);
      activations = new Float32Array(cols * rows);

      // allocate/reuse base position buffers
      baseXArr = new Float32Array(cols * rows);
      baseYArr = new Float32Array(cols * rows);

      // inicializamos posiciones mostradas en el grid base
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const i = idxOf(gx, gy);
          const bx = gx * spacing;
          const by = gy * spacing;
          dispX[i] = bx;
          dispY[i] = by;
          baseXArr[i] = bx;
          baseYArr[i] = by;
          // seeded randomness per point
          const s = Math.abs(Math.sin(i * 127.1) * 43758.5453) % 1;
          pointSeed[i] = s;
          pointRot[i] = (s - 0.5) * Math.PI * 0.9;
          pointFlickPhase[i] = s * Math.PI * 2;
          pointFlickSpeed[i] = 0.5 + s * 1.5; // per-point flicker speed multiplier
          activations[i] = 0; // current displayed activation (lerped)
        }
      }

      // leer variables de la capa interior en resize (para DPI y cambios dinámicos)
      innerOffsetMax = Math.max(
        0,
        Math.min(1, cssNum("--inner-offset-max", innerOffsetMax))
      );
      innerDotSize = cssNum("--inner-dot-size", innerDotSize);
      innerHue = cssNum("--inner-hue", innerHue);
      innerSat = cssNum("--inner-saturation", innerSat);
      innerLight = cssNum("--inner-lightness", innerLight);
      innerOpacity = Math.max(
        0,
        Math.min(1, cssNum("--inner-opacity", innerOpacity))
      );
      innerPower = Math.max(0.1, cssNum("--inner-power", innerPower));
      innerMouseStrength = Math.max(
        0,
        cssNum("--inner-mouse-strength", innerMouseStrength)
      );
      // ensure offscreen buffers are sized
      offscreen.ensureSize(dpr, width, height);
      // rebuild sprites for current DPI / css using shared helpers
      const sprites = createDotAndGlow(
        dotSize,
        cssDotColor,
        bloomSizeMult,
        dpr
      );
      dotSprite = sprites.dotSprite;
      glowSprite = sprites.glowSprite;
      starSprites = createStarSprites(dpr);
    };
    resize();

    // start worker (Vite-compatible) and initialize it; fallback silently if creation fails
    worker = createWorker();
    if (worker) {
      worker.postMessage({
        type: "init",
        cols,
        rows,
        spacing,
        influenceRadius,
        heatGain,
        speedGain,
        speedGamma,
        heatDecay,
      });
      worker.onmessage = (ev: MessageEvent) => {
        const m = ev.data as unknown;
        if (typeof m === "object" && m !== null) {
          const mm = m as { type?: string; heats?: ArrayBuffer };
          if (mm.type === "heats" && mm.heats instanceof ArrayBuffer) {
            heats = new Float32Array(mm.heats);
          }
        }
      };
    }

    // inyección (sutil y monotónica con velocidad)
    const injectHeatAt = (
      cx: number,
      cy: number,
      speedPxPerSec: number,
      dt: number
    ) => {
      const sp = Math.max(0, speedPxPerSec);

      // Map speed -> [0..1], emphasize high speeds so fast motion produces more heat
      // map speed -> [0..1], but make it strongly nonlinear so small speeds produce very little heat
      const sfRaw = Math.tanh(speedGain * sp);
      const speedFactor = Math.pow(sfRaw, Math.max(1, speedGamma));

      // use distance traveled in this injection (speed * dt) so sampling rate doesn't invert effect
      const segmentLen = sp * dt; // pixels covered by this injection

      const r = influenceRadius,
        r2 = r * r;
      const gxc = Math.round(cx / spacing),
        gyc = Math.round(cy / spacing);
      const maxCells = Math.ceil(r / spacing) + 2;

      for (
        let gy = Math.max(0, gyc - maxCells);
        gy <= Math.min(rows - 1, gyc + maxCells);
        gy++
      ) {
        for (
          let gx = Math.max(0, gxc - maxCells);
          gx <= Math.min(cols - 1, gxc + maxCells);
          gx++
        ) {
          const i = idxOf(gx, gy);
          const px = gx * spacing,
            py = gy * spacing;

          const dx = cx - px,
            dy = cy - py;
          const d2 = dx * dx + dy * dy;
          if (d2 > r2) continue;

          const dist = Math.sqrt(d2);
          const t = Math.max(0, 1 - dist / r);
          // influencia muy localizada: potencia 3 (casi nula a medias distancias)
          const proximity = Math.pow(t, 3);

          // normalize segmentLen by spacing so overall scale stays reasonable
          const base =
            (segmentLen / Math.max(1, spacing)) * speedFactor * heatGain;
          // cap por inyección para que un único evento no ponga el punto al máximo
          const maxAddPerInjection = 0.06;
          const add = Math.min(base * proximity, maxAddPerInjection);
          const next = heats[i] + add;
          heats[i] = next > 1 ? 1 : next;
        }
      }

      // ensure offscreen glow canvas is present (will be sized in resize())
      // clear glow for this injection; callers rely on offscreen.fadeGlow after a frame
      const g = offscreen.getGlowCanvas();
      if (g) {
        const gc = g.getContext("2d");
        if (gc) {
          gc.setTransform(dpr, 0, 0, dpr, 0, 0);
          gc.clearRect(0, 0, width, height);
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

    // frame counter for temporal thinning
    let frameCount = 0;

    // dibujo con amortiguación de offset (retorno lento)
    const drawPoints = () => {
      ctx.clearRect(0, 0, width, height);

      const r = influenceRadius;
      const EPS = 1e-4;
      const nowMs = performance.now();
      const nowS = nowMs / 1000;
      const heatsLoc = heats;
      const dispXLoc = dispX;
      const dispYLoc = dispY;
      const seedLoc = pointSeed;
      const flickPhaseLoc = pointFlickPhase;
      const flickSpeedLoc = pointFlickSpeed;

      const localRows = rows;
      const localCols = cols;
      const q = qualityMgr.level;
      const skipEvery = q >= 3 ? 1 : q === 2 ? 1 : 2;
      const perFrameLayerMask = (layer: number) =>
        skipEvery === 1 ? true : ((frameCount + layer) & 1) === 0;

      for (let gy = 0; gy < localRows; gy++) {
        const baseY = gy * spacing;
        for (let gx = 0; gx < localCols; gx++) {
          const i = idxOf(gx, gy);

          const layer = Math.floor(pointSeed[i] * layersCount);
          if (!perFrameLayerMask(layer)) continue;

          const baseX = gx * spacing;

          // mouse attraction
          const dxm = displayMouse.x - baseX;
          const dym = displayMouse.y - baseY;
          const dist = Math.hypot(dxm, dym);

          let targetX = baseX;
          let targetY = baseY;

          if (dist > EPS && dist < r) {
            const t = 1 - dist / r;
            const force = Math.pow(t, 2) * maxOffset;
            const nx = dxm / dist,
              ny = dym / dist;
            const layerFactor = layersCount > 1 ? layer / (layersCount - 1) : 0;
            const depth = 1 - layerFactor;
            const parallax = 0.06 + depth * 0.22;
            targetX = baseX + nx * force * (1 + parallax);
            targetY = baseY + ny * force * (1 + parallax);
          }

          // organic flow
          const flowScale = 0.006;
          const f = noise2(
            baseX * flowScale + flowTime,
            baseY * flowScale + flowTime
          );
          const angle = f * Math.PI * 2;
          const depth = 1 - (layersCount > 1 ? layer / (layersCount - 1) : 0);
          const flowBase = 8.0;
          const flowStrength = flowBase * (0.4 + depth * 1.0);
          targetX += Math.cos(angle) * flowStrength * 0.6;
          targetY += Math.sin(angle) * flowStrength * 0.6;

          // parallax center offset
          targetX +=
            (displayMouse.x - width / 2) * (parallaxCenterStrength * depth);
          targetY +=
            (displayMouse.y - height / 2) * (parallaxCenterStrength * depth);

          // lerp shown position
          dispXLoc[i] += (targetX - dispXLoc[i]) * returnLerp;
          dispYLoc[i] += (targetY - dispYLoc[i]) * returnLerp;

          const mx = displayMouse.x - baseX;
          const my = displayMouse.y - baseY;
          const md = Math.hypot(mx, my);
          const nearFactor =
            md < influenceRadius ? 1 - md / influenceRadius : 0;
          const proxPow = Math.pow(nearFactor, Math.max(1.0, proximityGamma));
          const shown = Math.max(heatsLoc[i], proxPow * 0.28);

          // draw using sprites
          if (dotSprite) {
            const alpha = 0.32 + shown * 0.48;
            if (alpha > 0.01) {
              ctx.globalAlpha = alpha;
              const ds = dotSprite;
              const hw = ds.width / dpr / 2;
              const hh = ds.height / dpr / 2;
              ctx.drawImage(
                ds,
                dispXLoc[i] - hw,
                dispYLoc[i] - hh,
                hw * 2,
                hh * 2
              );
              ctx.globalAlpha = 1;
            }
          }

          // ────────────────────────── Glow: write into offscreen buffer if needed ──────────────────────────
          const selectorSpeed = cssStarSelectionSpeed;
          const selector =
            (seedLoc[i] + nowS * selectorSpeed * flickSpeedLoc[i]) % 1;
          const shouldGlow =
            shown > gloomActivationThreshold ||
            (shown > cssStarActivationThreshold && selector < starGloomProb);
          if (glowSprite && shouldGlow) {
            const gAlpha = Math.min(0.9, 0.25 + shown * 0.75);
            if (gAlpha > 0.02) {
              offscreen.drawGlow(
                glowSprite,
                dispXLoc[i],
                dispYLoc[i],
                gAlpha,
                dpr
              );
            }
          }

          // star tips: keep DotGrid selection logic but render using starSprites from DotGrid2
          const showStar =
            shown > cssStarActivationThreshold && selector < cssStarProb;
          if (showStar && starSprites.length > 0) {
            const flick =
              0.6 +
              0.4 *
                Math.sin(
                  flickPhaseLoc[i] +
                    nowS * cssStarFlickerSpeed * flickSpeedLoc[i]
                );
            const seed = seedLoc[i];
            const sizeIndex: 0 | 1 | 2 = seed < 0.6 ? 0 : seed < 0.9 ? 1 : 2;
            const spr = starSprites[sizeIndex] || starSprites[0];
            const alphaStar = Math.min(1, (0.6 + shown * 0.8) * flick);
            ctx.globalAlpha = alphaStar;
            const sw = spr.width / dpr;
            const sh = spr.height / dpr;
            ctx.drawImage(
              spr,
              dispXLoc[i] - sw / 2,
              dispYLoc[i] - sh / 2,
              sw,
              sh
            );
            ctx.globalAlpha = 1;
          }
        }
      }

      // dibujar capa interior desplazada hacia el centro
      drawInnerLayer();

      // ────────────────────────── Bloom: composite offscreen glow with additive blend ──────────────────────────
      const gcanvas = offscreen.getGlowCanvas();
      if (gcanvas) {
        offscreen.renderBloomTo(ctx, width, height, bloomDownscale, bloomAlpha);
        offscreen.fadeGlow(bloomFade, width, height);
      }

      // draw mode label
      // no mode label; only normal behavior
    };
    const drawInnerLayer = () => {
      ctx.save();
      ctx.globalAlpha = innerOpacity;
      const cx = width / 2;
      const cy = height / 2;

      // recorre la rejilla y dibuja un punto adicional ligeramente desplazado hacia el centro
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const i = idxOf(gx, gy);
          const x = baseXArr ? baseXArr[i] : gx * spacing;
          const y = baseYArr ? baseYArr[i] : gy * spacing;

          const dx = cx - x;
          const dy = cy - y;
          // desplazamiento constante para todos los puntos: un poco hacia el centro
          const factor = innerOffsetMax;
          let ix = x + dx * factor;
          let iy = y + dy * factor;

          // añadir una sutil atracción hacia el puntero si está dentro del influenceRadius
          const mdx = displayMouse.x - x;
          const mdy = displayMouse.y - y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < influenceRadius && innerMouseStrength > 0) {
            const mf =
              innerMouseStrength * Math.pow(1 - mdist / influenceRadius, 2);
            ix += mdx * mf;
            iy += mdy * mf;
          }

          ctx.beginPath();
          ctx.arc(ix, iy, innerDotSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${innerHue}, ${innerSat}%, ${innerLight}%)`;
          ctx.fill();
        }
      }
      flowTimeScale = Math.max(0, cssNum("--flow-time-scale", flowTimeScale));
      ctx.restore();
    };

    // loop
    let lastFrameT = performance.now();
    let rafId = 0;
    const animate = () => {
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameT) / 1000));
      lastFrameT = now;

      // advance flow time (slower evolution controlled by CSS var)
      flowTime += dt * flowTimeScale;

      // procesa trayectoria cruda
      if (rawQueue.length >= 2) {
        let prev = rawQueue[0];
        for (let i = 1; i < rawQueue.length; i++) {
          const curr = rawQueue[i];
          injectAlongSegment(prev, curr);
          prev = curr;
        }
        rawQueue.splice(0, rawQueue.length - 1);
      }

      // decaimiento del color: offload to worker when available
      if (worker) {
        try {
          worker.postMessage({ type: "step", dt });
        } catch {
          /* ignore */
        }
      } else if (heatDecay > 0) {
        const dec = heatDecay * dt;
        for (let i = 0; i < heats.length; i++) {
          const h = heats[i] - dec;
          heats[i] = h > 0 ? h : 0;
        }
      }

      // ────────────────────────── Step particles: simple physics, decay and feed heats ──────────────────────────
      const nowMs = performance.now();
      const pointerIdle = nowMs - lastPointerMoveTime > 120; // ms threshold
      // step particles using particle pool helper
      particles.step(dt, pointerIdle ? 0.6 : 0.98, injectHeatAt);

      // suavizado del ratón para la atracción visual
      displayMouse.x += (displayTarget.x - displayMouse.x) * smoothFactor;
      displayMouse.y += (displayTarget.y - displayMouse.y) * smoothFactor;
      // measure draw time for quality manager
      const t0 = performance.now();
      drawPoints();
      const frameMs = performance.now() - t0;
      try {
        qualityMgr.update(frameMs);
      } catch {
        /* ignore */
      }
      frameCount++;
      rafId = requestAnimationFrame(animate);
    };

    // eventos
    // accumulate raw events and send batches to worker if available
    let lastBatchSent = 0;
    const batchInterval = 32; // ms
    const onPointerMove = (e: PointerEvent) => {
      displayTarget.x = e.clientX;
      displayTarget.y = e.clientY;

      const now = performance.now();
      const list = (e.getCoalescedEvents && e.getCoalescedEvents()) || null;

      if (list && list.length > 0) {
        for (let i = 0; i < list.length; i++) {
          const ce = list[i] as PointerEvent;
          pushRaw(ce.clientX, ce.clientY, now);
          const dx = ce.clientX - lastPointerPos.x;
          const dy = ce.clientY - lastPointerPos.y;
          const rv = rngPool.nextUnit() - 0.5;
          const rv2 = rngPool.nextUnit() - 0.5;
          const vx = dx * 0.6 + rv * 0.8;
          const vy = dy * 0.6 + rv2 * 0.8;
          particles.push(ce.clientX, ce.clientY, vx, vy, 1 + rv * 0.8);
          lastPointerPos.x = ce.clientX;
          lastPointerPos.y = ce.clientY;
          lastPointerMoveTime = performance.now();
        }
      } else {
        pushRaw(e.clientX, e.clientY, now);
        const dx = e.clientX - lastPointerPos.x;
        const dy = e.clientY - lastPointerPos.y;
        const small = Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5;
        const vx = small ? 0 : dx * 0.6 + (rngPool.nextUnit() - 0.5) * 0.8;
        const vy = small ? 0 : dy * 0.6 + (rngPool.nextUnit() - 0.5) * 0.8;
        particles.push(
          e.clientX,
          e.clientY,
          vx,
          vy,
          1 + (rngPool.nextUnit() - 0.5) * 0.8
        );
        lastPointerPos.x = e.clientX;
        lastPointerPos.y = e.clientY;
        lastPointerMoveTime = performance.now();
      }

      // throttle sending batches to worker
      if (worker && performance.now() - lastBatchSent > batchInterval) {
        // send current rawQueue as a batch and clear older ones
        const send = rawQueue.slice();
        try {
          const transferable = send.map((p) => ({ x: p.x, y: p.y, t: p.t }));
          worker.postMessage({ type: "pointerBatch", points: transferable });
        } catch {
          // ignore worker send errors
        }
        // keep only last raw point to continue continuity
        if (rawQueue.length > 0) rawQueue.splice(0, rawQueue.length - 1);
        lastBatchSent = performance.now();
      }
    };

    const onResize = () => resize();

    // pointer down/up handlers removed: clicks are ignored

    const mo = new MutationObserver(() => readCss());
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style", "class"],
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);

    animate();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      mo.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          background: "black",
          zIndex: -1,
        }}
      />
      {/* world PNG: sits above canvas (stars) because it's later in DOM with same zIndex, but still below page UI */}
      <img
        src={worldImg}
        alt="world"
        style={{
          position: "fixed",
          left: "50%",
          top: "100%", // lowered substantially so the globe sits much lower on the page
          transform: "translate(-50%, -50%)",
          /* use viewport width to ensure large coverage on 4K displays */
          width: "140vw",
          height: "auto",
          maxWidth: "none",
          pointerEvents: "none",
          zIndex: -1,
          mixBlendMode: "normal",
          opacity: 1,
        }}
      />
    </>
  );
}
