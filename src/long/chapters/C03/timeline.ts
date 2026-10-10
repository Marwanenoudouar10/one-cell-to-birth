import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { HERO } from "../../../theme/layout";
import { LONG_TRANSITION, chapterFrames } from "../../chapters";
import { BEATS } from "./beats";

// Every motion curve of C03, derived from BEATS (never from raw frames).
export const B = BEATS;
export const DUR = chapterFrames("C03");
export const CX = HERO.cx;
export const CY = HERO.cy;

// START/END handoff geometry: zygote core r150, zona outer r ~175.5 at (540, 860).
export const R0 = 150;
export const ZR = R0 * 1.17;

// C02's clock: our frame f is C02 frame f + C02_OFF (the fade overlap).
// Handoff details that move on C02's clock (breath, granules, pronuclei)
// keep running on it, so the crossfade lines up exactly.
export const C02_OFF = chapterFrames("C02") - LONG_TRANSITION;
const BREATH_PHASE = chapterFrames("C01") - LONG_TRANSITION + C02_OFF;

// Breathing +-2% on a 56-frame cycle, phase-locked to C01/C02's zygote. It
// settles before "four" so nothing pulses while "it doesn't grow" is said.
export const breathAt = (f: number) =>
  1 +
  0.02 *
    Math.sin(((f + BREATH_PHASE) / 56) * Math.PI * 2) *
    (1 - tween(f, B.settled, B.four, [0, 1], EASE.inOut));

// Cleavage. GENS[g - 1] is the division that creates stage g (2, 4 ... 64).
// start = earliest furrow start, dur = furrow length, jitter = asynchrony.
export type Gen = { start: number; dur: number; jitter: number };
export const GENS: Gen[] = [
  { start: B.furrow, dur: B.two - 2 - B.furrow, jitter: 0 }, // 1 -> 2  hero split: pinches on "becomes", pops just before "two"
  { start: B.four - 9, dur: 7, jitter: 2 }, // 2 -> 4  2-cell holds 12 f, then splits slightly out of step, all four apart on "four"
  { start: B.eight - 11, dur: 8, jitter: 4 }, // 4 -> 8  5-, 6-, 7-cell moments, eight on "eight"
  { start: B.sixteen - 6, dur: 6, jitter: 3 }, // 8 -> 16 the quick one
  { start: B.each, dur: 6, jitter: 5 }, // 16 -> 32
  { start: B.smaller - 12, dur: 6, jitter: 5 }, // 32 -> 64 lands on "smaller"
];
export const G1 = { start: GENS[0].start, brk: GENS[0].start + GENS[0].dur };

// Anticipation stretch of the zygote along the first split axis (screen x).
// C02 hands over a cell stretched along x (rx = 150 * 1.06, ry = 150 / 1.06);
// it stretches a little more, then the furrow takes over and the stretch
// relaxes into the pop. Use as scale(1 + el, 1 / (1 + el)).
export const EL0 = 0.06;
// The first division axis tilts TILT deg (right end lower) once C02 is gone:
// the cell rolls a little as the cilia carry it. Both chromosome sets and the
// two daughters then sit on a diagonal (two level marks in an oval read as a
// pair of eyes, a level pair of spheres as a body part), and the metaphase
// plate lines up with C02's pronuclei (axis -70 deg): both parental sets
// gather on one plate through where the pronuclei met.
export const TILT = 18;
export const tiltAt = (f: number) => TILT * tween(f, B.settled, G1.start - 4, [0, 1], EASE.inOut);
// The stretch along the (tilted) axis, as an SVG transform.
export const stretchXf = (f: number) => {
  const t = tiltAt(f).toFixed(3);
  const k = 1 + stretchAt(f);
  return `rotate(${t}) scale(${k.toFixed(5)} ${(1 / k).toFixed(5)}) rotate(${(-tiltAt(f)).toFixed(3)})`;
};
// The root's light un-squash (see CellLayer `un`): 1 at the handoff, 0 by
// the time the furrow starts (the pair light takes over from there).
// [sx, sy, axis deg]: undoes the stretch along the same tilted axis.
export const unStretch = (f: number): [number, number, number] => {
  const w = 1 - tween(f, B.settled, G1.start - 8, [0, 1], EASE.inOut);
  const k = 1 + stretchAt(f);
  return [1 + (1 / k - 1) * w, 1 + (k - 1) * w, tiltAt(f)];
};
export const stretchAt = (f: number) => {
  const mid = G1.start + (G1.brk - G1.start) * 0.55;
  const up = tween(f, 0, mid, [EL0, 0.085], EASE.inOut);
  return up * (1 - tween(f, mid, G1.brk + 1, [0, 1], EASE.in));
};

// C02's cytoplasm granules stream into the furrow and fade.
export const grainsOp = (f: number) => 1 - tween(f, B.settled - 4, G1.start + 10, [0, 1], EASE.inOut);

// Pronuclei -> one shared chromosome plate -> two sets pulled apart.
export const PN = {
  meet0: B.furrow - 22, // pronuclei slide together, envelopes dissolve (on "cell")
  meet1: B.furrow - 10,
  plate0: B.furrow - 16, // chromosomes gather on one plate (both tints), spindle forms
  plate1: B.furrow - 6,
  apart0: B.furrow - 2, // anaphase BEFORE the furrow deepens: each pole gets a full mixed set
  apart1: B.furrow + 12,
  gone: G1.brk + 9, // sets settle and fade where the daughters' new nuclei form
};

// Slow 3D tumble of the cluster (it rolls as the cilia carry it along).
export const yawAt = (f: number) => -0.05 + f * 0.0085;
export const pitchAt = (f: number) => 0.3 + 0.06 * Math.sin(f * 0.03);

// Tiny hand-held drift of the hero, exactly zero at both handoffs.
export const driftAt = (f: number) => {
  const env = tween(f, B.settled, B.settled + 40, [0, 1], EASE.inOut) * (1 - tween(f, B.wallsOut, B.end - 4, [0, 1], EASE.inOut));
  return { x: 5 * env * noise2D("c03-dx", f * 0.012, 0.3), y: 4 * env * noise2D("c03-dy", 0.7, f * 0.012) };
};

// Tube walls: fade in once C02 is gone, slide up (we travel down the tube
// toward the womb), fall away before the C04 crossfade.
export const wallsOp = (f: number) =>
  tween(f, B.settled - 3, B.two + 12, [0, 1], EASE.inOut) * (1 - tween(f, B.wallsOut, B.end - 2, [0, 1], EASE.inOut));
// ...and part outward as they go: the narrow tube opens into the womb.
export const wallsOpen = (f: number) => tween(f, B.wallsOut - 8, B.end, [0, 1], EASE.inOut);
export const wallScroll = (f: number, speed: number) => speed * f + 30 * speed * noise2D("c03-flow", f * 0.006, 1.3);

// The same-size ring: a dashed trace closes on "grow", holds as a quiet
// reference through the cascade, then fades.
export const traceAt = (f: number) => tween(f, B.hold + 2, B.grow, [0, 1], EASE.inOut);
export const traceOp = (f: number) =>
  tween(f, B.hold, B.hold + 6, [0, 1], EASE.out) * (1 - tween(f, B.smaller + 4, B.wallsOut + 6, [0, 1], EASE.inOut));

// Translucent layers fade out under C04's incoming copy (the fade keeps this
// chapter opaque underneath), so nothing doubles up and pops at the cut.
export const exitOp = (f: number) => 1 - tween(f, DUR - LONG_TRANSITION, DUR, [0, 1], (t) => t);

// Colour temperature of the cells (0 = gold-white cleavage look).
export const warmth = (_f: number) => 0;
