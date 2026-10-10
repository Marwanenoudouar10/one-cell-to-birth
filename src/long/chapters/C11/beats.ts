// C11 "The first kick she feels" - every story moment as a LOCAL frame.
// Animate TO these constants; never hard-code beat frames elsewhere. When the
// voice take exists, re-time the film by editing ONLY this file.
//
//   VO: "Around week twenty, its mother feels it move for the first time.
//        A flutter... then, a kick."
//
// Chapter: 9.5 s = 285 frames, enters by a focus pull (frames 0-15 overlap C10).
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  // the focus pull-back from C10's fingertips settles on the whole fetus
  pullEnd: s(1.35), // free
  // W18 lands (chip "sweet potato"): lanugo shimmer runs along the outline + vernix sheen
  w18: s(0.45), // free (tracker W18 lands)
  // W19 lands (chip "mango", 1.95): one slow, low sound ring meets the womb wall
  sound: s(1.85), // free (tracker W19 lands)
  // the ring reaches the ear: ear glow + a tiny startle
  startle: s(2.3), // free
  // crown-rump measuring line draws along the back
  measureCR: s(3.0), // sync: "Around"
  // spring-morph to week-20 proportions, sac grows, camera pulls back (W20 lands 3.45)
  weekTwenty: s(3.42), // sync: "twenty"
  // the measuring line extends from the bottom to the heel (explains the chip's jump)
  measureHeel: s(3.68), // free (follows the W20 chip)
  measureOff: s(4.7), // free
  // the fetus stretches
  stretch: s(4.1), // sync: "its"
  stretchPeak: s(5.15), // sync: "move"
  stretchEnd: s(6.1), // sync: "time"
  // tiny bubble-like ripples across the womb wall: the wall moves for the first time
  flutter: s(6.55), // sync: "flutter"
  // the Scene4 kick: tuck (anticipation) -> snap out -> follow-through
  tuck: s(7.6), // sync: "then"
  kick: s(8.0), // sync: "kick"
  // END handoff: a gentle float
  settle: s(9.0), // free
  end: s(9.5), // free (chapter length)
} as const;
