// C16 "Hello, world" story beats, as chapter-local frames (frame 0 = first frame,
// 0-0.5 s is the focus-pull overlap with C15). Planned times from the storyboard;
// re-time to the voice take by editing ONLY this file. Every other timing in the
// chapter (timeline.ts) is derived from these.
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  // --- womb, week 40 ---
  weekForty: s(1.2), // sync: "forty:"  (W40 lands; head engages, warm sweep)
  fullTerm: s(1.95), // sync: "term."    (hold; first labour wave starts here)
  labour2: s(2.65), // free             (second, slower tightening wave)
  labourEnd: s(3.4), // free             (womb walls settle)

  // --- birth light ---
  bloom: s(3.6), // sync: "Then…"   (white-gold bloom rises from the bottom)
  flashPeak: s(4.6), // sync: "light."   (gold-white wash peaks, walls fully parted)

  // --- lungs insert ---
  breath1: s(5.25), // sync: "first"   (first inhale: air reaches the big branches)
  breath2: s(5.7), // sync: "breath"   (second inhale: air runs halfway down)
  breath3: s(6.1), // sync: "air."     (third inhale: every sac round and bright)
  heartGlow: s(6.0), // free             (one soft gold glow between the lungs)
  cry: s(6.4), // sync: "air."     (at its end: the first cry, a soft light burst)

  // --- the grip ---
  handIn: s(6.65), // free             (newborn's open hand, out of the cry light)
  fingerIn: s(6.8), // sync: "finger"   (starts just before the word)
  fingerRest: s(7.8), // sync: "palm,"    (finger settles in the palm)
  curlA: s(7.9), // sync: "palm,"    (tiny fingers curl, one by one)
  curlB: s(8.8), // free             (last finger and thumb closed)
  squeeze: s(8.75), // sync: "holds"    (squeeze pulse)
  easeBack: s(9.0), // sync: "on"       (the finger eases back a little)
  tighten: s(9.3), // sync: "tight."   (the grip tightens)

  // --- one cell -> a whole new human ---
  pushA: s(10.0), // sync: "One"      (slow push-in, breathing light, specks)
  voiceRing: s(10.6), // free             (one slow warm ring: mum's voice)
  goldOn: s(11.4), // sync: "whole"    (one tiny gold speck lights up)
  goldPeak: s(12.2), // sync: "human."   (speck at its brightest)
  goldOff: s(12.6), // free             (speck dims back into the specks)
  pushB: s(12.9), // free             (push-in eases out)

  // --- hello ---
  hello: s(13.6), // sync: "Hello,"   (warm lift + a last little squeeze)
  world: s(14.1), // sync: "world."   (light settles; hold on the grip)
} as const;
