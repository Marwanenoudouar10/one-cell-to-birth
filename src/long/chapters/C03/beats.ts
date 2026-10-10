import { FPS } from "../../../theme/layout";

// C03 "Split without growing": story beats as CHAPTER-LOCAL frames.
// Frame 0 = first frame; frames 0..15 overlap C02's END (fade), frames
// 240..255 overlap C04's START. Re-time to the voice take by editing ONLY
// this file: every motion in the chapter is derived from these numbers.
//
// Real voice (briefs/long/vo-words.md, chapter-local s):
//   One 0.50  cell 1.26  becomes 1.74  two 2.45  four 3.09  eight 3.95 (line ends 4.38)
//   But 4.87  it 5.03  doesn't 5.15  grow 5.43  each 5.65  cell 6.24  just 6.51
//   gets 6.78  smaller 7.05 (line ends 7.85)
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
