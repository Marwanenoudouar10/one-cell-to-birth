// Deterministic branching "lung tree" geometry (pure). Built in a normalised
// frame (root at 0,0, growing toward -y, total height ~1), then mapped into
// any space with a point function: the chest x-ray and the magnified inset
// both reuse it. Reveal order = distance from the root along the branches.
import { random } from "remotion";

export type Pt = { x: number; y: number };
export type Seg = { a: Pt; b: Pt; c: Pt; w: number; d0: number; d1: number; depth: number; side: number };
export type Tip = { p: Pt; ang: number; d: number; side: number };
export type Tree = { segs: Seg[]; tips: Tip[]; maxD: number };

type Opts = { seed: string; depth: number; trunk: number; len: number[]; spread: number[]; width: number };

const dirOf = (ang: number): Pt => ({ x: Math.sin(ang), y: -Math.cos(ang) });

export const buildTree = (o: Opts): Tree => {
  const segs: Seg[] = [];
  const tips: Tip[] = [];
  let n = 0;
  const jit = (k: number) => (random(`${o.seed}-${n}-${k}`) - 0.5) * 2;
  const grow = (p: Pt, ang: number, depth: number, w: number, d: number, side: number) => {
    n++;
    const len = (depth === 0 ? o.trunk : o.len[depth - 1]) * (1 + 0.12 * jit(1));
    const v = dirOf(ang);
    const b = { x: p.x + v.x * len, y: p.y + v.y * len };
    // gentle bend: control point pushed sideways a little
    const bend = 0.12 * len * jit(2);
    const c = { x: (p.x + b.x) / 2 - v.y * bend, y: (p.y + b.y) / 2 + v.x * bend };
    segs.push({ a: p, b, c, w, d0: d, d1: d + len, depth, side });
    if (depth >= o.depth) {
      tips.push({ p: b, ang, d: d + len, side });
      return;
    }
    const sp = o.spread[depth] * (1 + 0.15 * jit(3));
    const skew = depth === 0 ? 0 : 0.1 * jit(4);
    const s0 = depth === 0 ? -1 : side;
    const s1 = depth === 0 ? 1 : side;
    grow(b, ang - sp + skew, depth + 1, w * 0.7, d + len, s0);
    grow(b, ang + sp + skew, depth + 1, w * 0.7, d + len, s1);
  };
  grow({ x: 0, y: 0 }, 0, 0, o.width, 0, 0);
  const maxD = Math.max(...tips.map((t) => t.d));
  return { segs, tips, maxD };
};

// The two-lung tree used in the chest (trachea + 3 generations).
export const CHEST_TREE = buildTree({
  seed: "c14-chest",
  depth: 3,
  trunk: 0.22,
  len: [0.3, 0.26, 0.2],
  spread: [1.0, 0.5, 0.42],
  width: 0.06,
});

// Quadratic segment as an SVG path through a mapping function.
export const segPath = (s: Seg, m: (p: Pt) => Pt) => {
  const a = m(s.a);
  const c = m(s.c);
  const b = m(s.b);
  return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${c.x.toFixed(1)},${c.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
};

// A grape-like cluster of round sacs around a tip (normalised units).
export type Sac = { p: Pt; r: number; k: number };
export const cluster = (tip: Pt, ang: number, r: number, count: number, seed: string): Sac[] => {
  const out: Sac[] = [];
  const v = dirOf(ang);
  const base = { x: tip.x + v.x * r * 0.9, y: tip.y + v.y * r * 0.9 };
  for (let i = 0; i < count; i++) {
    const a = ang + (i / count) * Math.PI * 2 + random(`${seed}-a${i}`) * 0.6;
    const rr = r * (0.55 + 0.35 * random(`${seed}-r${i}`));
    const dd = i === 0 ? 0 : r * (0.85 + 0.25 * random(`${seed}-d${i}`));
    const u = dirOf(a);
    out.push({ p: { x: base.x + u.x * dd, y: base.y + u.y * dd }, r: rr, k: i / count });
  }
  return out;
};
