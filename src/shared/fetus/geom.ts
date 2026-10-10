// 2D geometry kit for the shared fetus (copied from Scene4/geom.ts so the
// teaser stays independent): points, smooth splines, tapered capsules.
// Everything returns plain numbers or SVG path data.


export type Pt = { x: number; y: number };

export const P = (x: number, y: number): Pt => ({ x, y });
export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
export const len = (a: Pt) => Math.hypot(a.x, a.y);
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const lerpPts = (a: Pt[], b: Pt[], t: number) => a.map((p, i) => lerpPt(p, b[i], t));

export const DEG = Math.PI / 180;

// Unit vector at angle (degrees, SVG convention: 0 = right, +90 = down).
export const dir = (deg: number): Pt => ({ x: Math.cos(deg * DEG), y: Math.sin(deg * DEG) });

// Rotate a point around the origin by degrees.
export const rot = (p: Pt, deg: number): Pt => {
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
};

// Affine frame: translate + rotate + uniform scale.
export type Frame = { x: number; y: number; rot: number; s: number };

export const toFrame = (f: Frame, p: Pt): Pt => add(P(f.x, f.y), rot(mul(p, f.s), f.rot));
export const fromFrame = (f: Frame, p: Pt): Pt => mul(rot(sub(p, P(f.x, f.y)), -f.rot), 1 / f.s);
export const frameCss = (f: Frame) => `translate(${f.x} ${f.y}) rotate(${f.rot}) scale(${f.s})`;

const n = (v: number) => v.toFixed(2);

// Smooth spline through points (Catmull-Rom style with chord-length aware
// handles, so uneven spacing never overshoots). Closed or open.
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
    const c1 = add(p1, mul(sub(p2, p0), k1));
    const c2 = sub(p2, mul(sub(p3, p1), k2));
    d += `C${n(c1.x)},${n(c1.y)} ${n(c2.x)},${n(c2.y)} ${n(p2.x)},${n(p2.y)}`;
  }
  return closed ? d + "Z" : d;
};

// Tapered capsule from circle (a, ra) to circle (b, rb): a limb segment.
export const capsule = (a: Pt, ra: number, b: Pt, rb: number): string => {
  const d = dist(a, b);
  if (d < 1e-3 || d <= Math.abs(ra - rb)) {
    const r = Math.max(ra, rb);
    const c = ra >= rb ? a : b;
    return `M${n(c.x - r)},${n(c.y)}a${n(r)},${n(r)} 0 1 0 ${n(2 * r)},0a${n(r)},${n(r)} 0 1 0 ${n(-2 * r)},0Z`;
  }
  const phi = Math.atan2(b.y - a.y, b.x - a.x);
  const al = Math.acos((ra - rb) / d);
  const u = (t: number) => ({ x: Math.cos(t), y: Math.sin(t) });
  const a1 = add(a, mul(u(phi + al), ra));
  const a2 = add(a, mul(u(phi - al), ra));
  const b1 = add(b, mul(u(phi + al), rb));
  const b2 = add(b, mul(u(phi - al), rb));
  return (
    `M${n(a1.x)},${n(a1.y)}L${n(b1.x)},${n(b1.y)}` +
    `A${n(rb)},${n(rb)} 0 ${al > Math.PI / 2 ? 1 : 0} 0 ${n(b2.x)},${n(b2.y)}` +
    `L${n(a2.x)},${n(a2.y)}` +
    `A${n(ra)},${n(ra)} 0 ${al < Math.PI / 2 ? 1 : 0} 0 ${n(a1.x)},${n(a1.y)}Z`
  );
};

// Circle as path data (so it can be merged into a silhouette).
export const circlePath = (c: Pt, r: number) =>
  `M${n(c.x - r)},${n(c.y)}a${n(r)},${n(r)} 0 1 0 ${n(2 * r)},0a${n(r)},${n(r)} 0 1 0 ${n(-2 * r)},0Z`;

// Map local points (u along axis, v across) into a frame at origin/angle/scale.
export const place = (pts: Pt[], o: Pt, deg: number, s = 1) => pts.map((p) => add(o, rot(mul(p, s), deg)));

// Smallest signed difference between two angles in radians.
export const angDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
};

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const unit = (a: Pt): Pt => {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
};
// Polyline (open) as straight segments, for thin detail strokes.
export const poly = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join("");
