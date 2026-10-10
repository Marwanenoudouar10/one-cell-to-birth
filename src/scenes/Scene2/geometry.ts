// Small vector + polygon toolkit used to draw soft, packed cells.

export type V3 = [number, number, number];
export type Pt = [number, number];

export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul3 = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const len3 = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const norm3 = (a: V3): V3 => mul3(a, 1 / (len3(a) || 1));
export const lerp3 = (a: V3, b: V3, t: number): V3 => add3(a, mul3(sub3(b, a), t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

// Yaw about Y, then pitch about X (and the exact inverse).
export const rot = ([x, y, z]: V3, yaw: number, pitch: number): V3 => {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
};
export const unrot = ([x, y, z]: V3, yaw: number, pitch: number): V3 => {
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y1 = y * cp + z * sp;
  const z1 = -y * sp + z * cp;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  return [x * cy - z1 * sy, y1, x * sy + z1 * cy];
};

// Gentle perspective: nearer cells a touch bigger.
const FOCAL = 1600;
export const project = (p: V3) => {
  const k = FOCAL / (FOCAL - p[2]);
  return { x: p[0] * k, y: p[1] * k, z: p[2], k };
};

// Polynomial smooth-min: blends two distance fields (the cleavage "neck").
export const smin = (a: number, b: number, k: number) => {
  if (k <= 0.01) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

// Distance along a ray (from `from`, direction u) to the first exit of a
// signed-distance field. Coarse march then bisection, robust to two lobes.
export const rayExit = (sdf: (x: number, y: number) => number, from: Pt, u: Pt, tMax: number) => {
  const steps = 14;
  let lo = 0;
  let hi = tMax;
  for (let i = 1; i <= steps; i++) {
    const t = (tMax * i) / steps;
    if (sdf(from[0] + u[0] * t, from[1] + u[1] * t) >= 0) {
      hi = t;
      break;
    }
    lo = t;
    if (i === steps) return tMax;
  }
  for (let i = 0; i < 12; i++) {
    const m = (lo + hi) / 2;
    if (sdf(from[0] + u[0] * m, from[1] + u[1] * m) < 0) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
};

// Polygon whose edges remember where they came from: -1 = the cell's own
// membrane, otherwise the id of the half-plane that cut it (a contact face).
export type Poly = { pts: Pt[]; tags: number[] };
export type HalfPlane = { nx: number; ny: number; c: number; id: number };

// Sutherland–Hodgman: keep the side where nx*x + ny*y <= c.
export const clip = (poly: Poly, hp: HalfPlane): Poly => {
  const { pts, tags } = poly;
  const n = pts.length;
  const out: Pt[] = [];
  const outTags: number[] = [];
  if (n === 0) return poly;
  const side = (p: Pt) => hp.nx * p[0] + hp.ny * p[1] - hp.c;
  for (let i = 0; i < n; i++) {
    const P = pts[i];
    const Q = pts[(i + 1) % n];
    const dP = side(P);
    const dQ = side(Q);
    const cut = (): Pt => {
      const t = dP / (dP - dQ);
      return [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t];
    };
    if (dP <= 0) {
      out.push(P);
      outTags.push(tags[i]);
      if (dQ > 0) {
        out.push(cut());
        outTags.push(hp.id);
      }
    } else if (dQ <= 0) {
      out.push(cut());
      outTags.push(tags[i]);
    }
  }
  return { pts: out, tags: outTags };
};

export const areaCentroid = (pts: Pt[]) => {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    const cr = x0 * y1 - x1 * y0;
    a += cr;
    cx += (x0 + x1) * cr;
    cy += (y0 + y1) * cr;
  }
  a *= 0.5;
  if (Math.abs(a) < 1e-6) return { area: 0, x: pts[0]?.[0] ?? 0, y: pts[0]?.[1] ?? 0 };
  return { area: Math.abs(a), x: cx / (6 * a), y: cy / (6 * a) };
};

const n1 = (v: number) => (Math.round(v * 10) / 10).toString();

export const closedPath = (pts: Pt[]) =>
  pts.length ? `M${pts.map((p) => `${n1(p[0])} ${n1(p[1])}`).join("L")}Z` : "";

// Open sub-paths made only of the edges whose tag passes `keep`.
export const edgePath = (poly: Poly, keep: (tag: number) => boolean) => {
  const { pts, tags } = poly;
  const n = pts.length;
  if (!n) return "";
  if (tags.every(keep)) return closedPath(pts);
  const start = tags.findIndex((t) => !keep(t));
  let d = "";
  let open = false;
  for (let s = 1; s <= n; s++) {
    const i = (start + s) % n;
    const j = (i + 1) % n;
    if (keep(tags[i])) {
      if (!open) d += `M${n1(pts[i][0])} ${n1(pts[i][1])}`;
      d += `L${n1(pts[j][0])} ${n1(pts[j][1])}`;
      open = true;
    } else open = false;
  }
  return d;
};
