// Copied verbatim from src/scenes/Scene1/math.ts (C00 end = Scene1's opening frame; ids prefixed c00-).
// Small math helpers for Scene1: vectors, quadratic Bezier paths and a
// monotone cubic keyframe interpolator (smooth, no overshoot, holds at ends).

export type Vec = { x: number; y: number };

export const v = (x: number, y: number): Vec => ({ x, y });
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
export const len = (a: Vec) => Math.hypot(a.x, a.y);
export const norm = (a: Vec): Vec => {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
};
export const polar = (r: number, a: number): Vec => ({ x: r * Math.cos(a), y: r * Math.sin(a) });
export const rot = (a: Vec, ang: number): Vec => ({
  x: a.x * Math.cos(ang) - a.y * Math.sin(ang),
  y: a.x * Math.sin(ang) + a.y * Math.cos(ang),
});
export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Quadratic Bezier point and tangent.
export const bez = (a: Vec, b: Vec, c: Vec, u: number): Vec => {
  const m = 1 - u;
  return {
    x: m * m * a.x + 2 * m * u * b.x + u * u * c.x,
    y: m * m * a.y + 2 * m * u * b.y + u * u * c.y,
  };
};
export const bezTan = (a: Vec, b: Vec, c: Vec, u: number): Vec => ({
  x: 2 * (1 - u) * (b.x - a.x) + 2 * u * (c.x - b.x),
  y: 2 * (1 - u) * (b.y - a.y) + 2 * u * (c.y - b.y),
});
export const bezLen = (a: Vec, b: Vec, c: Vec) => {
  let l = 0;
  let p = a;
  for (let i = 1; i <= 16; i++) {
    const q = bez(a, b, c, i / 16);
    l += len(sub(q, p));
    p = q;
  }
  return l;
};

// Arc-length table for a quadratic Bezier: distance travelled -> u.
export const arcTable = (a: Vec, b: Vec, c: Vec, n = 240) => {
  const cum = [0];
  let p = a;
  for (let i = 1; i <= n; i++) {
    const q = bez(a, b, c, i / n);
    cum.push(cum[i - 1] + len(sub(q, p)));
    p = q;
  }
  const total = cum[n];
  const uAt = (s: number) => {
    const d = clamp(s, 0, total);
    let lo = 0;
    let hi = n;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < d) lo = mid;
      else hi = mid;
    }
    const seg = cum[hi] - cum[lo] || 1;
    return (lo + (d - cum[lo]) / seg) / n;
  };
  return { total, uAt };
};

// Monotone cubic (Fritsch-Carlson) through keyframes. Zero slope at both
// ends and wherever the motion changes direction or holds.
export const keys = (frames: number[], values: number[]) => {
  const n = frames.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((values[i + 1] - values[i]) / (frames[i + 1] - frames[i]));
  const m: number[] = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (f: number) => {
    if (f <= frames[0]) return values[0];
    if (f >= frames[n - 1]) return values[n - 1];
    let i = 0;
    while (f > frames[i + 1]) i++;
    const h = frames[i + 1] - frames[i];
    const t = (f - frames[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * values[i] +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * values[i + 1] +
      (t3 - t2) * h * m[i + 1]
    );
  };
};

// Ellipse-ish number formatting to keep SVG path strings short.
export const n2 = (x: number) => Math.round(x * 100) / 100;
