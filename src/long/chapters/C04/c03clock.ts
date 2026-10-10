import { FPS } from "../../../theme/layout";

// VERBATIM COPY of what C03's lineage depends on: C03/beats.ts BEATS, and
// GENS + yawAt + pitchAt from C03/timeline.ts (C03-local frames). Re-copy
// whenever C03 changes, then check C04 frame 0 against C03 frame 240.
const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  settled: s(0.5), // free: crossfade from C02 is over, the zygote is ours
  furrow: s(1.74), // sync: "becomes" (1.74): the first furrow starts to pinch
  two: s(2.42), // sync: "two" (2.45): the first split pops apart
  four: s(3.06), // sync: "four" (3.09): the two cells split again, out of step
  eight: s(3.93), // sync: "eight" (3.95): eight cells
  sixteen: s(4.6), // free: the quick 16 after the line ends (4.38)
  hold: s(4.84), // sync: "But" (4.87): everything settles, the ring trace starts
  grow: s(5.4), // sync: "grow" (5.43): the trace closes the same-size ring
  each: s(5.62), // sync: "each" (5.65): cascade 16 -> 32 starts
  smaller: s(7.02), // sync: "smaller" (7.05): the mulberry morula of 64 is complete
  wallsOut: s(7.4), // free: tube walls fall away (heading out of the tube)
  end: s(8.0), // free: END state held; C04's fade starts here
} as const;
export const B = BEATS;

export type Gen = { start: number; dur: number; jitter: number };
export const GENS: Gen[] = [
  { start: B.furrow, dur: B.two - 2 - B.furrow, jitter: 0 }, // 1 -> 2  hero split: pinches on "becomes", pops just before "two"
  { start: B.four - 9, dur: 7, jitter: 2 }, // 2 -> 4  2-cell holds 12 f, then splits slightly out of step, all four apart on "four"
  { start: B.eight - 11, dur: 8, jitter: 4 }, // 4 -> 8  5-, 6-, 7-cell moments, eight on "eight"
  { start: B.sixteen - 6, dur: 6, jitter: 3 }, // 8 -> 16 the quick one
  { start: B.each, dur: 6, jitter: 5 }, // 16 -> 32
  { start: B.smaller - 12, dur: 6, jitter: 5 }, // 32 -> 64 lands on "smaller"
];

export const yawAt = (f: number) => -0.05 + f * 0.0085;
export const pitchAt = (f: number) => 0.3 + 0.06 * Math.sin(f * 0.03);

// C03 timeline.ts: tilt of the first division axis (deg), used by its 2-cell stage.
export const TILT = 18;
