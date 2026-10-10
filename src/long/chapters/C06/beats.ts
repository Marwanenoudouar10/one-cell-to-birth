// C06 · First heartbeats: every story moment, in CHAPTER-LOCAL frames.
// Re-time by editing ONLY this file: everything animates TO these.
//
//   > Week five: a tube of heart cells starts to squeeze, all by itself.
//   > By week six, a tiny heart is beating.
//
// Word onsets MEASURED from public/vo/long/C06.wav (clipAt 0.493 s): 10 ms
// envelope (voiced <1.2 kHz vs fricative >3.5 kHz) plus a spectrogram for line 2,
// where the speaker stretches "tiny" (its "n" hums 7.12-7.47):
//   Week 0.60 | five 0.77 (vowel 0.93) | a 1.55 | tube 1.77 | cells ~2.26 |
//   starts 2.59 | to 2.97 | squeeze 3.14 ("s" 3.14, "ee" 3.29, devoiced "z" to 3.48) |
//   all 3.53 | by 4.25 | itself 4.47 || By 5.73 | week 5.87 | six 6.02 ("s"; vowel 6.20) |
//   a 6.75 | tiny 6.91 | heart 7.48 | is 7.69 | beating 7.92 (ends ~8.37)
// vo-words.md (= the caption word highlights) is late on line 1 (squeeze 3.42,
// all 3.88) and early on "heart" (7.23); it is close on "beating" (7.81).
import { FPS } from "../../../theme/layout";
import { chapterFrames } from "../../chapters";

const s = (sec: number) => Math.round(sec * FPS);

export const DURATION = chapterFrames("C06"); // 255, incl. both 15-frame overlaps
export const OVERLAP = 15; // LONG_TRANSITION: frames 0-14 fade in over C05, last 15 under C07
// C05's local frame that plays under our frame 0 (its kit wobble clock is f - this).
export const C05_HANDOFF = chapterFrames("C05") - OVERLAP;

export const BPM = 110;
// The beat clock (Scene3's lub-dub): one period in frames, and the lub's peak
// offset inside it. Lub n peaks at BEATS.firstBeat + n * PERIOD + LUB.
export const PERIOD = (60 / BPM) * FPS;
export const LUB = 0.08 * PERIOD;
const FIRST_BEAT = s(3.1); // sync: "squeeze" (3.14): the lub peaks 1.3 frames later, on the "s"
const lub = (n: number) => FIRST_BEAT + n * PERIOD + LUB;
// the lub nearest a word (the beat stays a steady 110/min; it is never nudged)
const lubIndex = (frame: number) => Math.round((frame - FIRST_BEAT - LUB) / PERIOD);

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
  zipStart: s(0.4), // free: the ridges zip from the neck toward both ends
  curlStart: s(0.73), // free: the disc sits up and curls into a small C (kit 4.0 -> 4.6)
  zipHead: s(0.9), // sync: "five" (vowel 0.93): click-sparkle at the head end
  zipTail: s(1.1), // free (end of "five"): click-sparkle at the tail end, tube closed
  curlEnd: s(2.0), // free: small C reached, sac fully resolved (as "tube" lands)

  // --- "a tube of heart cells starts to squeeze,"
  fillStart: s(1.73), // sync: "tube" (1.77): warm light flows into the curved tube; camera pushes in on it
  fillEnd: s(2.73), // free: tube full ("starts")
  holdStart: s(2.4), // free: anticipation, everything dims and goes still (Scene3's hold)
  firstBeat: FIRST_BEAT, // sync: "squeeze" (3.14): heartStarts, squeeze wave + ring flash
  // --- "all by itself."  steady 110/min from firstBeat (a lub lands on "by" 4.25)
  pullBack: s(3.5), // free: once the first ring is out ("all" 3.53) the camera eases back
  wideEnd: s(5.3), // free: ... to Scene3's framing, so the rings cross the whole sac; held to "By"

  // --- "By week six, a tiny heart is beating."
  growStart: s(5.73), // sync: "By" (5.73): grows toward week 6 (eye spot), camera pushes in again
  armBuds: s(6.07), // sync: "six" ("s" 6.02, vowel 6.20): arm buds pop near the shoulders (springy)
  heartSwap: Math.round(lub(6)), // free: on a lub, the tube swells into Scene3's heart bulge
  legBuds: s(6.87), // sync: "tiny" (6.91): leg buds, a beat after the arms
  heartWord: Math.round(lub(lubIndex(s(7.48)))), // sync: "heart" (7.48): that lub (7.51) beats harder
  pushEnd: s(7.87), // free: END framing reached and held, still camera, as "beating" (7.92) comes

  exit: DURATION - OVERLAP, // free: C07 fades in on top; rings and glows fade out (rule 5)
} as const;

// END contract for C07 (C07's frame 0 = our frame BEATS.exit = 240; held from 236):
//   camera (camera.ts): zoom END_ZOOM 1.35, no drift; it looks at
//     (540 + (h.x - 540) * 0.7, 860 + (h.y - 860) * 0.7 + 40), h = embryoAnchors(6, 322, {472.45, 835.3}).heart
//   embryo kit week 6.0 (= Scene3), size 322 at (472.45, 835.3), rotate 0, zip 1,
//     heartLit 1, id "c05" (wobble seed), wobble clock = our frame (C07: its frame + 240)
//   heartbeat: Scene3's lub-dub at 110/min with heartStarts = our frame 93 (C07: -147);
//     lubs peak at 94.3 + n x 16.36 (the "heart" accent on lub 8, f225, has decayed by
//     our f240: < 1% on the pulse, and its ring is back to normal strength from f237)
//   yolk sac + stalk at yolkSuggest(6, 322, place) = Scene3's (806, 902, r 42), no sway
//   world: Scene3's womb, sac (540, 860, r 330), specks, pulse rings, halo, bokeh,
//     CaptionShade. Over our last 15 frames all of those fade 1 -> 0 under C07 (rule 5),
//     so C07 must draw them at full strength from its frame 0; embryo + yolk stay opaque.
