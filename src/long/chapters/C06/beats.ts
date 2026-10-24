// C06 · First heartbeats: every story moment, in CHAPTER-LOCAL frames.
// Re-time by editing ONLY this file: everything animates TO these.
//
//   > Week five: a tube of heart cells starts to squeeze, all by itself.
//   > By week six, a tiny heart is beating.
//
// Word onsets (chapter-local s) from the REPAIRED clip (2026-10-10; clipAt 0.541),
// briefs/long/vo-words.md, measured to about +-2 frames:
//   Week 0.62 | five 0.80 | a 1.77 | tube 1.90 | of 2.19 | heart 2.27 | cells 2.58 |
//   starts 2.84 | to 3.23 | squeeze 3.33 | (pause) all 4.26 | by 4.41 | itself 4.74 ||
//   By 5.74 | week 5.88 | six 6.05 | a 6.76 | tiny 6.92 | heart 7.42 | is 7.74 | beating 7.93
// (The older take's times in this header were 0.1-0.7 s off on line 1: "all" is 4.26, not 3.53.)
import { FPS } from "../../../theme/layout";
import { chapterFrames } from "../../chapters";

const s = (sec: number) => Math.round(sec * FPS);

export const DURATION = chapterFrames("C06"); // 255, incl. both 15-frame overlaps
export const OVERLAP = 15; // LONG_TRANSITION: frames 0-14 fade in over C05, last 15 under C07
// C05's local frame that plays under our frame 0 (its kit wobble clock is f - this).
export const C05_HANDOFF = chapterFrames("C05") - OVERLAP;

export const BPM = 110;
// The beat clock (Scene3's lub-dub): one period in frames, and the lub's peak
// offset inside it. The STEADY clock is frozen by the END contract (C07 runs it):
// heartStarts = CLOCK0, lub n peaks at CLOCK0 + n * PERIOD + LUB.
export const PERIOD = (60 / BPM) * FPS;
export const LUB = 0.08 * PERIOD;
export const CLOCK0 = s(3.1); // free: END contract (C07: -147); never moves
// The FIRST beat lands on "squeeze" (3.33), 5 frames after the steady clock's lub 0,
// so the first beats run a little quick (up to ~125/min) and the clock catches up
// smoothly over CATCH_UP frames; from lub 3 on (f 143) it IS the steady clock.
const FIRST_BEAT = s(3.27); // sync: "squeeze" (3.33 = f 99.9): its lub peaks at f 99.3
export const CATCH_UP = 3 * PERIOD;
const lub = (n: number) => CLOCK0 + n * PERIOD + LUB; // steady clock: valid for n >= 3
// the lub nearest a word (the beat stays a steady 110/min; it is never nudged)
const lubIndex = (frame: number) => Math.round((frame - CLOCK0 - LUB) / PERIOD);

// C05's END contract (src/long/chapters/C05/beats.ts "END contract for C06"),
// copied as numbers: our frame 0 must BE its last frame.
//   camera zoom 1.3 looking at (540, 860), drift 0
//   kit embryo week 4.0, size 300 at (540, 860), zip 0, heartLit 0, id "c05",
//     wobble clock = our frame (C05 runs it as f - C05_HANDOFF)
//   yolk sac + stalk at yolkSuggest(4.0, 300, {540, 860})
//   backdrop: early look, r 390, warmth 0.12, folds 0.18, opacity 0.35, seed "c05wall"
//   dormant tube: kit heart anchor + drop, rot cardiac.rot + spin,
//     scale k * max(0.72, bulge) * 0.95 * grow, blur 2.2, opacity vis
export const C05_END = {
  zoom: 1.3,
  look: { x: 540, y: 860 },
  embryo: { week: 4.0, size: 300, x: 540, y: 860 },
  tube: { grow: 1.4, vis: 0.8, drop: { x: 4, y: 12 }, blur: 2.2 },
  backdrop: { warmth: 0.12, folds: 0.18, r: 390, opacity: 0.35 },
} as const;

export const BEATS = {
  // --- START = C05 END (kit 4.0, size 300 at 540,860, zip 0, dim tube), held through the fade-in
  worldIn: s(0.13), // free: C05's backdrop gives way to Scene3's womb, the sac resolves round it
  zipStart: s(0.27), // free: the ridges zip from the neck toward both ends
  curlStart: s(0.73), // free: the disc sits up and curls into a small C (kit 4.0 -> 4.6)
  zipHead: s(0.77), // sync: "five" (0.80): click-sparkle at the head end
  zipTail: s(0.97), // free (inside "five"): click-sparkle at the tail end, tube closed
  curlEnd: s(2.0), // free: small C reached, sac fully resolved (as "tube" 1.90 lands)

  // --- "a tube of heart cells starts to squeeze,"
  // the fill eases in (EASE.inOut), so it starts 9 f before the word: the warm front is
  // entering on "tube" (fill 0.11 at f 57) and the red tube reads during it (0.32 at f 61)
  fillStart: s(1.6), // sync: "tube" (1.90): warm light flows into the curved tube; camera pushes in on it
  fillEnd: s(2.6), // free: tube full (by "cells" 2.58), held 20 f before the first beat
  holdStart: s(2.57), // free: anticipation, everything dims and goes still (Scene3's hold), 0.7 s before the beat
  firstBeat: FIRST_BEAT, // sync: "squeeze" (3.33): heartStarts, squeeze wave + ring flash
  // --- (pause) "all by itself."  110/min from firstBeat (lub 2 lands on "all" 4.26)
  pullBack: s(3.67), // free: 12 f after the first beat, once its ring is out, the camera eases back
  wideEnd: s(5.3), // free: ... to Scene3's framing, so the rings cross the whole sac; held to "By"

  // --- "By week six, a tiny heart is beating."
  growStart: s(5.73), // sync: "By" (5.74): grows toward week 6 (eye spot), camera pushes in again
  armBuds: s(6.07), // sync: "six" (6.05): arm buds pop near the shoulders (springy)
  heartSwap: Math.round(lub(6)), // free: on a lub (f 192), the tube swells into Scene3's heart bulge
  legBuds: s(6.87), // sync: "tiny" (6.92): leg buds, a beat after the arms
  heartWord: Math.round(lub(lubIndex(s(7.42)))), // sync: "heart" (7.42): that lub (7.51, frozen grid) beats harder; its ramp starts at 7.41
  pushEnd: s(7.87), // free: END framing reached and held, still camera, as "beating" (7.93) comes

  exit: DURATION - OVERLAP, // free: C07 fades in on top; rings and glows fade out (rule 5)
} as const;

// END contract for C07 (C07's frame 0 = our frame BEATS.exit = 240; held from 236):
//   camera (camera.ts): zoom END_ZOOM 1.35, no drift; it looks at
//     (540 + (h.x - 540) * 0.7, 860 + (h.y - 860) * 0.7 + 40), h = embryoAnchors(6, 322, {472.45, 835.3}).heart
//   embryo kit week 6.0 (= Scene3), size 322 at (472.45, 835.3), rotate 0, zip 1,
//     heartLit 1, id "c05" (wobble seed), wobble clock = our frame (C07: its frame + 240)
//   heartbeat: Scene3's lub-dub at 110/min with heartStarts = our frame 93 = CLOCK0 (C07: -147);
//     lubs peak at 94.3 + n x 16.36 from lub 3 on (lubs 0-2 catch up from f 99.3,
//     see CLOCK0; the "heart" accent on lub 8, f225, has decayed by
//     our f240: < 1% on the pulse, and its ring is back to normal strength from f237)
//   yolk sac + stalk at yolkSuggest(6, 322, place) = Scene3's (806, 902, r 42), no sway
//   world: Scene3's womb, sac (540, 860, r 330), specks, pulse rings, halo, bokeh,
//     CaptionShade. Over our last 15 frames all of those fade 1 -> 0 under C07 (rule 5),
//     so C07 must draw them at full strength from its frame 0; embryo + yolk stay opaque.
