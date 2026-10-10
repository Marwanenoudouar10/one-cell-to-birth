// C05 · Three layers: every story moment, in CHAPTER-LOCAL frames.
// Re-time by editing ONLY this file: everything animates TO these.
//
// Word onsets MEASURED from public/vo/long/C05.wav (clipAt 0.276 s; 10 ms envelope,
// voiced <1.2 kHz vs fricative >3.5 kHz bands). vo-words.md spreads words by length
// inside each phrase and is up to 0.2 s off here (heart 5.95, lungs 7.82, skin 5.00):
//   Week 0.39 | four 0.58 (vowel 0.76) | the 1.53 | embryo 1.84 | forms 2.08 (vowel 2.21) |
//   three 2.59 | layers 2.85 (vowel 2.93, ends 3.47)
//   One 3.78 | builds 4.12 | brain 4.44 | and 4.60 | skin 4.78 ("s"; vowel 4.98, ends 5.34)
//   One, 5.60 (held to 6.04) | heart 6.06 ("h"; vowel 6.26) | and 6.46 | bone 6.64 (ends 7.08)
//   One, 7.44 (pause 7.87-7.93) | lungs 7.95 | and 8.37 | gut 8.60 (ends 8.97)
// durationSec 9.2 (chapters.ts). Enters by focus (0..15), C06 fades in over 261..276.
// The voice runs to 8.97, so the storyboard's silent slipper beat (7.6-8.5) now plays
// under "lungs and gut": the gold bottom layer speaks in the side cut like the other
// two ("One,"), then the view tilts back, the disc becomes the kit embryo and stretches
// into the slipper while the lungs and gut ghosts bloom; the END is reached at 8.6.
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const DURATION = s(9.2); // chapterFrames("C05"), incl. both 15-frame overlaps
export const HANDOFF = DURATION - 15; // 261: C06 frame 0 = this local frame (fade overlap)

export const BEATS = {
  // --- START: focus pulls in on the two-tone disc between its two bubbles
  focusIn: 0, // free (the framework's focus pull runs 0..15)
  sheen: s(0.7), // sync: "four" (0.58, vowel 0.76) a slow light sweep crosses the disc's face

  // --- "Week four: the embryo forms three layers."
  streakStart: s(1.5), // sync: "the" (1.53) a bright line draws down the middle
  streakEnd: s(2.1), // sync: "forms" (2.08, vowel 2.21) the node pops at its head end
  pourStart: s(2.1), // sync: "forms" (2.08) cells pour into the streak
  mesoIn: s(2.58), // sync: "three" (2.59) the third colour slides in between
  tiltStart: s(2.63), // free: on "three" (the new colour slides in as the view dives)
  pourEnd: s(3.1), // free
  tiltEnd: s(3.42), // free: the side cut lands as "layers" ends (3.47)

  // --- "One builds brain and skin."
  ectoGlow: s(3.74), // sync: "One" (3.78) cool top layer glows
  brain: s(4.37), // sync: "brain" (4.44)
  skin: s(4.74), // sync: "skin" (4.78)

  // --- "One, heart and bone."
  mesoGlow: s(5.56), // sync: "One," (5.60) rose middle layer glows
  heart: s(6.03), // sync: "heart" (6.06)
  bone: s(6.62), // sync: "bone" (6.64)

  // --- "One, lungs and gut.": the gold layer speaks in the side cut, then the view
  // tilts back and pushes in onto the embryo kit for the END
  endoGlow: s(7.4), // sync: "One," (7.44) gold bottom layer glows (the yolk sac it lines too)
  release: s(7.6), // free: the gold layer is lit; the view tilts back, the amnion swells away
  lungs: s(7.9), // sync: "lungs" (7.95)
  swap: s(8.07), // free: hand-drawn disc -> embryo kit (kit 3.3), hidden in the swoop
  stretchStart: s(8.1), // free: kit 3.3 -> 4.0 (slipper, keyhole plate, folds rise)
  tubeIn: s(8.17), // free: the dim, unlit heart tube shows in the future chest
  grooveStart: s(8.2), // free: a glint draws the groove down the centre
  gut: s(8.53), // sync: "gut" (8.60)
  grooveEnd: s(8.56), // free
  settle: s(8.6), // free: END state reached (kit 4.0, ridges up), held through the hand-off
} as const;

// Ghost glyphs: which layer (0 endo, 1 meso, 2 ecto), which slot (0 left, 1 right),
// their bloom beat and the beat they dissolve on.
export const GHOSTS = [
  { kind: "brain", layer: 2, slot: 0, at: BEATS.brain, out: BEATS.mesoGlow },
  { kind: "skin", layer: 2, slot: 1, at: BEATS.skin, out: BEATS.mesoGlow + 3 },
  { kind: "heart", layer: 1, slot: 0, at: BEATS.heart, out: BEATS.endoGlow },
  { kind: "bone", layer: 1, slot: 1, at: BEATS.bone, out: BEATS.endoGlow + 3 },
  { kind: "lungs", layer: 0, slot: 0, at: BEATS.lungs, out: HANDOFF },
  { kind: "gut", layer: 0, slot: 1, at: BEATS.gut, out: HANDOFF + 2 },
] as const;

export type GhostKind = (typeof GHOSTS)[number]["kind"];

// END contract for C06 (frame 0 of C06 = local frame HANDOFF, held to DURATION-1):
//   camera zoom END_ZOOM looking at (540, 860), drift 0; embryo kit week 4.0, size 300 at
//   (540, 860), zip 0, heartLit 0, wobble clock = f - HANDOFF (C06's own frame);
//   yolk sac + stalk at yolkSuggest(4.0, 300, {540, 860}); backdrop early look, r 390,
//   warmth 0.12, folds 0.18, opacity 0.35; dormant tube (tube.ts) at the kit's heart
//   anchor + TUBE_DROP (world px, toward the ventral rim), rot cardiac.rot + spin,
//   scale k * max(0.72, bulge) * 0.95 * TUBE_GROW, blur 2.2 (design units), opacity TUBE_VIS. No amnion dome, ghosts or glows left by DURATION-1.
export const END_ZOOM = 1.3;
export const TUBE_GROW = 1.4;
export const TUBE_VIS = 0.8;
export const TUBE_DROP = { x: 4, y: 12 };
