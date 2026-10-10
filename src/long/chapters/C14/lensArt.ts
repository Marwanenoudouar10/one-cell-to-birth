// Hand-placed art for the magnified lung inset, in a canonical lens frame:
// lens centre (0,0), radius LENS_R, the bronchiole entering from the bottom.
// The lens rotates these POINTS (not the drawing) toward the real source so
// the house light on every sac stays upper-left. Pure + deterministic.
import { random } from "remotion";

export type Pt = { x: number; y: number };
export const LENS_R = 158;

// branches as quadratic segments: a -> (c) -> b, width in px, d = distance
// from the root (for the reveal and the travelling pulse)
export type Branch = { a: Pt; c: Pt; b: Pt; w: number; d0: number; d1: number };
const len = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);

const RAW: { a: Pt; c: Pt; b: Pt; w: number; parent: number }[] = [
  { a: { x: 14, y: 176 }, c: { x: 2, y: 110 }, b: { x: 4, y: 58 }, w: 24, parent: -1 }, // 0 trunk
  { a: { x: 4, y: 58 }, c: { x: -20, y: 30 }, b: { x: -44, y: 8 }, w: 16, parent: 0 }, // 1 left
  { a: { x: 4, y: 58 }, c: { x: 30, y: 36 }, b: { x: 42, y: -2 }, w: 16, parent: 0 }, // 2 right
  { a: { x: -44, y: 8 }, c: { x: -62, y: -14 }, b: { x: -78, y: -44 }, w: 11, parent: 1 }, // 3 -> A
  { a: { x: -44, y: 8 }, c: { x: -70, y: 16 }, b: { x: -96, y: 34 }, w: 10, parent: 1 }, // 4 -> D
  { a: { x: 42, y: -2 }, c: { x: 34, y: -42 }, b: { x: 14, y: -86 }, w: 11, parent: 2 }, // 5 -> B
  { a: { x: 42, y: -2 }, c: { x: 70, y: -12 }, b: { x: 92, y: -38 }, w: 10, parent: 2 }, // 6 -> C
];

export const BRANCHES: Branch[] = (() => {
  const out: Branch[] = [];
  RAW.forEach((r) => {
    const d0 = r.parent < 0 ? 0 : out[r.parent].d1;
    out.push({ a: r.a, c: r.c, b: r.b, w: r.w, d0, d1: d0 + len(r.a, r.b) });
  });
  return out;
})();
export const MAX_D = Math.max(...BRANCHES.map((b) => b.d1));

// grape-like bunches at the twig ends: one sac in the middle, a ring around
export type Sac = { p: Pt; c: Pt; r: number; d: number; order: number };
const BUNCHES = [
  { c: { x: -84, y: -58 }, r: 20, br: 3 },
  { c: { x: 12, y: -100 }, r: 21, br: 5 },
  { c: { x: 100, y: -48 }, r: 19, br: 6 },
  { c: { x: -104, y: 38 }, r: 16, br: 4 },
];

export const SACS: Sac[] = BUNCHES.flatMap((bn, i) => {
  const d = BRANCHES[bn.br].d1;
  const ring = Array.from({ length: 6 }, (_, k) => {
    const a = (k / 6) * Math.PI * 2 + i * 0.7 + (random(`c14-sa${i}${k}`) - 0.5) * 0.4;
    const rr = bn.r * (0.82 + 0.22 * random(`c14-sr${i}${k}`));
    const dd = bn.r * (1.42 + 0.16 * random(`c14-sd${i}${k}`));
    return { p: { x: bn.c.x + Math.cos(a) * dd, y: bn.c.y + Math.sin(a) * dd }, c: bn.c, r: rr, d: d + dd * 0.6, order: 0 };
  });
  // paint far-to-near: lower-right sacs first, the centre (front) last
  ring.sort((p, q) => q.p.x + q.p.y - (p.p.x + p.p.y));
  return [...ring, { p: bn.c, c: bn.c, r: bn.r * 1.05, d, order: 1 }];
});

// rotate a canonical point by deg about the lens centre
export const rotPt = (p: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return { x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) };
};
