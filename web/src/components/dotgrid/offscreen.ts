// ────────────────────────── Offscreen buffers (glow + bloom) ──────────────────────────
// Lightweight helper that owns an offscreen glow canvas and a downscale buffer
// used to produce a cheap bloom effect by downscaling and upscaling.

export function createOffscreen() {
  let glowCanvas: HTMLCanvasElement | null = null;
  let glowCtx: CanvasRenderingContext2D | null = null;
  let bloomBuffer: HTMLCanvasElement | null = null;

  function ensureSize(dpr: number, width: number, height: number) {
    if (!glowCanvas) glowCanvas = document.createElement("canvas");
    // glow canvas is kept at logical pixel size; callers set ctx transform as needed
    glowCanvas.width = Math.floor(width * dpr);
    glowCanvas.height = Math.floor(height * dpr);
    glowCanvas.style.width = `${width}px`;
    glowCanvas.style.height = `${height}px`;
    glowCtx = glowCanvas.getContext("2d");
    if (glowCtx) glowCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawGlow(sprite: HTMLCanvasElement, x: number, y: number, alpha: number, dpr: number) {
    if (!glowCtx) return;
    glowCtx.globalAlpha = alpha;
    const sw = sprite.width / dpr;
    const sh = sprite.height / dpr;
    glowCtx.drawImage(sprite, x - sw / 2, y - sh / 2, sw, sh);
    glowCtx.globalAlpha = 1;
  }

  function renderBloomTo(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bloomDownscale: number,
    bloomAlpha: number
  ) {
    if (!glowCanvas) return;
    const bw = Math.max(1, Math.floor(width / bloomDownscale));
    const bh = Math.max(1, Math.floor(height / bloomDownscale));
    if (!bloomBuffer) bloomBuffer = document.createElement("canvas");
    if (bloomBuffer.width !== bw || bloomBuffer.height !== bh) {
      bloomBuffer.width = bw;
      bloomBuffer.height = bh;
      bloomBuffer.style.width = `${bw}px`;
      bloomBuffer.style.height = `${bh}px`;
    }

    const tctx = bloomBuffer.getContext("2d");
    if (!tctx) return;
    tctx.clearRect(0, 0, bw, bh);
    // draw downscaled glow into the small buffer
    tctx.drawImage(glowCanvas, 0, 0, bw, bh);

    // composite back up to main ctx with additive blend
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = bloomAlpha;
    ctx.drawImage(bloomBuffer, 0, 0, bw, bh, 0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function fadeGlow(bloomFade: number, width: number, height: number) {
    if (!glowCtx) return;
    if (bloomFade > 0 && bloomFade < 1) {
      glowCtx.save();
      glowCtx.globalCompositeOperation = "source-over";
      glowCtx.fillStyle = `rgba(0,0,0,${bloomFade})`;
      glowCtx.fillRect(0, 0, width, height);
      glowCtx.restore();
    } else {
      glowCtx.clearRect(0, 0, width, height);
    }
  }

  function getGlowCanvas() {
    return glowCanvas;
  }

  return { ensureSize, drawGlow, renderBloomTo, fadeGlow, getGlowCanvas };
}
