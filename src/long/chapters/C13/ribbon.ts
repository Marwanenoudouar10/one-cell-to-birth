// Tapered "crease" ribbons for the brain's grooves: a groove is a filled
// sliver that swells in the middle and tapers to fine points (reads as a soft
// valley, not a cracked line). Supports a draw-on reveal with a tapered tip.
import type { V2 } from "./brainShape";

export type Sampled = { p: V2[]; s: number[]; len: number };

// Uniform Catmull-Rom through an open polyline -> dense samples + arc length.
export const sampleOpen = (pts: V2[], per = 8): Sampled => {
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const p: V2[] = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [a, b, c, d] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const f = (x0: number, x1: number, x2: number, x3: number) =>
        0.5 * (2 * x1 + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t * t + (-x0 + 3 * x1 - 3 * x2 + x3) * t * t * t);
      p.push({ x: f(a.x, b.x, c.x, d.x), y: f(a.y, b.y, c.y, d.y) });
    }
  }
  p.push(pts[pts.length - 1]);
  const s = [0];
  for (let i = 1; i < p.length; i++) s.push(s[i - 1] + Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y));
  return { p, s, len: s[s.length - 1] };
};

const ss = (v: number) => {
  const t = Math.max(0, Math.min(1, v));
  return t * t * (3 - 2 * t);
};
const f2 = (v: number) => v.toFixed(2);

// Filled ribbon of max width w along the first `reveal` (0..1) of the curve,
// shifted by (dx, dy). Ends taper over ~35% of the length (min 4 units).
export const ribbon = (g: Sampled, w: number, reveal = 1, dx = 0, dy = 0): string => {
  if (reveal <= 0.002 || w <= 0.01) return "";
  const vis = g.len * Math.min(1, reveal);
  const tap = Math.max(4, g.len * 0.35);
  const L: V2[] = [];
  const R: V2[] = [];
  for (let i = 0; i < g.p.length; i++) {
    let q = g.p[i];
    let si = g.s[i];
    if (si > vis) {
      const t = (vis - g.s[i - 1]) / (si - g.s[i - 1] || 1);
      q = { x: g.p[i - 1].x + (q.x - g.p[i - 1].x) * t, y: g.p[i - 1].y + (q.y - g.p[i - 1].y) * t };
      si = vis;
    }
    const a = g.p[Math.max(0, i - 1)];
    const b = g.p[Math.min(g.p.length - 1, i + 1)];
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const n = { x: -(b.y - a.y) / l, y: (b.x - a.x) / l };
    const half = (w / 2) * Math.pow(ss(si / tap) * ss((vis - si) / Math.min(tap, Math.max(2, vis * 0.5))), 0.7);
    L.push({ x: q.x + n.x * half + dx, y: q.y + n.y * half + dy });
    R.push({ x: q.x - n.x * half + dx, y: q.y - n.y * half + dy });
    if (si >= vis) break;
  }
  const pts = [...L, ...R.reverse()];
  return `M${pts.map((q) => `${f2(q.x)},${f2(q.y)}`).join(" L")}Z`;
};
