// DotGridBackground.tsx — PERFORMANCE OPTIMIZED
import { useEffect, useRef } from "react";
import { noise2 as utilNoise2 } from "./dotgridUtils";
import worldImg from "../assets/world3.png";

/**
 * Cambios clave:
 * - Sprite prerenderizado para puntos y glow (drawImage en vez de ctx.arc por punto).
 * - QualityManager con degradación automática por tiempo de frame (target ~16.7ms, cae a 30fps si hace falta).
 * - RandomPool (evita Math.random() en hot path).
 * - Menos estados globales, menos setTransform por frame, menos lecturas de CSS.
 * - Temporal thinning: los puntos lejanos/layers altos se dibujan en frames alternos.
 * - Bloom barato adaptativo con buffer reutilizable y escalado variable.
 * - Menos features: quito partículas y cruces de estrellas (opcionalmente reactivables si la calidad lo permite).
 */

type RawPoint = { x: number; y: number; t: number };

export default function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // ────────────────────────── Utils ──────────────────────────
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

    // Random pool para evitar Math.random() en hot path
    const RAND_POOL_SIZE = 8192;
    const randPool = new Float32Array(RAND_POOL_SIZE);
    const refillRand = () => {
      for (let i = 0; i < RAND_POOL_SIZE; i++) {
        // LCG simple, determinista por frame para coherencia visual
        // pero aquí usamos Math.random() una vez por refill (no por punto)
        randPool[i] = Math.random();
      }
    };
    refillRand();

    // ────────────────────────── Setup canvas ──────────────────────────
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ────────────────────────── Params (conservadores + CSS overrides) ──────────────────────────
    // Geometría/estética
    let spacing = 14; // un poco más grande para bajar N de puntos
    let influenceRadius = 160;
    let maxOffset = 3.5;
    let dotSize = 0.1;
    // Flow
    let flowTime = 0;
    let flowTimeScale = 0.0018; // evolución más lenta
    const noise2 = utilNoise2;
    // Apariencia
    let cssDotColor = "#6aa0cc";
    let parallaxCenterStrength = 0.015;
    // Bloom
    let bloomAlpha = 0.38;
    let bloomDownscale = 10; // más agresivo por defecto
    let bloomSizeMult = 2.4;
    let bloomFade = 0.08;
    // Heat
    let heatDecay = 0.88;
    let heatGain = 0.1;
    let speedGain = 0.018;
    let speedGamma = 3.0;
    let proximityGamma = 1.8;
    let returnLerp = 0.045;

    // ────────────────────────── Stars (ADD) ──────────────────────────
    type Star = {
      x: number;
      y: number;
      depth: number; // 0(far) .. 1(near)
      size: 0 | 1 | 2; // tiny/small/medium
      phase: number; // 0..2π
      speed: number; // twinkle speed factor
    };
    let stars: Star[] = [];
    let starSprites: HTMLCanvasElement[] = []; // [tiny, small, medium]

    // Capas (parallax)
    const layersCount = 3;

    // Calidad dinámica
    const Quality = {
      level: 3 as 0 | 1 | 2 | 3, // 3=alto, 0=mínimo
      targetMs: 16.7,
      ema: 16.7,
      update(sampleMs: number) {
        // EMA suave
        this.ema = this.ema * 0.9 + sampleMs * 0.1;
        // Auto degradación/mejora
        if (this.ema > 22 && this.level > 0) this.level--;
        else if (this.ema < 14 && this.level < 3) this.level++;
      },
    };

    // ────────────────────────── Estado de la rejilla ──────────────────────────
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let width = 1,
      height = 1;
    let cols = 0,
      rows = 0;

    let heats = new Float32Array(0);
    let dispX = new Float32Array(0);
    let dispY = new Float32Array(0);
    let pointSeed = new Float32Array(0);

    // Base positions (precomputadas)
    let baseXArr = new Float32Array(0);
    let baseYArr = new Float32Array(0);

    // Offscreen glow buffer + bloom buffer
    let glowCanvas: HTMLCanvasElement | null = null;
    let glowCtx: CanvasRenderingContext2D | null = null;
    let bloomBuffer: HTMLCanvasElement | null = null;

    // Sprites pre-renderizados
    let dotSprite: HTMLCanvasElement | null = null;
    let glowSprite: HTMLCanvasElement | null = null;

    // Puntero (suavizado)
    const displayMouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const displayTarget = { x: displayMouse.x, y: displayMouse.y };
    const smoothFactor = 0.18;

    // Input crudo para velocidad real
    const rawQueue: RawPoint[] = [];
    const pushRaw = (x: number, y: number, t: number) => {
      rawQueue.push({ x, y, t });
      if (rawQueue.length > 2048) rawQueue.splice(0, rawQueue.length - 1024);
    };
    let lastRawTime = performance.now();
    const lastPointerPos = { x: displayMouse.x, y: displayMouse.y };

    // Lectura de CSS (solo en resize/mutación)
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
      returnLerp = Math.min(
        0.5,
        Math.max(0.001, cssNum("--return-lerp", returnLerp))
      );

      const style = getComputedStyle(document.documentElement);
      const dotColorRaw = style.getPropertyValue("--dot-color");
      if (dotColorRaw) cssDotColor = dotColorRaw.trim() || cssDotColor;

      parallaxCenterStrength = cssNum(
        "--parallax-center-strength",
        parallaxCenterStrength
      );
      bloomAlpha = Math.max(
        0,
        Math.min(1, cssNum("--bloom-alpha", bloomAlpha))
      );
      bloomDownscale = Math.max(
        6,
        Math.floor(cssNum("--bloom-downscale", bloomDownscale))
      );
      bloomSizeMult = Math.max(1.6, cssNum("--bloom-size-mult", bloomSizeMult));
      bloomFade = Math.max(0, Math.min(1, cssNum("--bloom-fade", bloomFade)));
      flowTimeScale = Math.max(0, cssNum("--flow-time-scale", flowTimeScale));
    };

    // Sprites: punto y glow prerenderizados a dpr actual
    const buildSprites = () => {
      const realDot = Math.max(0.15, dotSize);
      const px = Math.ceil(realDot * 3 * dpr);
      const size = Math.max(4, px * 2 + 2);

      // Dot
      dotSprite = document.createElement("canvas");
      dotSprite.width = size;
      dotSprite.height = size;
      const dctx = dotSprite.getContext("2d")!;
      dctx.setTransform(1, 0, 0, 1, 0, 0);
      dctx.clearRect(0, 0, size, size);
      dctx.beginPath();
      dctx.arc(size / 2, size / 2, px, 0, Math.PI * 2);
      dctx.fillStyle = cssDotColor;
      dctx.globalAlpha = 1;
      dctx.fill();

      // Glow (más grande)
      const gpx = Math.ceil(realDot * bloomSizeMult * 3 * dpr);
      const gsize = Math.max(size, gpx * 2 + 2);
      glowSprite = document.createElement("canvas");
      glowSprite.width = gsize;
      glowSprite.height = gsize;
      const gctx = glowSprite.getContext("2d")!;
      const grad = gctx.createRadialGradient(
        gsize / 2,
        gsize / 2,
        0,
        gsize / 2,
        gsize / 2,
        gpx
      );
      // grad suave sin saturar
      grad.addColorStop(0, cssDotColor);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      gctx.fillStyle = grad;
      gctx.beginPath();
      gctx.arc(gsize / 2, gsize / 2, gpx, 0, Math.PI * 2);
      gctx.fill();
    };

    const buildStarSprites = () => {
      starSprites = [];
      // tamaños en píxeles * dpr (muy pequeños!)
      const basePx = [1, 1.4, 2].map((v) => Math.max(0.35, v) * dpr);

      for (let s = 0; s < basePx.length; s++) {
        const px = basePx[s];
        const size = Math.max(6, Math.ceil(px * 10)); // lienzo pequeño
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        const g = c.getContext("2d")!;
        g.clearRect(0, 0, size, size);

        // Glow radial
        const r = px * 4;
        const grad = g.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          r
        );
        grad.addColorStop(0, "rgba(180,200,255,0.95)");
        grad.addColorStop(0.4, "rgba(150,190,255,0.45)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grad;
        g.beginPath();
        g.arc(size / 2, size / 2, r, 0, Math.PI * 2);
        g.fill();

        // Cross flare fino (2 líneas, 4 brazos al rotar 90º)
        g.globalAlpha = 0.65;
        g.lineWidth = Math.max(1, Math.round(dpr * 0.6));
        g.strokeStyle = "rgba(200,220,255,0.85)";
        // horizontal
        g.beginPath();
        g.moveTo(size * 0.15, size / 2);
        g.lineTo(size * 0.85, size / 2);
        g.stroke();
        // vertical
        g.beginPath();
        g.moveTo(size / 2, size * 0.15);
        g.lineTo(size / 2, size * 0.85);
        g.stroke();

        // núcleo
        g.globalAlpha = 1;
        g.fillStyle = "rgba(230,240,255,0.95)";
        g.beginPath();
        g.arc(size / 2, size / 2, Math.max(0.9, px * 0.9), 0, Math.PI * 2);
        g.fill();

        starSprites.push(c);
      }
    };

    const idxOf = (gx: number, gy: number) => gy * cols + gx;

    const resize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      width = Math.max(1, Math.floor(window.innerWidth));
      height = Math.max(1, Math.floor(window.innerHeight));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      readCss();

      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;

      const n = cols * rows;
      heats = new Float32Array(n);
      dispX = new Float32Array(n);
      dispY = new Float32Array(n);
      pointSeed = new Float32Array(n);
      baseXArr = new Float32Array(n);
      baseYArr = new Float32Array(n);

      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const i = idxOf(gx, gy);
          const bx = gx * spacing;
          const by = gy * spacing;
          baseXArr[i] = dispX[i] = bx;
          baseYArr[i] = dispY[i] = by;

          // per-point seed determinista rápido (sin trig)
          const s = ((i * 1103515245 + 12345) >>> 0) / 0xffffffff;
          pointSeed[i] = s;
        }
      }

      // Glow/bloom buffers
      if (!glowCanvas) glowCanvas = document.createElement("canvas");
      glowCanvas.width = canvas.width;
      glowCanvas.height = canvas.height;
      glowCanvas.style.width = canvas.style.width;
      glowCanvas.style.height = canvas.style.height;
      glowCtx = glowCanvas.getContext("2d");
      if (glowCtx) glowCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!bloomBuffer) bloomBuffer = document.createElement("canvas");

      buildSprites();
      // ────────────────────────── Stars build (ADD) ──────────────────────────
      buildStarSprites();
      // densidad según área y calidad base
      const area = width * height;
      // ~1 estrella por 13–18k px en alta, menos en baja
      const baseDensity =
        1 / (Quality.level >= 3 ? 14000 : Quality.level === 2 ? 17000 : 24000);
      const count = Math.max(20, Math.floor(area * baseDensity));
      // Recreate list
      stars = new Array(count);
      for (let i = 0; i < count; i++) {
        const depth = Math.random(); // 0..1  (0 = muy lejos => menos parallax, menos brillo)
        const sizeRand = Math.random();
        const size: 0 | 1 | 2 = sizeRand < 0.55 ? 0 : sizeRand < 0.88 ? 1 : 2;
        stars[i] = {
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          size,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.4,
        };
      }
    };
    resize();

    // ────────────────────────── Inyección sutil por movimiento ──────────────────────────
    const injectHeatAt = (
      cx: number,
      cy: number,
      speedPxPerSec: number,
      dt: number
    ) => {
      const sp = Math.max(0, speedPxPerSec);
      const sfRaw = Math.tanh(speedGain * sp);
      const speedFactor = Math.pow(sfRaw, Math.max(1, speedGamma));
      const segmentLen = sp * dt;

      const r = influenceRadius,
        r2 = r * r;
      const gxc = Math.round(cx / spacing),
        gyc = Math.round(cy / spacing);
      const maxCells = Math.ceil(r / spacing) + 1;

      for (
        let gy = Math.max(0, gyc - maxCells);
        gy <= Math.min(rows - 1, gyc + maxCells);
        gy++
      ) {
        const by = gy * spacing;
        for (
          let gx = Math.max(0, gxc - maxCells);
          gx <= Math.min(cols - 1, gxc + maxCells);
          gx++
        ) {
          const i = idxOf(gx, gy);
          const bx = gx * spacing;
          const dx = cx - bx,
            dy = cy - by;
          const d2 = dx * dx + dy * dy;
          if (d2 > r2) continue;

          const dist = Math.sqrt(d2);
          const t = 1 - dist / r;
          const proximity = t * t * t;
          const base =
            (segmentLen / Math.max(1, spacing)) * speedFactor * heatGain;
          const add = Math.min(base * proximity, 0.05);
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

      // Pasos espaciados: no inyectamos por cada píxel
      const stepPx = Math.max(6, spacing * 0.7);
      const steps = Math.max(1, Math.ceil(dist / stepPx));
      const inv = 1 / steps;

      for (let i = 0; i <= steps; i++) {
        const a = i * inv;
        injectHeatAt(prev.x + dx * a, prev.y + dy * a, speed, dt * inv);
      }
    };

    // ────────────────────────── Dibujo ──────────────────────────

    // (ADD) Dibuja estrellas con twinkle y parallax muy barato
    const drawStars = (frameCount: number) => {
      // thinning según calidad
      const q = Quality.level; // 0..3
      const skipMask = q >= 3 ? 1 : q === 2 ? 1 : 2;
      const t = performance.now() * 0.001;

      // parallax leve con el ratón respecto al centro
      const mx = (displayMouse.x - width / 2) / width;
      const my = (displayMouse.y - height / 2) / height;

      for (let i = 0; i < stars.length; i++) {
        // thinning temporal para ~50% en baja calidad
        if (skipMask !== 1 && (frameCount + i) & 1) continue;

        const s = stars[i];
        // parallax: las cercanas (depth→1) se mueven un poco más
        const par = s.depth * 0.6 + 0.15;
        const ox = mx * par * 18;
        const oy = my * par * 18;

        // twinkle: alpha modulado (sin trig por estrella, usamos seno global + fase precomputada)
        // usaremos Math.sin(t * speed + phase) => es 2 trig por estrella; para reducir coste,
        // calculamos sin una vez: a = sin(…) y derivamos alpha. Esto sigue siendo barato comparado con draw calls.
        const a = Math.sin(t * s.speed + s.phase);
        // mapea a [min,max]
        const base = 0.35 + s.depth * 0.25; // más profundidad, más brillo base
        const amp = 0.3 + (s.size === 2 ? 0.25 : s.size === 1 ? 0.15 : 0.1);
        let alpha = base + a * amp;
        if (q <= 1) alpha *= 0.85; // menos brillo en baja calidad

        if (alpha <= 0.02) continue;
        const spr = starSprites[s.size] || starSprites[0];
        if (!spr) continue;

        const w = spr.width / dpr;
        const h = spr.height / dpr;
        const x = s.x + ox;
        const y = s.y + oy;

        ctx.globalAlpha = alpha;
        ctx.drawImage(spr, x - w / 2, y - h / 2, w, h);
        ctx.globalAlpha = 1;
      }
    };

    const drawPoints = (frameCount: number) => {
      ctx.clearRect(0, 0, width, height);

      drawStars(frameCount);

      // Ajustes por calidad
      const q = Quality.level;
      const skipEvery = q >= 3 ? 1 : q === 2 ? 1 : 2; // 0-1= skip 50%
      const enableBloom = q >= 1;
      const layerFlowStrength = q >= 3 ? 0.6 : q === 2 ? 0.45 : 0.3;
      const perFrameLayerMask = (layer: number) =>
        skipEvery === 1 ? true : ((frameCount + layer) & 1) === 0;

      // Preparar glow canvas si hace falta
      if (enableBloom && glowCtx) glowCtx.clearRect(0, 0, width, height);

      const r = influenceRadius;
      const EPS = 1e-4;

      // Bucle principal
      for (let gy = 0; gy < rows; gy++) {
        const baseY = gy * spacing;
        for (let gx = 0; gx < cols; gx++) {
          const i = idxOf(gx, gy);

          // thinning temporal por capa
          const layer = Math.floor(pointSeed[i] * layersCount);
          if (!perFrameLayerMask(layer)) continue;

          const baseX = gx * spacing;

          // Mouse attraction (suave)
          const dxm = displayMouse.x - baseX;
          const dym = displayMouse.y - baseY;
          const dist = Math.hypot(dxm, dym);

          let targetX = baseX;
          let targetY = baseY;

          if (dist > EPS && dist < r) {
            const t = 1 - dist / r;
            const force = t * t * maxOffset;
            const invd = 1 / dist;
            const nx = dxm * invd,
              ny = dym * invd;
            // Parallax: capas cercanas se mueven más
            const layerFactor = layersCount > 1 ? layer / (layersCount - 1) : 0;
            const depth = 1 - layerFactor;
            const parallax = 0.05 + depth * 0.18;
            targetX = baseX + nx * force * (1 + parallax);
            targetY = baseY + ny * force * (1 + parallax);
          }

          // Flow orgánico (barato)
          const flowScale = 0.006;
          const f = noise2(
            baseX * flowScale + flowTime,
            baseY * flowScale + flowTime
          );
          const angle = f * 6.283185307179586; // 2π
          const depth = 1 - (layersCount > 1 ? layer / (layersCount - 1) : 0);
          const flowStrength = 8.0 * (0.4 + depth * 1.0) * layerFlowStrength;
          targetX += Math.cos(angle) * flowStrength;
          targetY += Math.sin(angle) * flowStrength;

          // Parallax offset de centro (ligero)
          targetX +=
            (displayMouse.x - width / 2) * (parallaxCenterStrength * depth);
          targetY +=
            (displayMouse.y - height / 2) * (parallaxCenterStrength * depth);

          // Lerp pos mostrada
          dispX[i] += (targetX - dispX[i]) * returnLerp;
          dispY[i] += (targetY - dispY[i]) * returnLerp;

          // Activación (heat/proximidad) — usamos heat ya integrado; proximidad sólo añade un toque
          const mx = displayMouse.x - baseX;
          const my = displayMouse.y - baseY;
          const md = Math.hypot(mx, my);
          const nearFactor =
            md < influenceRadius ? 1 - md / influenceRadius : 0;
          const proxPow = Math.pow(nearFactor, Math.max(1, proximityGamma));
          // Combina heat (lento) + prox (inmediato) con peso bajo para evitar popping
          const shown = Math.max(
            heats[i] * 0.9,
            proxPow * (0.22 + depth * 0.28)
          );

          // Dibujo con sprite (MUCHO más barato que arc por punto)
          if (dotSprite) {
            // alpha base + refuerzo por shown (limitado)
            const alpha = 0.32 + shown * 0.48;
            if (alpha > 0.01) {
              ctx.globalAlpha = alpha;
              const ds = dotSprite;
              const hw = ds.width / dpr / 2;
              const hh = ds.height / dpr / 2;
              ctx.drawImage(ds, dispX[i] - hw, dispY[i] - hh, hw * 2, hh * 2);
              ctx.globalAlpha = 1;
            }
          }

          // Glow: sólo si activación razonable y calidad lo permite
          if (enableBloom && glowCtx && glowSprite && shown > 0.05) {
            const gAlpha = Math.min(0.85, 0.25 + shown * 0.75);
            if (gAlpha > 0.02) {
              glowCtx.globalAlpha = gAlpha;
              const gs = glowSprite;
              const hw = gs.width / dpr / 2;
              const hh = gs.height / dpr / 2;
              glowCtx.drawImage(
                gs,
                dispX[i] - hw,
                dispY[i] - hh,
                hw * 2,
                hh * 2
              );
              glowCtx.globalAlpha = 1;
            }
          }
        }
      }

      // Bloom: downscale + upsample en “lighter”
      if (enableBloom && glowCtx && bloomBuffer) {
        const bw = Math.max(
          1,
          Math.floor(width / (bloomDownscale + (3 - Quality.level) * 2))
        );
        const bh = Math.max(
          1,
          Math.floor(height / (bloomDownscale + (3 - Quality.level) * 2))
        );
        if (bloomBuffer.width !== bw || bloomBuffer.height !== bh) {
          bloomBuffer.width = bw;
          bloomBuffer.height = bh;
          bloomBuffer.style.width = `${bw}px`;
          bloomBuffer.style.height = `${bh}px`;
        }
        const tctx = bloomBuffer.getContext("2d");
        if (tctx) {
          tctx.clearRect(0, 0, bw, bh);
          tctx.drawImage(glowCanvas!, 0, 0, bw, bh);
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = bloomAlpha;
          ctx.drawImage(bloomBuffer, 0, 0, bw, bh, 0, 0, width, height);
          ctx.globalAlpha = 1;
          ctx.restore();
        }
        // Persistencia leve
        glowCtx.save();
        glowCtx.globalCompositeOperation = "source-over";
        glowCtx.fillStyle = `rgba(0,0,0,${bloomFade})`;
        glowCtx.fillRect(0, 0, width, height);
        glowCtx.restore();
      }
    };

    // ────────────────────────── Loop ──────────────────────────
    let lastFrameT = performance.now();
    let rafId = 0;
    let frameCount = 0;

    const animate = () => {
      const now = performance.now();
      let dt = Math.min(0.05, Math.max(0.001, (now - lastFrameT) / 1000));

      // Si estamos muy lentos y en móviles, clamp a 30fps para estabilidad
      const hardClamp30 = Quality.level <= 1;
      if (hardClamp30) {
        const target = 1 / 30;
        if (dt < target) dt = target; // estabiliza el paso
      }

      lastFrameT = now;
      flowTime += dt * flowTimeScale;

      // Procesa trayectoria cruda
      if (rawQueue.length >= 2) {
        // Integramos por segmentos; dejamos el último punto como inicio del siguiente ciclo
        let prev = rawQueue[0];
        for (let i = 1; i < rawQueue.length; i++) {
          injectAlongSegment(prev, rawQueue[i]);
          prev = rawQueue[i];
        }
        rawQueue.splice(0, rawQueue.length - 1);
      }

      // Decaimiento de calor
      if (heatDecay > 0) {
        const dec = heatDecay * dt;
        for (let i = 0; i < heats.length; i++) {
          const h = heats[i] - dec;
          heats[i] = h > 0 ? h : 0;
        }
      }

      // Suavizado del ratón
      displayMouse.x += (displayTarget.x - displayMouse.x) * smoothFactor;
      displayMouse.y += (displayTarget.y - displayMouse.y) * smoothFactor;

      // Dibujo
      const t0 = performance.now();
      
      drawPoints(frameCount++);
      const frameMs = performance.now() - t0;
      Quality.update(frameMs);

      rafId = requestAnimationFrame(animate);
    };

    // ────────────────────────── Eventos ──────────────────────────
    const onPointerMove = (e: PointerEvent) => {
      displayTarget.x = e.clientX;
      displayTarget.y = e.clientY;

      const now = performance.now();
      // Preferimos eventos coalescidos si existen
      const list = (e.getCoalescedEvents && e.getCoalescedEvents()) || null;
      if (list && list.length > 0) {
        const count = list.length;
        const total = Math.max(0.001, now - lastRawTime);
        const step = total / count;
        for (let i = 0; i < count; i++) {
          const ce = list[i] as PointerEvent;
          const t = lastRawTime + (i + 1) * step;
          pushRaw(ce.clientX, ce.clientY, t);
        }
        lastRawTime = now;
      } else {
        pushRaw(e.clientX, e.clientY, now);
        lastRawTime = now;
      }

      // Actualiza velocidad base con delta real (no se usa partícula: evitamos coste)
      lastPointerPos.x = e.clientX;
      lastPointerPos.y = e.clientY;
    };

    const onResize = () => {
      resize();
    };

    const mo = new MutationObserver(() => {
      readCss();
      buildSprites(); // si cambia el color/tamaño, regenera sprites
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style", "class"],
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

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
