import { random } from "remotion";
import { Pt, smoothClosed } from "../geometry";

// Deterministic geometry of the newborn's two bronchial trees (front view, the
// baby faces us: its right lung is on the viewer's left and is the larger one;
// its left lung, on the viewer's right, has the notch where the heart sits).
// All coordinates are screen px. `s` = distance from the top of the windpipe,
// normalised over both trees (deepest sac = 1), so an "air front" value can
// run down the branches.
//
// Space-filling growth: each lung gets air-sac targets spread evenly over its
// lobe; a branch grows toward the centre of its group of targets, then the group
// splits in two across the growth direction, and so on, until one target is left.

export type Branch = { a: Pt; c: Pt; b: Pt; w0: number; w1: number; s0: number; s1: number; depth: number };
export type Sac = { x: number; y: number; r: number };
export type Tip = { p: Pt; dir: number; s: number; sacs: Sac[]; drop: Pt; seed: number };
export type Tree = { branches: Branch[]; tips: Tip[] };

export const TRACHEA = { top: [540, 220] as Pt, carina: [540, 612] as Pt, w: 34 };
export const HEART: Pt = [588, 1010];

const LOBE_PTS: Record<"L" | "R", Pt[]> = {
  L: [[452, 470], [384, 486], [306, 560], [236, 680], [188, 830], [170, 990], [186, 1130], [240, 1214], [330, 1222], [418, 1188], [480, 1150], [506, 1020], [508, 860], [502, 700], [486, 560]],
  R: [[628, 470], [700, 488], [778, 562], [846, 690], [890, 840], [906, 1000], [888, 1140], [830, 1214], [748, 1218], [700, 1160], [672, 1080], [632, 1030], [596, 920], [580, 760], [590, 600]],
};
export const LOBES = { L: smoothClosed(LOBE_PTS.L), R: smoothClosed(LOBE_PTS.R) };

const inPoly = (poly: Pt[], p: Pt) => {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
};
const edgeDist = (poly: Pt[], p: Pt) => {
  let d = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j];
    const [bx, by] = poly[i];
    const t = Math.max(0, Math.min(1, ((p[0] - ax) * (bx - ax) + (p[1] - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
    d = Math.min(d, Math.hypot(p[0] - (ax + t * (bx - ax)), p[1] - (ay + t * (by - ay))));
  }
  return d;
};

// jittered grid of sac targets inside the lobe, clear of its edge
const targets = (side: "L" | "R"): Pt[] => {
  const poly = LOBE_PTS[side];
  const out: Pt[] = [];
  const step = 66;
  for (let y = 480; y < 1240; y += step * 0.87) {
    const row = Math.round((y - 480) / (step * 0.87));
    for (let x = 150 + (row % 2) * step * 0.5; x < 930; x += step) {
      const id = `c16-tg-${side}-${row}-${Math.round(x)}`;
      const p: Pt = [x + (random(`${id}x`) - 0.5) * 26, y + (random(`${id}y`) - 0.5) * 26];
      if (inPoly(poly, p) && edgeDist(poly, p) > 30 && p[1] > 520) out.push(p);
    }
  }
  return out;
};

const centroid = (ps: Pt[]): Pt => [ps.reduce((a, p) => a + p[0], 0) / ps.length, ps.reduce((a, p) => a + p[1], 0) / ps.length];
const polar = (p: Pt, ang: number, len: number): Pt => [p[0] + Math.cos(ang) * len, p[1] + Math.sin(ang) * len];

const grow = (side: "L" | "R"): Tree => {
  const branches: Branch[] = [];
  const tips: Tip[] = [];
  let n = 0;
  const seg = (a: Pt, b: Pt, w0: number, w1: number, s: number, depth: number) => {
    const id = `c16-lb-${side}-${n++}`;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const bend = (random(`${id}-bend`) - 0.5) * len * 0.2;
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    branches.push({ a, b, c: [m[0] - Math.sin(ang) * bend, m[1] + Math.cos(ang) * bend], w0, w1, s0: s, s1: s + len, depth });
    return { len, ang, id };
  };
  const build = (start: Pt, group: Pt[], w: number, depth: number, s: number) => {
    const w1 = Math.max(5, w * 0.8);
    if (group.length === 1) {
      const { len, ang, id } = seg(start, group[0], w, w1, s, depth);
      const seed = random(`${id}-tip`);
      // an irregular grape bunch, leaning forward along the branch
      const sacs: Sac[] = [{ x: group[0][0], y: group[0][1], r: 10.5 + seed * 2.5 }];
      const count = 3 + Math.floor(seed * 3);
      for (let k = 0; k < count; k++) {
        const t = ang + (random(`${id}-sa${k}`) - 0.5) * 2.6;
        const p = polar(group[0], t, 9 + random(`${id}-so${k}`) * 9);
        sacs.push({ x: p[0], y: p[1], r: 7.5 + random(`${id}-sr${k}`) * 4.5 });
      }
      sacs.sort((p, q) => p.y - q.y);
      tips.push({ p: group[0], dir: ang, s: s + len, sacs, drop: polar(group[0], ang + (seed - 0.5) * 1.2, 40 + seed * 20), seed });
      return;
    }
    const c = centroid(group);
    const f = depth === 0 ? 0.42 : 0.5;
    const node: Pt = [start[0] + (c[0] - start[0]) * f, start[1] + (c[1] - start[1]) * f];
    const { len, ang } = seg(start, node, w, w1, s, depth);
    // split the group across the growth direction (median cut)
    const px = -Math.sin(ang);
    const py = Math.cos(ang);
    const sorted = [...group].sort((p, q) => (p[0] - node[0]) * px + (p[1] - node[1]) * py - ((q[0] - node[0]) * px + (q[1] - node[1]) * py));
    const half = Math.ceil(sorted.length / 2);
    build(node, sorted.slice(0, half), w1, depth + 1, s + len);
    build(node, sorted.slice(half), w1 * 0.94, depth + 1, s + len);
  };
  // the baby's right main bronchus (viewer's left) is the wider one
  build(TRACHEA.carina, targets(side), side === "L" ? 30 : 27, 0, TRACHEA.carina[1] - TRACHEA.top[1]);
  return { branches: branches.sort((x, y) => x.depth - y.depth), tips };
};

// normalise path distance over both trees so the deepest sac sits at s = 1
const RAW = { L: grow("L"), R: grow("R") };
const MAX = Math.max(...[...RAW.L.tips, ...RAW.R.tips].map((t) => t.s));
const norm = (t: Tree): Tree => ({
  branches: t.branches.map((br) => ({ ...br, s0: br.s0 / MAX, s1: br.s1 / MAX })),
  tips: t.tips.map((tp) => ({ ...tp, s: tp.s / MAX })),
});
export const TREES = { L: norm(RAW.L), R: norm(RAW.R) };
export const TRACHEA_S1 = (TRACHEA.carina[1] - TRACHEA.top[1]) / MAX;
