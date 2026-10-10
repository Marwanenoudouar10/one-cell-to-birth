import { FPS } from "../../../theme/layout";
import { LONG_TRANSITION, chapterFrames } from "../../chapters";

const s = (sec: number) => Math.round(sec * FPS);

// C01 story moments as chapter-local frames. The voice take re-times this
// chapter by editing ONLY this table: every motion is keyed to these names.
// VO: "It starts with a race. Hundreds of millions set off on an obstacle
// course. Only one gets in."
// Timed to the voice take public/vo/long/C01.wav (clip at local 0.42 s). Line 1
// and 2 words follow data/voTiming.ts. Line 3 follows the measured onsets in the
// wav (silence 5.42-5.80, "Only" 5.80, "one" 6.17, "gets" 6.55, "in." 6.72-7.07):
// voTiming.ts lists that line one word early ("Only" at 5.155, inside "course.").
export const BEATS = {
  raceStart: s(0.15), // free  the swarm bursts in from the bottom (hook, before the voice)
  push: s(0.5), // sync: "It" (0.50)  the camera starts climbing with the swarm
  cruise: s(2.1), // sync: "race." ends (2.13)  full travelling speed
  mesh: s(2.49), // sync: "Hundreds" (2.49)  gate 1, the mucus mesh: most tangle, bounce or fade
  womb: s(3.54), // sync: "set" (3.54)  gate 2, the wide dark womb: many drift off
  gate: s(4.33), // sync: "obstacle" (4.33)  gate 3, the tube entrance: a trickle squeezes through
  rest: s(4.73), // free ("course.")  survivors rest on the ciliated tube wall; the lights begin
  restEnd: s(5.6), // free (the pause)  the last survivor lights up and swims on
  oneOut: s(5.8), // sync: "Only" (5.80)  the gold-rimmed one edges ahead; slow motion eases in
  touch: s(6.53), // sync: "gets" (6.55)  its head touches the zona, glows and slips through
  fuse: s(6.9), // sync: "in." (6.72-7.07, peak 6.85)  fusion: flash, calcium wave; the egg turns gold
} as const;

export const B = BEATS;

// Structure, not story: chapter length and the C02 crossfade (8.0 s).
export const DUR = chapterFrames("C01");
export const END = DUR - LONG_TRANSITION;
