// ────────────────────────── Particle pool ──────────────────────────
// Small particle pool to avoid per-frame allocations. Exposes methods to
// push a particle and to iterate/step the active particles.

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

export function createParticlePool(size = 800) {
  const pool: Particle[] = new Array(size);
  for (let i = 0; i < size; i++) pool[i] = { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0 };
  let active = 0;

  function push(x: number, y: number, vx: number, vy: number, maxLife = 1) {
    if (active < pool.length) {
      const p = pool[active++];
      p.x = x;
      p.y = y;
      p.vx = vx;
      p.vy = vy;
      p.life = 1;
      p.maxLife = maxLife;
    } else {
      // recycle oldest
      const p = pool[0];
      p.x = x;
      p.y = y;
      p.vx = vx;
      p.vy = vy;
      p.life = 1;
      p.maxLife = maxLife;
    }
  }

  function step(dt: number, damp: number, injector: (x: number, y: number, speed: number, dt: number) => void) {
    for (let i = active - 1; i >= 0; i--) {
      const p = pool[i];
      p.vx *= damp;
      p.vy *= damp;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt * 0.8;
      if (p.life > 0) {
        injector(p.x, p.y, Math.hypot(p.vx, p.vy) * 60, dt);
      } else {
        active--;
        if (i < active) pool[i] = pool[active];
        pool[active] = p;
      }
    }
  }

  function getActiveCount() {
    return active;
  }

  return { push, step, getActiveCount };
}
