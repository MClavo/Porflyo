// sprite builders for DotGrid
export function createDotAndGlow(dotSize: number, cssDotColor: string, bloomSizeMult: number, dpr: number) {
  // allow very small dotSize
  const realDot = Math.max(0.02, dotSize);
  const px = Math.max(0.5, realDot * dpr);
  const size = Math.max(3, Math.ceil(px * 2 + 1));

  const dotSprite = document.createElement("canvas");
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

  const gpx = Math.max(px * bloomSizeMult, px * 1.2);
  const gsize = Math.max(size, Math.ceil(gpx * 2 + 2));
  const glowSprite = document.createElement("canvas");
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
  grad.addColorStop(0, cssDotColor);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  gctx.fillStyle = grad;
  gctx.beginPath();
  gctx.arc(gsize / 2, gsize / 2, gpx, 0, Math.PI * 2);
  gctx.fill();

  return { dotSprite, glowSprite };
}

export function createStarSprites(dpr: number) {
  const starSprites: HTMLCanvasElement[] = [];
  const basePx = [1, 1.4, 2].map((v) => Math.max(0.35, v) * dpr);
  for (let s = 0; s < basePx.length; s++) {
    const px = basePx[s];
    const size = Math.max(6, Math.ceil(px * 10));
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, size, size);
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

    g.globalAlpha = 0.65;
    g.lineWidth = Math.max(1, Math.round(dpr * 0.6));
    g.strokeStyle = "rgba(200,220,255,0.85)";
    g.beginPath();
    g.moveTo(size * 0.15, size / 2);
    g.lineTo(size * 0.85, size / 2);
    g.stroke();
    g.beginPath();
    g.moveTo(size / 2, size * 0.15);
    g.lineTo(size / 2, size * 0.85);
    g.stroke();

    g.globalAlpha = 1;
    g.fillStyle = "rgba(230,240,255,0.95)";
    g.beginPath();
    g.arc(size / 2, size / 2, Math.max(0.9, px * 0.9), 0, Math.PI * 2);
    g.fill();

    starSprites.push(c);
  }
  return starSprites;
}
