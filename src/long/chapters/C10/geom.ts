// Small pure helpers for C10 (points, easing maths, smooth closed paths).
export type Pt = { x: number; y: number };

export const P = (x: number, y: number): Pt => ({ x, y });
export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
export const len = (a: Pt) => Math.hypot(a.x, a.y);
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const DEG = Math.PI / 180;
export const rot = (p: Pt, deg: number): Pt => {
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
};
export const perp = (a: Pt): Pt => ({ x: -a.y, y: a.x });
export const norm = (a: Pt): Pt => {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
};

// Closed (or open) Catmull-Rom spline through points, as an SVG path.
export const smoothPath = (pts: Pt[], closed = true, k = 1 / 6): string => {
  const n = pts.length;
  if (n < 2) return "";
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(pts[0].x)},${f(pts[0].y)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = add(p1, mul(sub(p2, p0), k));
    const c2 = sub(p2, mul(sub(p3, p1), k));
    d += ` C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return closed ? d + "Z" : d;
};

// Rounded capsule between two points (for bones).
export const capsule = (a: Pt, b: Pt, ra: number, rb: number): string => {
  const d = norm(sub(b, a));
  const n = perp(d);
  const pa1 = add(a, mul(n, ra)), pa2 = add(a, mul(n, -ra));
  const pb1 = add(b, mul(n, rb)), pb2 = add(b, mul(n, -rb));
  const f = (v: number) => v.toFixed(2);
  return `M${f(pa1.x)},${f(pa1.y)} L${f(pb1.x)},${f(pb1.y)} A${f(rb)},${f(rb)} 0 0 0 ${f(pb2.x)},${f(pb2.y)} L${f(pa2.x)},${f(pa2.y)} A${f(ra)},${f(ra)} 0 0 0 ${f(pa1.x)},${f(pa1.y)}Z`;
};

// Clip a convex polygon by the half-plane n.(p - o) <= 0.
export const clipHalf = (poly: Pt[], o: Pt, n: Pt): Pt[] => {
  const out: Pt[] = [];
  const side = (p: Pt) => (p.x - o.x) * n.x + (p.y - o.y) * n.y;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const sa = side(a), sb = side(b);
    if (sa <= 0) out.push(a);
    if ((sa < 0 && sb > 0) || (sa > 0 && sb < 0)) out.push(lerpPt(a, b, sa / (sa - sb)));
  }
  return out;
};

// Decaying pulse: 0 before `at`, peak 1 right after, gone after ~`life` frames.
export const flash = (f: number, at: number, life = 10) => (f < at ? 0 : Math.exp(-(f - at) / life) * clamp((f - at + 1) / 2));
