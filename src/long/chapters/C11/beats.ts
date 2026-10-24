// C11 "The first kick she feels" - every story moment as a LOCAL frame.
// Animate TO these constants; never hard-code beat frames elsewhere. Re-timing
// the film means editing ONLY this file.
//
//   VO (real take, chapter-local s):
//     "Around 3.00  week 3.30  twenty, 3.51  its 4.19  mother 4.36  feels 4.68
//      it 4.97  move 5.05  for 5.44  the 5.59  first 5.70  time. 6.14"
//     "A 7.04  flutter... 7.09  then, 8.11  a 8.67  kick. 8.81"
//   Tracker (chapters.ts weekKeys 0.55 / 1.8 / 3.08; each number lands ~0.45 s
//   after its key, measured on the render): WEEK 18 at f25, 19 at f61, 20 at f100.
//
// Chapter: 9.5 s = 285 frames. Enters by a focus pull (frames 0-14 overlap C10);
// C12 enters by a focus pull over our frames 270-284.
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  // the focus pull-back from C10's fingertips settles on the whole fetus
  pullEnd: s(1.3), // free (f39)
  // W18 lands (chip "sweet potato"): lanugo shimmer runs along the outline + vernix sheen
  w18: 25, // free (tracker WEEK 18 visibly lands at f25)
  // W19 lands (chip "mango"): one slow, low sound ring meets the womb wall
  sound: 57, // free (tracker WEEK 19 rolls f56-61: the ring is in the wall as it lands)
  // the ring reaches the ear: ear glow + a tiny startle
  startle: s(2.3), // free (f69, storyboard)
  // crown-rump measuring line draws along the back
  measureCR: s(2.97), // sync: "Around" (3.00 -> f89)
  // spring-morph to week-20 proportions, sac grows, camera pulls back
  weekTwenty: s(3.44), // sync: "twenty" (3.51 -> f103; tracker WEEK 20 lands f100)
  // the measuring line extends from the bottom to the heel (explains the chip's jump)
  measureHeel: s(3.62), // free (f109, after the "banana · 25.6 cm" chip lands at f100)
  measureOff: s(4.55), // free (f137: the line is gone by f149, early in the stretch)
  // the fetus stretches
  stretch: s(4.15), // sync: "its" (4.19 -> f125)
  stretchPeak: s(5.0), // sync: "move" (5.05 -> f150)
  stretchEnd: s(6.1), // sync: "time" (6.14 -> f183)
  // tiny bubble-like ripples across the womb wall: the wall moves for the first time
  flutter: s(7.04), // sync: "flutter" (7.09 -> f211)
  // the Scene4 kick: tuck (anticipation) -> snap out -> follow-through
  tuck: s(8.07), // sync: "then" (8.11 -> f242)
  kick: s(8.73), // sync: "kick" (8.81 -> f262; the foot meets the wall at kick + 2 = f264)
  // END handoff: the follow-through settles into a gentle float under C12's focus pull
  exit: 270, // free (C12's focus pull starts: end - LONG_TRANSITION)
  settle: s(9.2), // free (f276)
  end: s(9.5), // free (chapter length, f285)
} as const;
