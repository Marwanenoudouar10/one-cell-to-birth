// Geometry of the dormant heart tube C06 opens on (kit heart space, design
// units): a soft C-loop, inflow lower left -> ventricle bend right -> outflow
// upper left, its width varying along it. Mirrors C06's tube so the fade
// hand-off matches exactly (copied, never imported across chapters).
import { Pt, smoothPath, table } from "../../../shared/embryo/math";

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
const W_V = [4.5, 7.5, 6, 5, 9.5, 7.5, 5, 3.4];
const N = 44;

const cr = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

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

export const TUBE_OUTLINE = (() => {
  const L: Pt[] = [];
  const R: Pt[] = [];
  CENTRE.forEach((p, k) => {
    const a = CENTRE[Math.max(0, k - 1)];
    const b = CENTRE[Math.min(N, k + 1)];
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / l;
    const ny = (b.x - a.x) / l;
    const w = table(k / N, W_T, W_V);
    L.push({ x: p.x + nx * w, y: p.y + ny * w });
    R.push({ x: p.x - nx * w, y: p.y - ny * w });
  });
  const cap = (i: number, j: number, w: number): Pt => {
    const p = CENTRE[i];
    const q = CENTRE[j];
    const l = Math.hypot(p.x - q.x, p.y - q.y) || 1;
    return { x: p.x + ((p.x - q.x) / l) * w * 0.8, y: p.y + ((p.y - q.y) / l) * w * 0.8 };
  };
  return smoothPath([...L, cap(N, N - 1, W_V[W_V.length - 1]), ...R.reverse(), cap(0, 1, W_V[0])], true);
})();
