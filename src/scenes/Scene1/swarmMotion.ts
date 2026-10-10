import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../lib/ease";
import { warp } from "./camera";
import { B, END } from "./constants";
import { Vec, add, bez, bezTan, clamp, mul, norm, rot, sub } from "./math";
import { SpermPose } from "./Sperm";

export type LayerId = "far" | "mid" | "near";

// Everything needed to animate one sperm (built once in swarmSpecs.ts).
export type Spec = {
  key: string;
  layer: LayerId;
  final: boolean; // reaches the corona and waits (then gets blocked)
  p0: Vec;
  p1: Vec;
  p2: Vec;
  len: number;
  v: number; // cruise speed, layer units per story-frame
  t0: number;
  omega: number;
  phi: number;
  amp: number;
  side: number;
  turn: number;
  wander: number;
  size: number;
  thick: number;
  fHit: number; // frame the zona shockwave reaches it
  pushFrom: Vec;
  push: number;
  spin: number;
};

// Start-of-race burst: extra distance front-loaded into the first frames.
const BURST = 16;
const BURST_K = 12;
export const ramp = (tau: number) => tau + BURST * (1 - Math.exp(-tau / BURST_K));
// Inverse of ramp (Newton; ramp is concave, so it climbs to the root from below).
export const rampInv = (r: number) => {
  let tau = Math.max(0, r - BURST);
  for (let k = 0; k < 8; k++) tau -= (ramp(tau) - r) / (1 + (BURST / BURST_K) * Math.exp(-tau / BURST_K));
  return Math.max(0, tau);
};

// Once the winner pulls clear, the rest of the field dims so the eye follows it.
export const packDim = (f: number) => 1 - 0.45 * tween(f, B.oneWins - 24, B.oneWins, [0, 1], EASE.inOut);

export const SOFT = 150; // finalists decelerate over this distance
const DRIFT = 55; // tired sperm coast this far after losing pace

const softcap = (d: number, L: number, b: number) =>
  d < L - b ? d : L - b * Math.exp(-(d - L + b) / b);

type Core = { pos: Vec; tan: Vec; over: number };

// Path position at story time T, before wander and shock reaction.
export const core = (s: Spec, T: number): Core => {
  const dist = s.v * ramp(Math.max(0, T - s.t0));
  if (s.final) {
    const u = softcap(dist, s.len, SOFT) / s.len;
    return { pos: bez(s.p0, s.p1, s.p2, u), tan: bezTan(s.p0, s.p1, s.p2, u), over: 0 };
  }
  if (dist <= s.len) {
    const u = dist / s.len;
    return { pos: bez(s.p0, s.p1, s.p2, u), tan: bezTan(s.p0, s.p1, s.p2, u), over: 0 };
  }
  // Out of steam: coast, veer off to the side, fade (they "fall behind").
  const e = dist - s.len;
  const k = 1 - Math.exp(-e / DRIFT);
  const end = norm(sub(s.p2, s.p1));
  const pos = add(s.p2, mul(rot(end, s.side * s.turn * k * 0.5), DRIFT * k));
  return { pos, tan: rot(end, s.side * s.turn * k), over: e / s.v };
};

export const spermAt = (s: Spec, f: number): SpermPose => {
  let T = warp(f);
  let hit = 0;
  if (f >= s.fHit) {
    const Th = warp(s.fHit);
    T = Th + 3 * (1 - Math.exp(-(T - Th) / 3));
    hit = tween(f, s.fHit, s.fHit + 24, [0, 1], EASE.out);
  }
  const c = core(s, T);
  const tn = norm(c.tan);
  const w = noise2D(`${s.key}w`, T * 0.018, 0) * s.wander;
  let pos = add(c.pos, { x: -tn.y * w, y: tn.x * w });
  // finalists stuck in the corona keep butting forward and backing off
  const ar = s.final ? clamp((s.v * ramp(Math.max(0, T - s.t0)) - (s.len - SOFT)) / SOFT) : 0;
  if (ar > 0) pos = add(pos, mul(tn, noise2D(`${s.key}j`, T * 0.07, 2) * 9 * ar));
  let ang = Math.atan2(tn.y, tn.x) + noise2D(`${s.key}a`, T * 0.035, 1) * (0.12 + 0.12 * ar);
  if (hit > 0) {
    pos = add(pos, mul(norm(sub(pos, s.pushFrom)), s.push * hit));
    ang += s.spin * hit;
  }
  const tired = clamp(c.over / 22);
  let op = 1 - tween(c.over, 3, 26, [0, 1], EASE.inOut);
  op *= 1 - tween(f, s.fHit + 2, s.fHit + 22, [0, 1], EASE.in);
  op *= 1 - tween(f, B.fertilise + 4, END - 6, [0, 1], EASE.inOut); // only the zygote remains
  return {
    x: pos.x,
    y: pos.y,
    ang: (ang * 180) / Math.PI,
    size: s.size,
    phase: s.omega * (T - 0.45 * Math.max(0, c.over)) + s.phi,
    amp: s.amp * (1 - 0.35 * tired) * (1 - 0.6 * hit),
    op,
    thick: s.thick,
  };
};
