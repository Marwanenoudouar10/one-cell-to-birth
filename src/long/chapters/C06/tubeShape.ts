// Geometry of the looped heart tube (kit heart space, design units): a soft
// C-loop from the venous inflow (lower left) round the ventricle bend (right)
// to the narrow outflow (upper left). Width varies along it like the real
// tube (inflow, atrial swelling, narrow canal, wide ventricle loop, outflow),
// and a squeeze pinches it locally as it travels.
import { Pt, smoothPath, table } from "../../../shared/embryo/math";

// drawn for the kit's ventricle bulge (centre 2,4; ~36 x 32), kept inside it
const RAW: Pt[] = [
  { x: -30, y: 34 },
  { x: -12, y: 33 },
  { x: 7, y: 27 },
  { x: 22, y: 13 },
  { x: 25, y: -5 },
  { x: 15, y: -20 },
  { x: -1, y: -27 },
  { x: -13, y: -36 },
];
const KNOTS: Pt[] = RAW.map((p) => ({ x: -4 + (p.x - 2) * 0.72, y: 3 + (p.y - 4) * 0.72 }));
const W_T = [0, 0.12, 0.27, 0.4, 0.58, 0.78, 0.92, 1];
// widths: C05's dormant tube (its END = our frame 0) -> fuller once it curls and fills
const W_DIM = [4.5, 7.5, 6, 5, 9.5, 7.5, 5, 3.4];
const W_LIT = [5.2, 8.8, 7, 6, 11, 8.8, 5.8, 3.8];
const N = 44;

const cr = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

// Centre line, sampled uniformly in spline parameter.
const CENTRE: Pt[] = (() => {
  const out: Pt[] = [];
  const n = KNOTS.length;
  const g = (i: number) => KNOTS[Math.max(0, Math.min(n - 1, i))];
  for (let k = 0; k <= N; k++) {
    const s = (k / N) * (n - 1);
    const i = Math.min(n - 2, Math.floor(s));
    const t = s - i;
    out.push({ x: cr(g(i - 1).x, g(i).x, g(i + 1).x, g(i + 2).x, t), y: cr(g(i - 1).y, g(i).y, g(i + 1).y, g(i + 2).y, t) });
  }
  return out;
})();

export const TUBE_LINE = smoothPath(CENTRE, false);

// Filled outline. `pinch` = squeeze position (0..1 along the tube) and depth;
// `grow` 0 = C05's dormant widths .. 1 = the full tube; `swell` 0..1 fattens the
// loop (most at the ventricle bend) until it reads as the kit's round heart bulge.
export const tubeOutline = (pinch: { u: number; a: number } | null, grow = 1, swell = 0) => {
  const W_V = W_DIM.map((v, i) => (v + (W_LIT[i] - v) * grow) * (1 + swell * (0.6 + 0.9 * Math.sin(Math.PI * W_T[i]))));
  const L: Pt[] = [];
  const R: Pt[] = [];
  CENTRE.forEach((p, k) => {
    const u = k / N;
    const a = CENTRE[Math.max(0, k - 1)];
    const b = CENTRE[Math.min(N, k + 1)];
    const tx = b.x - a.x;
    const ty = b.y - a.y;
    const l = Math.hypot(tx, ty) || 1;
    const nx = -ty / l;
    const ny = tx / l;
    let w = table(u, W_T, W_V);
    if (pinch) {
      const d = u - pinch.u;
      // squeezed just behind the wave front, swelling a touch ahead of it
      w *= 1 - 0.34 * Math.min(1, pinch.a) * Math.exp(-((d + 0.03) ** 2) / (2 * 0.06 ** 2));
      w *= 1 + 0.12 * Math.min(1, pinch.a) * Math.exp(-((d - 0.1) ** 2) / (2 * 0.07 ** 2));
    }
    L.push({ x: p.x + nx * w, y: p.y + ny * w });
    R.push({ x: p.x - nx * w, y: p.y - ny * w });
  });
  // round caps: one extra point past each end
  const cap = (i: number, j: number, w: number): Pt => {
    const p = CENTRE[i];
    const q = CENTRE[j];
    const l = Math.hypot(p.x - q.x, p.y - q.y) || 1;
    return { x: p.x + ((p.x - q.x) / l) * w * 0.8, y: p.y + ((p.y - q.y) / l) * w * 0.8 };
  };
  const end = cap(N, N - 1, W_V[W_V.length - 1]);
  const start = cap(0, 1, W_V[0]);
  return smoothPath([...L, end, ...R.reverse(), start], true);
};

// Point at arc-length fraction u (0 inflow .. 1 outflow), matching pathLength={1} dashes.
const CUM: number[] = (() => {
  const c = [0];
  for (let k = 1; k <= N; k++) c.push(c[k - 1] + Math.hypot(CENTRE[k].x - CENTRE[k - 1].x, CENTRE[k].y - CENTRE[k - 1].y));
  return c.map((v) => v / c[N]);
})();

export const tubePoint = (u: number): Pt => {
  const t = Math.max(0, Math.min(1, u));
  let k = 1;
  while (k < N && CUM[k] < t) k++;
  const a = (t - CUM[k - 1]) / (CUM[k] - CUM[k - 1] || 1);
  return { x: CENTRE[k - 1].x + (CENTRE[k].x - CENTRE[k - 1].x) * a, y: CENTRE[k - 1].y + (CENTRE[k].y - CENTRE[k - 1].y) * a };
};
