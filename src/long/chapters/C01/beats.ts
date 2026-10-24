import { FPS } from "../../../theme/layout";
import { LONG_TRANSITION, chapterFrames } from "../../chapters";

const s = (sec: number) => Math.round(sec * FPS);

// C01 story moments as chapter-local frames. The voice take re-times this
// chapter by editing ONLY this table: every motion is keyed to these names.
// VO: "It starts with a race. Hundreds of millions set off on an obstacle
// course. Only one gets in."
// Timed to the REPAIRED voice clip public/vo/long/C01.wav (clipAt 0.4; repaired
// 2026-10-10). Chapter-local word onsets from briefs/long/vo-words.md:
//   line 1 (0.51-2.29): It 0.51  starts 0.64  with 1.09  a 1.27  race. 1.47 (ends 2.29)
//   line 2 (2.50-5.47): Hundreds 2.50  of 3.00  millions 3.10  set 3.75  off 3.97
//                       on 4.21  an 4.25  obstacle 4.39  course. 4.93
//   line 3 (5.85-7.19): Only 5.85  one 6.09  gets 6.54  in. 6.80
// A sync beat sits on its word's onset or 1-3 frames before it. womb stays free:
// moved onto "set" (3.75) it would leave the gate only 0.63 s and push the womb's
// wall keys past the throat's (corridor.ts wallOffset needs them in order).
export const BEATS = {
  raceStart: s(0.15), // free  the swarm bursts in from the bottom (hook, before the voice)
  push: s(0.5), // sync: "It" (0.51)  the camera starts climbing with the swarm
  cruise: s(2.1), // free (inside "race." 1.47-2.29)  full travelling speed, settled before the mesh swells at mesh-8
  mesh: s(2.49), // sync: "Hundreds" (2.50)  gate 1, the mucus mesh: most tangle, bounce or fade
  womb: s(3.54), // free (between mesh and gate; dark 3.3-3.9 s spans "millions set")  gate 2, the wide dark womb: many drift off
  gate: s(4.33), // sync: "obstacle" (4.39)  gate 3, the tube entrance: a trickle squeezes through
  rest: s(4.73), // free (before "course." 4.93)  survivors rest on the ciliated tube wall; the lights begin
  restEnd: s(5.6), // free (the pause 5.47-5.85)  the last survivor lights up and swims on
  oneOut: s(5.8), // sync: "Only" (5.85)  the gold-rimmed one edges ahead; slow motion eases in
  touch: s(6.47), // sync: "gets" (6.54)  its head touches the zona (glow full at touch+2, on the word) and slips through
  fuse: s(6.77), // sync: "in." (6.80)  fusion: flash (full at fuse+1, on the word), calcium wave; the egg turns gold
} as const;

export const B = BEATS;

// Structure, not story: chapter length and the C02 crossfade (8.0 s).
export const DUR = chapterFrames("C01");
export const END = DUR - LONG_TRANSITION;
