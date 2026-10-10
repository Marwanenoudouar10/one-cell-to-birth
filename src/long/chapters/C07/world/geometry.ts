// 2D vector + path helpers (copied from C06/geometry.ts, itself Scene3's; trimmed).
export type Pt = { x: number; y: number };

export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

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

// Arc along a circle (degrees, SVG orientation), for highlights.
export const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => {
    const t = (a * Math.PI) / 180;
    return `${f(cx + r * Math.cos(t))},${f(cy + r * Math.sin(t))}`;
  };
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${p(a0)} A${f(r)},${f(r)} 0 ${large} ${a1 > a0 ? 1 : 0} ${p(a1)}`;
};

// C06's (Scene3's) sac: centre + radius in world px. C07 keeps it unchanged.
export const SAC = { x: 540, y: 860, r: 330 } as const;
