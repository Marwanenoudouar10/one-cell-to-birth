// Small 2D vector + path helpers for the organic shapes in this scene.
export type Pt = { x: number; y: number };

export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
export const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y;
export const len = (a: Pt) => Math.hypot(a.x, a.y);
export const norm = (a: Pt): Pt => {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
};
export const perp = (a: Pt): Pt => ({ x: -a.y, y: a.x });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const deg = (a: Pt) => (Math.atan2(a.y, a.x) * 180) / Math.PI;

const f = (n: number) => n.toFixed(2);

// Catmull-Rom spline through the points, emitted as cubic Beziers.
export const smoothPath = (pts: Pt[], closed: boolean): string => {
  const n = pts.length;
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0].x)},${f(pts[0].y)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return closed ? `${d}Z` : d;
};

// Smooth (Catmull-Rom) lookup in a table of knots: no kinks in the outline.
export const table = (s: number, xs: number[], ys: number[]) => {
  if (s <= xs[0]) return ys[0];
  if (s >= xs[xs.length - 1]) return ys[ys.length - 1];
  let i = 0;
  while (s > xs[i + 1]) i++;
  const t = (s - xs[i]) / (xs[i + 1] - xs[i]);
  const y0 = ys[Math.max(0, i - 1)];
  const y1 = ys[i];
  const y2 = ys[i + 1];
  const y3 = ys[Math.min(ys.length - 1, i + 2)];
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * y1 + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3);
};

// Arc along a circle (degrees, SVG orientation), for highlights.
export const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => {
    const t = (a * Math.PI) / 180;
    return `${f(cx + r * Math.cos(t))},${f(cy + r * Math.sin(t))}`;
  };
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${p(a0)} A${f(r)},${f(r)} 0 ${large} ${a1 > a0 ? 1 : 0} ${p(a1)}`;
};
