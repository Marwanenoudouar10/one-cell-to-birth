// C10 "Hands of its own" - every story moment as a LOCAL frame (chapter frame 0 = first
// frame of the 15-frame fade-in from C09 = C09's frame 285). 315 frames (10.5 s); frames
// 300-314 sit under C11's focus pull. Animate TO these; re-time by editing ONLY this file.
//
//   > Week fifteen: it sucks its thumb.
//   > Week seventeen: fingerprints, set for life, different even from an identical twin's.
//
// Word onsets (chapter pack, measured from public/vo/long/C10.wav, chapter-local s):
//   Week 2.13 | fifteen 2.63 | it 3.27 | sucks 3.47 | its 3.77 | thumb 4.06 (ends 4.50) ||
//   Week 4.79 | seventeen 4.96 | fingerprints 6.07 | set 7.03 | for 7.36 | life 7.55 |
//   different 8.34 | even 8.70 | from 8.94 | an 9.10 | identical 9.20 | twin's 9.75 (ends 10.39)
// Tracker (chapters.ts, orchestrator): W13 0, W14 1.5, W15 3.0, W16 4.5, W17 6.0.
import { FPS } from "../../../theme/layout";

export const s = (sec: number) => Math.round(sec * FPS);

export const DURATION = 315; // chapterFrames("C10"), incl. both 15-frame overlaps
export const OVERLAP = 15; // LONG_TRANSITION
// C09's clock: our frame 0 is its frame 285 (kit drift, cord, specks and pose noise continue it)
export const C09_CLOCK = 285;

export const BEATS = {
  // --- START = C09's END (whole week-12 fetus, zoom 1.93), under the fade
  fadeEnd: OVERLAP, // free: C09 is fully covered

  // --- silent X-ray: the shafts warm cartilage-blue -> bone-white, skull plates grow as islands
  xrayOn: s(0.5), // free  (W13 shows from 0)
  ossify: s(0.6), // free  shafts start warming from mid-shaft outward
  ossifyDone: s(2.0), // free  (W14 lands 1.5)
  toFace: s(2.07), // sync: "Week" (2.13)  X-ray dissolves, camera glides to the face
  faceIn: s(2.87), // free  camera settled on mouth + hand ("fifteen" 2.63 .. 2.95)

  // --- "it sucks its thumb." the thumb is in the mouth for the whole of "sucks its thumb"
  handUp: s(2.8), // free  the hand drifts up from the chin toward the lips
  thumbIn: s(3.42), // sync: "sucks" (3.47)  the thumb meets the lips; rhythmic sucks start
  thumbWord: s(4.04), // sync: "thumb" (4.06)  mid-suck: thumb in the mouth, cheek swelling

  // --- "Week seventeen:" the hand opens, the camera pushes into one fingertip
  release: s(4.67), // free  (just before "Week" 4.79) thumb slides off the lips, the fingers fan open
  pushIn: s(4.92), // sync: "seventeen" (4.96)  camera starts the push into one fingertip
  macroIn: s(5.53), // free  the fingertip pad takes over the frame

  // --- fingerprint A
  ripplesA: s(6.03), // sync: "fingerprints" (6.07)  3 start points glow, rings spread
  lockA: s(7.52), // sync: "life" (7.55)  the whorl locks with a soft click-glow

  // --- the twin's fingertip, fingerprint B
  slideB: s(8.22), // sync: "different" (8.34)  a second fingertip slides in: its edge enters on the word
  ripplesB: s(8.7), // sync: "even" (8.70)  same start points, same ripple
  lockB: s(9.72), // sync: "twin's" (9.75)  a visibly different pattern locks

  exit: DURATION - OVERLAP, // free (300): C11's focus pull starts; glows already calm
  end: DURATION, // free  two glowing fingertips side by side
} as const;

// Short helper: seconds after a beat, in frames.
export const after = (beat: number, sec: number) => beat + Math.round(sec * FPS);
