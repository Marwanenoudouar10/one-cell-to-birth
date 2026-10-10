// C08 "Webbing and tail" (W08 -> W09): every story moment as a chapter-LOCAL frame.
// Frame 0 = C07's frame 231 (handoff.ts); 0-14 fade in over C07, 210-224 sit under C09.
// Re-time by editing ONLY this file: everything animates TO these constants.
//
//   > Week eight: its fingers are webbed, and it even has a little tail.
//   > Both fade away, right on cue.
//
// Word onsets MEASURED from public/vo/long/C08.wav (clipAt 0.519 s; 10 ms envelope,
// voiced band < 1.2 kHz vs fricative band > 3.5 kHz), chapter-local seconds:
//   Week 0.52 | eight 0.77 | its 1.54 | fingers 1.81 (f) | are 2.15 | webbed 2.36 |
//   and 2.85 | it 2.93 | even 3.05 | has 3.31 | a 3.50 | little 3.62 | tail 3.84 (t burst) ||
//   Both 4.82 | fade 5.11 | away 5.31 | right 5.97 | on 6.21 | cue 6.42 (k) | ends 6.81
// (vo-words.md has fingers 1.68, webbed 2.28, tail 4.01, away 5.42, cue 6.37.)
// Tracker (chapters.ts): W08 lands ~0.5 s, W09 ~5.0 s, during the dissolve.
import { FPS } from "../../../theme/layout";
import { chapterFrames } from "../../chapters";

const s = (sec: number) => Math.round(sec * FPS);

export const DURATION = chapterFrames("C08"); // 225, incl. both 15-frame overlaps
export const OVERLAP = 15; // LONG_TRANSITION

export const BEATS = {
  // --- START = C07's END (wide shot, slow push-in already moving)
  fadeEnd: OVERLAP, // free: C07 has faded under us; we follow its camera exactly until here
  grow: s(0.35), // free: kit 7.0 -> 7.5 (GA 7.5 -> 8) while the camera pushes in
  quicken: s(0.5), // sync: "Week" (0.52): the heart starts racing toward its week-9 peak
  grown: s(1.5), // free: kit 7.5 reached, hand plate fully ours
  pushEnd: s(1.8), // free: the push-in lands on the big side view as "fingers" starts
  // --- "its fingers are webbed,"
  ringOn: s(1.76), // sync: "fingers" (1.81): a gold ring draws itself round the hand
  rays: s(2.31), // sync: "webbed" (2.36): five finger rays glow inside the webbing
  // --- "and it even has a little tail."
  toTail: s(2.85), // sync: "and" (2.85): camera starts its glide down to the rump
  ringMove: s(3.05), // sync: "even" (3.05): the ring lifts off the hand
  ringAtTail: s(3.8), // sync: "tail" (3.84): the ring lands on the tail tip (it never wags)
  ringOff: s(4.4), // free: ring widens and fades before the dissolve
  frameBoth: s(4.25), // free: camera eases back to frame hand + tail for the dissolve
  // --- "Both fade away,"
  dissolve: s(4.78), // sync: "Both" (4.82): webbing + tail tip turn to gold dust
  dissolveEnd: s(5.31), // sync: "away" (5.31): fingers free, tail gone
  uncurl: s(4.78), // sync: "Both": kit 7.5 -> 8.99, body lengthens and uncurls a little
  uncurlEnd: s(5.9), // free
  // --- "right on cue."
  toHand: s(5.93), // sync: "right" (5.97): camera leans in on the free fingers
  flex: s(6.38), // sync: "cue" (6.42): the stubby fingers flex once, peaking on "cue"
  // --- END: free fingers, no tail; focus starts to soften for C09's focus pull
  soften: s(6.9), // free
  exit: DURATION - OVERLAP, // free (210): C09 focus-pulls in on top
  end: DURATION, // free: last frame + 1
} as const;

// Kit (embryo) weeks, see the storyboard's GA -> kit table (GA 7.5 = 7.0, 8 = 7.5, 9 = 8.5-8.99).
export const KIT = { start: 7.0, webbed: 7.5, end: 8.99 } as const;
