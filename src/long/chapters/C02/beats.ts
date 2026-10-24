// C02 "Week two already" — every story moment as a LOCAL frame (frame 0 = the
// first frame of the fade-in over C01). The voice is re-timed by editing ONLY
// this file: every curve in the chapter animates to these constants.
//
// Real voice, REPAIRED clip (briefs/long/vo-words.md, 2026-10-10, chapter-local s,
// measured, about +-2 frames): Doctors 0.80 already 1.20 call 1.55 this 1.78
// week 1.91 two: 2.24 | they 3.01 count 3.11 from 3.38 the 3.52 last 3.62
// period. 3.94 (line ends 4.54; C03's "One" is at our 6.0).
// Sync beats land 1-3 frames before their word.
//
// FROZEN: frame 0 (handoff, pronIn) and the END (conception..endHold) are the
// contracts with C01 and C03; re-timing moves only the middle.
import { FPS } from "../../../theme/layout";
import { chapterFrames } from "../../chapters";

const s = (sec: number) => Math.round(sec * FPS);

export const DUR = chapterFrames("C02"); // 180 = 6.0 s including the 15-frame fade-in

export const BEATS = {
  handoff: s(0.3), // free: C01's white-hot zygote look starts melting into the calm sculpted cell
  pronIn: s(0.4), // free: two pronuclei form at opposite edges and start drifting inward
  pronMeet: s(2.2), // sync: "two" (2.24) — the pronuclei press together side by side (never merge)
  pushPeak: s(2.6), // free: the slow push-in peaks once the contact spring has settled (pronMeet + 12), then eases back to frame the dot row
  dotsDraw: s(2.93), // sync: "they" (3.01) — a hairline draws itself and 14 day dots pop along it (the count runs over "count")
  dotsDone: s(3.4), // free: the last dot has popped (on "from" 3.38), just as dot 1 starts turning rose
  periodDot: s(3.57), // sync: "last" (3.62) — dot 1 glows rose (the last period)
  runStart: s(3.87), // sync: "period" (3.94) — a light leaves dot 1 and counts toward dot 14 (last pop has settled)
  conception: s(4.47), // free (frozen END): as "period." ends (line ends 4.54) — dot 14 flares gold, a spark lifts off it
  cellLit: s(4.8), // free (frozen END): the spark reaches the zygote ("day 14 is this cell"): it lights up, a ring rolls out
  elongate: s(4.85), // free (frozen END): the zygote starts to stretch sideways (anticipation of the first split)
  dotsFade: s(4.95), // free (frozen END): the dots and the thread dissolve, left to right, dot 14 last
  endHold: s(5.5), // free (frozen END): END state reached (elongated, camera at 1.0), held into C03's fade
} as const;
