// Small 2D helpers for C09's own art (fetus-local / world px).
import { Pt } from "./timeline";

const n = (v: number) => v.toFixed(2);
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

// Smooth spline through points (Catmull-Rom, chord-length aware handles).
export const smooth = (pts: Pt[], closed = true): string => {
  const N = pts.length;
  const at = (i: number) => (closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))]);
  let d = `M${n(pts[0].x)},${n(pts[0].y)}`;
  const segs = closed ? N : N - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const d0 = dist(p0, p1) || 1;
    const d1 = dist(p1, p2) || 1;
    const d2 = dist(p2, p3) || 1;
    const k1 = d1 / (d0 + d1) / 3;
    const k2 = d1 / (d1 + d2) / 3;
    const c1 = { x: p1.x + (p2.x - p0.x) * k1, y: p1.y + (p2.y - p0.y) * k1 };
    const c2 = { x: p2.x - (p3.x - p1.x) * k2, y: p2.y - (p3.y - p1.y) * k2 };
    d += `C${n(c1.x)},${n(c1.y)} ${n(c2.x)},${n(c2.y)} ${n(p2.x)},${n(p2.y)}`;
  }
  return closed ? `${d}Z` : d;
};

// Point + unit tangent at fraction t (0..1) along an open polyline.
export const along = (pts: Pt[], t: number) => {
  const seg = pts.slice(1).map((q, i) => dist(q, pts[i]));
  let left = Math.max(0, Math.min(1, t)) * seg.reduce((a, v) => a + v, 0);
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, left / seg[i]) : 0;
      const a = pts[i];
      const b = pts[i + 1];
      const l = seg[i] || 1;
      return { p: { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }, t: { x: (b.x - a.x) / l, y: (b.y - a.y) / l } };
    }
    left -= seg[i];
  }
  return { p: pts[0], t: { x: 0, y: 1 } };
};

export const mixPt = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
