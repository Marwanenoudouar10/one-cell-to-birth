// The two fingerprints. Both start from the SAME three ridge start points
// (pad centre, tip, crease) and run the same ripple; what differs is how the
// meeting waves settle. Both end as whorls (identical twins' pattern TYPES are
// often alike) but visibly different: A is a plain whorl, tall concentric ovals,
// upright and centred; B a double-loop whorl (two interlocking loops: a diagonal
// S-shaped core), shifted up-left, with sharper deltas. At phone size A reads
// "upright oval rings", B "a tilted S" (a 1-arm spiral read as round rings, too close).
import { P, Pt } from "../geom";

export type Core = { c: Pt; hl: number; tilt: number; spiral: number; off: number };
// warp: sum of sines added to the phase (kx, ky in rad/px, phase, amplitude px)
export type Wave = [kx: number, ky: number, ph: number, amp: number];
export type PrintSpec = {
  id: string;
  core: Core;
  offM: number; // marginal (outline-parallel) system offset
  offK: number; // crease system offset
  bow: number; // how much the crease ridges arch up in the middle
  k: number; // soft-min width px: soft flowing deltas (big) .. sharp (small)
  warp: Wave[];
};

// shared start points (pad px) and their start delays (s)
export const SOURCES: Pt[] = [P(0, -40), P(0, -330), P(0, 232)];
export const DELAYS = [0, 0.1, 0.2];

export const PRINT_A: PrintSpec = {
  id: "A",
  core: { c: P(6, -24), hl: 42, tilt: 5, spiral: 0, off: -16 },
  offM: 0,
  offK: 0,
  bow: 0.0006,
  k: 9,
  warp: [
    [0.021, 0.012, 0.4, 6.5],
    [-0.009, 0.026, 2.1, 5],
    [0.045, -0.031, 4.0, 2.2],
    [-0.052, -0.02, 1.3, 1.6],
  ],
};

export const PRINT_B: PrintSpec = {
  id: "B",
  core: { c: P(-30, -80), hl: 40, tilt: 55, spiral: 2, off: -46 },
  offM: 16,
  offK: -34,
  bow: 0.0015,
  k: 3,
  warp: [
    [-0.017, 0.019, 3.3, 8],
    [0.028, 0.007, 0.9, 5.5],
    [-0.04, 0.038, 5.1, 2.4],
    [0.06, 0.024, 2.6, 1.7],
  ],
};
