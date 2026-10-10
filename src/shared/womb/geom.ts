// Womb kit geometry: points, smooth splines, arcs, angles and the shared sac
// shape function. Units are WORLD px (the 1080x1920 canvas before any camera).
// Angles are DEGREES in SVG convention: 0 = right, +90 = down, -90 = up.
import { useId } from "react";

export type Pt = { x: number; y: number };

export const P = (x: number, y: number): Pt => ({ x, y });
export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
export const len = (a: Pt) => Math.hypot(a.x, a.y);
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const DEG = Math.PI / 180;
// Unit vector at an angle in degrees.
export const dir = (deg: number): Pt => ({ x: Math.cos(deg * DEG), y: Math.sin(deg * DEG) });
// Point at (radius, degrees) around a centre.
export const polar = (c: Pt, r: number, deg: number): Pt => add(c, mul(dir(deg), r));
// Smallest signed difference between two angles (radians).
export const angDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
};

const n = (v: number) => v.toFixed(2);

// Smooth spline through points (Catmull-Rom with chord-length aware handles,
// so uneven spacing never overshoots). Closed by default.
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
    const c1 = add(p1, mul(sub(p2, p0), d1 / (d0 + d1) / 3));
    const c2 = sub(p2, mul(sub(p3, p1), d1 / (d1 + d2) / 3));
    d += `C${n(c1.x)},${n(c1.y)} ${n(c2.x)},${n(c2.y)} ${n(p2.x)},${n(p2.y)}`;
  }
  return closed ? `${d}Z` : d;
};

// Circular arc path between two angles (degrees), for highlights.
export const arcPath = (c: Pt, r: number, a0: number, a1: number) => {
  const p0 = polar(c, r, a0);
  const p1 = polar(c, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${n(p0.x)},${n(p0.y)} A${n(r)},${n(r)} 0 ${large} ${a1 > a0 ? 1 : 0} ${n(p1.x)},${n(p1.y)}`;
};

// Tapered crescent along an arc: zero width at both ends, `w` in the middle.
// Reads far better than a round-capped stroke for waves and glints.
export const crescent = (c: Pt, r: number, a0: number, a1: number, w: number, steps = 20) => {
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + (a1 - a0) * t;
    const h = (w / 2) * Math.pow(Math.sin(Math.PI * t), 0.75);
    outer.push(polar(c, r + h, a));
    inner.push(polar(c, r - h, a));
  }
  return smooth([...outer, ...inner.reverse()]);
};

// Base sac/cavity outline radius at an angle (radians): a circle stretched
// vertically by `aspect` (ry/rx) and widened at the top by `pear` (0..1,
// the full-term womb is broader at the fundus than at the cervix).
export type SacShape = { cx: number; cy: number; r: number; aspect?: number; pear?: number };
export const baseRadius = (s: SacShape, theta: number) => {
  const a = s.aspect ?? 1;
  const c = Math.cos(theta);
  const sn = Math.sin(theta);
  const ell = s.r / Math.sqrt(c * c + (sn * sn) / (a * a));
  return ell * (1 - (s.pear ?? 0) * 0.07 * sn);
};

// Unique, collision-proof SVG id for this component instance ("wb-..." prefix).
export const useUid = (name: string) => {
  const raw = useId();
  return `wb-${name}-${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
};
