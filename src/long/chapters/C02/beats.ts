// C02 "Week two already" — every story moment as a LOCAL frame (frame 0 = the
// first frame of the fade-in over C01). The voice is re-timed by editing ONLY
// this file: every curve in the chapter animates to these constants.
//
// Real voice (briefs/long/vo-words.md, chapter-local s): Doctors 0.80 already
// 1.11 call 1.42 this 1.62 week 1.83 two: 2.03 they 2.24 count 2.44 from 3.01
// the 3.29 last 3.52 period. 3.80 (line ends 4.45; C03's "One" is at our 6.0).
import { FPS } from "../../../theme/layout";
import { chapterFrames } from "../../chapters";

const s = (sec: number) => Math.round(sec * FPS);

export const DUR = chapterFrames("C02"); // 180 = 6.0 s including the 15-frame fade-in

export const BEATS = {
  handoff: s(0.3), // free: C01's white-hot zygote look starts melting into the calm sculpted cell
  pronIn: s(0.4), // free: two pronuclei form at opposite edges and start drifting inward
  pronMeet: s(2.0), // sync: "two" (2.03) — the pronuclei press together side by side (never merge)
  dotsDraw: s(2.2), // sync: "they" (2.24) — a hairline draws itself and 14 day dots pop along it
  pushPeak: s(2.4), // free: the slow push-in peaks, then eases back to frame the dot row
  dotsDone: s(3.0), // free: the last dot has popped (just before "from" 3.01)
  periodDot: s(3.47), // sync: "last" (3.52) — dot 1 glows rose (the last period)
  runStart: s(3.73), // sync: "period" (3.80) — a light leaves dot 1 and counts toward dot 14
  conception: s(4.45), // free: lands as the line ends (no word; C03's "One" is at our 6.0) — dot 14 flares gold, a spark lifts off it
  cellLit: s(4.8), // free: the spark reaches the zygote ("day 14 is this cell"): it lights up, a ring rolls out
  elongate: s(4.85), // free: the zygote starts to stretch sideways (anticipation of the first split)
  dotsFade: s(4.95), // free: the dots and the thread dissolve, left to right, dot 14 last
  endHold: s(5.5), // free: END state reached (elongated, camera at 1.0), held into C03's fade
} as const;
