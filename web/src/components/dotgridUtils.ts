// small utilities for DotGridBackground
export const lerpSmooth = (a: number, b: number, t: number) => a + (b - a) * (t * t * (3 - 2 * t));
export const hash2 = (x: number, y: number) => {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
};
export const noise2 = (x: number, y: number) => {
  const xf = Math.floor(x), yf = Math.floor(y);
  const rx = x - xf, ry = y - yf;
  const a = hash2(xf, yf);
  const b = hash2(xf + 1, yf);
  const c = hash2(xf, yf + 1);
  const d = hash2(xf + 1, yf + 1);
  const u = lerpSmooth(a, b, rx);
  const v = lerpSmooth(c, d, rx);
  return lerpSmooth(u, v, ry);
};

// small xorshift-based PRNG pool to avoid Math.random() hot-path cost
class FastRNG {
  seeds: Uint32Array;
  idx = 0;
  constructor(n = 32) {
    this.seeds = new Uint32Array(n);
    let s = 123456789;
    for (let i = 0; i < n; i++) {
      // simple seed mixing
      s = (1664525 * s + 1013904223) | 0;
      this.seeds[i] = s >>> 0;
    }
  }
  nextUnit() {
    // xorshift32
    let s = this.seeds[this.idx];
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    this.seeds[this.idx] = s >>> 0;
    this.idx = (this.idx + 1) % this.seeds.length;
    return (s >>> 0) / 4294967295;
  }
}

export const rngPool = new FastRNG(64);
