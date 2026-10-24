import { FPS } from "../../../theme/layout";

// C03 "Split without growing": story beats as CHAPTER-LOCAL frames.
// Frame 0 = first frame; frames 0..15 overlap C02's END (fade), frames
// 240..255 overlap C04's START. Re-time to the voice take by editing ONLY
// this file: every motion in the chapter is derived from these numbers.
//
// Real voice (repaired take 2026-10-10, briefs/long/vo-words.md, chapter-local s):
//   One 1.27  cell 1.55  becomes 1.96  two 2.41  four 3.10  eight 3.96 (line ends 4.42)
//   But 4.77  it 4.94  doesn't 5.06  grow 5.35  each 6.24  cell 6.45  just 6.79
//   gets 7.01  smaller 7.17 (line ends 7.92)
const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  settled: s(0.5), // free: crossfade from C02 is over, the zygote is ours
  furrow: s(1.9), // sync: "becomes" (1.96): the first furrow starts to pinch
  two: s(2.4), // sync: "two" (2.41): the first split pops apart
  four: s(3.07), // sync: "four" (3.10): the two cells split again, out of step
  eight: s(3.93), // sync: "eight" (3.96): eight cells
  sixteen: s(4.53), // free: the quick 16 after the line ends (4.42), settled before "But"
  hold: s(4.73), // sync: "But" (4.77): everything settles, the ring trace starts
  grow: s(5.33), // sync: "grow" (5.35): the trace closes the same-size ring
  each: s(6.17), // sync: "each" (6.24): cascade 16 -> 32 starts
  smaller: s(7.13), // sync: "smaller" (7.17): the mulberry morula of 64 is complete
  wallsOut: s(7.4), // free: tube walls fall away (heading out of the tube); END contract
  end: s(8.0), // free: END state held; C04's fade starts here; END contract
} as const;

// END contract seeds (rule 4), NOT timing: the frames whose view angle laid
// out each stage's geometry in lineage.ts (2-cell, 4-cell, then the split
// axes of divisions 3..6). C04 starts on the 64-cell morula built from them,
// so they stay frozen when the beats above are re-timed (they are the old
// beat frames: two, four + 4, and GENS[2..5].start).
export const LAYOUT = {
  two: 73,
  four: 96,
  split: [107, 132, 169, 199], // split[g - 3] for division g = 3..6
} as const;
