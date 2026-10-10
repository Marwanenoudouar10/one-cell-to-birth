// Keyframe curves over gestational week. Every week-dependent number of the
// fetus goes through these, so the character changes continuously (no kinks
// when a chapter animates `week` from 9 to 40).
import { Pt, clamp } from "./geom";

// Weights of each keyframe for a smooth (cubic Hermite, Catmull-Rom tangents)
// curve through the keys at x. Linear in the key values, so the same weights
// can blend numbers, point arrays or whole outlines.
export const keyWeights = (x: number, xs: readonly number[]): number[] => {
  const n = xs.length;
  const w = new Array<number>(n).fill(0);
  if (x <= xs[0]) {
    w[0] = 1;
    return w;
  }
  if (x >= xs[n - 1]) {
    w[n - 1] = 1;
    return w;
  }
  let i = 0;
  while (x > xs[i + 1]) i++;
  const h = xs[i + 1] - xs[i];
  const t = (x - xs[i]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  w[i] += 2 * t3 - 3 * t2 + 1;
  w[i + 1] += -2 * t3 + 3 * t2;
  const tangent = (k: number, scale: number) => {
    const a = Math.max(0, k - 1);
    const b = Math.min(n - 1, k + 1);
    const d = xs[b] - xs[a];
    w[b] += scale / d;
    w[a] -= scale / d;
  };
  tangent(i, (t3 - 2 * t2 + t) * h);
  tangent(i + 1, (t3 - t2) * h);
  return w;
};

export const blendNum = (w: number[], vs: readonly number[]) => vs.reduce((a, v, i) => a + v * w[i], 0);

export const blendPts = (w: number[], sets: readonly Pt[][]): Pt[] =>
  sets[0].map((_, j) => ({
    x: sets.reduce((a, s, i) => a + s[j].x * w[i], 0),
    y: sets.reduce((a, s, i) => a + s[j].y * w[i], 0),
  }));

// Smooth curve through [week, value] keys.
export const curve = (x: number, keys: readonly (readonly [number, number])[]) =>
  blendNum(
    keyWeights(
      x,
      keys.map((k) => k[0]),
    ),
    keys.map((k) => k[1]),
  );

// Same, clamped to 0..1 (for opacities / feature strengths).
export const curve01 = (x: number, keys: readonly (readonly [number, number])[]) => clamp(curve(x, keys));

// Piecewise-linear (strictly monotone data such as measured lengths).
export const linear = (x: number, keys: readonly (readonly [number, number])[]) => {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [x0, y0] = keys[i];
    const [x1, y1] = keys[i + 1];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return keys[keys.length - 1][1];
};

export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
