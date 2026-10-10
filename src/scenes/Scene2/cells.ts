import { spring } from "remotion";
import { FPS } from "../../theme/layout";
import { EASE, tween } from "../../lib/ease";
import { LAST, STAGES } from "./lineage";
import { V3, add3, lerp, lerp3, mul3, smooth, sub3 } from "./geometry";

// The cells alive at frame f (cluster-local 3D). A cell that is mid-cleavage
// appears as two "lobes" linked as partners: they share a smooth-union neck
// (k) that pinches to nothing as the furrow closes, then spring apart.
export type Live = {
  key: string;
  g: number; // stage this cell belongs to
  idx: number; // index inside STAGES[g]
  p: V3;
  r: number;
  nuc: number; // nucleus visibility (dissolves during division)
  birth: number;
  partner?: string;
  k?: number;
  furrow?: number; // 0..1 opacity of the cleavage line
  u?: number; // furrow progress
};

const HERO_SPRING = { damping: 8, stiffness: 170, mass: 0.75 };
const QUICK_SPRING = { damping: 11, stiffness: 230, mass: 0.5 };

export const liveCells = (f: number): Live[] => {
  const root = STAGES[0][0];
  let cur: Live[] = [
    { key: "c", g: 0, idx: 0, p: [0, 0, 0], r: root.r, nuc: tween(f, 10, 22), birth: -999 },
  ];
  for (let g = 1; g <= LAST; g++) {
    const next: Live[] = [];
    for (const c of cur) {
      const L = STAGES[g - 1][c.idx];
      if (c.g !== g - 1 || f < L.start) {
        next.push(c);
        continue;
      }
      const ia = 2 * c.idx;
      const A = STAGES[g][ia];
      const Bc = STAGES[g][ia + 1];
      const mid = mul3(add3(A.p, Bc.p), 0.5);
      const half = sub3(A.p, mid);
      const keyA = `${c.key}a`;
      const keyB = `${c.key}b`;
      const sigEnd = g <= 2 ? 0.88 : 0.8;
      if (f < L.brk) {
        // Furrowing: elongate, pinch, nucleus dissolves.
        const u = (f - L.start) / (L.brk - L.start);
        const e = EASE.inOut(u);
        const M = lerp3(c.p, mid, e);
        const sig = sigEnd * e;
        const k0 = 0.9 * A.r;
        // The neck relaxes as fast as the lobes part, so the cell keeps its
        // size while it elongates (no shrink before the split).
        const k = k0 * Math.pow(1 - e, 1.1);
        const r = lerp(c.r - k0 / 4, A.r * 0.95, e);
        const nuc = c.nuc * (1 - smooth((u - 0.04) / 0.3));
        const furrow = smooth((u - 0.45) / 0.45);
        const shared = { g, r, nuc, k, furrow, u, birth: L.brk };
        next.push({ ...shared, key: keyA, idx: ia, p: add3(M, mul3(half, sig)), partner: keyB });
        next.push({ ...shared, key: keyB, idx: ia + 1, p: sub3(M, mul3(half, sig)), partner: keyA });
      } else {
        // Born: springy snap apart into the packed position, new nuclei appear.
        const v = spring({
          frame: f - L.brk,
          fps: FPS,
          config: g <= 2 ? HERO_SPRING : QUICK_SPRING,
        });
        const sig = sigEnd + (1 - sigEnd) * v;
        const r = A.r * (0.95 + 0.05 * v);
        const nuc = tween(f, L.brk + 2, L.brk + 10);
        const shared = { g, r, nuc, birth: L.brk };
        next.push({ ...shared, key: keyA, idx: ia, p: add3(mid, mul3(half, sig)) });
        next.push({ ...shared, key: keyB, idx: ia + 1, p: sub3(mid, mul3(half, sig)) });
      }
    }
    cur = next;
  }
  return cur;
};
