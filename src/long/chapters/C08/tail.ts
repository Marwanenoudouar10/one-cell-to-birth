// The little tail: the tapering end of the embryo's spine (the last somites and the
// nerve cord carry on into it), in the embryo kit's DESIGN coordinates. What identifies it:
//   1. it continues the curve of the back past the rump, thick at the base, blunt tip
//   2. it curls forward, under the rump, toward the legs (never a straight spike)
//   3. faint somite beads run on into it from the back
// It is drawn just behind the body, so it emerges from under the rump with the same rim
// light. It never wags: its shape follows the (calm) centre line only.
//   grow 0..1 appears while the push-in arrives (C07's kit tail is only a stub)
//   cut  0..1 the tip dissolves back into the rump (gold dust, see Dust.tsx)
import { Pt, add, lerp, mul, perp, rot, smoothPath } from "../../../shared/embryo/math";
import { Pose } from "./kit";

const BEND = 24; // deg, turns the base down from the body's own tangent (clear of the cord)
const CURL = 24; // gentle extra bend along its length, curling forward under the rump
const LEN = 40; // full length (design units) from inside the rump
const M = 14;

export type Bead = { x: number; y: number; rx: number; ry: number; rot: number; o: number };
export type TailGeo = { d: string; tip: Pt; base: Pt; mid: Pt; visible: number; beads: Bead[] };

export const tailGeo = (p: Pose, grow: number, cut: number): TailGeo => {
  const { end, dir, a } = p.tail;
  const base = add(end, mul(dir, -0.6 * a));
  const hidden = 1.3 * a; // length still inside the rump's round cap
  const len = lerp(hidden, lerp(hidden, LEN, grow), 1 - cut);
  const a0 = (Math.atan2(dir.y, dir.x) * 180) / Math.PI + BEND;
  const wb = 0.92 * a;
  const wt = 4.8;
  const spine: Pt[] = [];
  const tans: number[] = [];
  const left: Pt[] = [];
  const right: Pt[] = [];
  let q = base;
  for (let i = 0; i <= M; i++) {
    const u = i / M;
    const ang = a0 - CURL * u * u; // curls toward the belly (counter-clockwise on screen)
    const tan = rot({ x: 1, y: 0 }, ang);
    if (i > 0) q = add(q, mul(tan, len / M));
    spine.push(q);
    tans.push(ang);
    const w = lerp(wb, wt, Math.pow(u, 0.85));
    const n = perp(tan);
    left.push(add(q, mul(n, w)));
    right.push(add(q, mul(n, -w)));
  }
  const tipTan = rot({ x: 1, y: 0 }, tans[M]);
  const tip = add(spine[M], mul(tipTan, wt * 0.95));
  // a blunt, rounded tip (three points round the cap, not a spike)
  const cap = [0.62, 0, -0.62].map((k) => add(add(spine[M], mul(tipTan, wt * 0.95 * Math.cos(k))), mul(perp(tipTan), wt * Math.sin(k))));
  const d = smoothPath([...left, ...cap, ...right.reverse()], true);
  const visible = Math.max(0, len - hidden) / (LEN - hidden);
  // somite beads past the rump, shrinking toward the tip, slightly to the back side
  const beads: Bead[] = [0.4, 0.58, 0.74].map((u, k) => {
    const i = Math.round(u * M);
    const w = lerp(wb, wt, Math.pow(u, 0.85));
    const c = add(spine[i], mul(perp(rot({ x: 1, y: 0 }, tans[i])), 0.25 * w));
    const along = (i * len) / M; // only beads that are out of the rump show
    return { x: c.x, y: c.y, rx: 0.32 * w, ry: 0.55 * w, rot: tans[i], o: Math.max(0, Math.min(1, (along - hidden) / 6)) * (1 - 0.2 * k) };
  });
  return { d, tip, base, mid: spine[Math.round(M * 0.72)], visible, beads };
};
