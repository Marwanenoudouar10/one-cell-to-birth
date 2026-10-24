// C12 "The senses wake": every story moment as a chapter-local frame.
// Animate TO these constants; re-timing the voice only edits this file.
//
//   VO (real take, chapter-local s, briefs/long/packs/C12.md):
//     "Week 2.00  twenty-two: 2.56  it 3.36  can 3.44  hear 3.62  its 3.87
//      mother's 4.05  heartbeat, 4.61  even 5.18  her 5.45  tummy 5.61
//      rumbling. 5.85"  (line ends 6.56)
//     "Around 6.88  week 7.19  twenty-seven, 7.73  its 8.45  eyelids, 8.69
//      sealed 9.34  for 9.74  months, 10.05  open. 10.78"  (ends 11.33)
//     "And 11.71  it 11.82  blinks. 11.98"  (ends 12.59)
//
// Chapter: 13.0 s = 390 frames. Enters by a focus pull (frames 0-14 overlap
// C11's 270-284); C13 enters by a focus pull over our frames 375-389.
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  w21: 14, // free (the tracker already reads WEEK 21 when the focus pull ends)
  w22: s(2.56), // sync: "twenty-two" (f77; tracker WEEK 22 should land here)
  // mum's heartbeat: slow low rings from her side; ring k reaches the ear at
  // heart1 + k * HEART_PERIOD and the ear blooms
  heart1: 107, // sync: "hear" (3.62 -> f109)
  heart2: 136, // sync: "heartbeat" (4.61 -> f138)
  heartOut: 192, // free (the last, faint ring has faded out)
  // her tummy rumbling: one wobbly, bubbly ring rolls in from below...
  rumbleIn: 150, // free (enters the frame during "even" so it is rolling on "tummy")
  tummy: s(5.61), // sync: "tummy" (f168: the bubbly ring is crossing the frame)
  // ...and reaches the ear: a tiny startle
  startle: 174, // sync: "rumbling" (5.85 -> f176)
  // the camera glides from the head to an extreme close-up of the sealed eye
  glideStart: 186, // free (the startle has settled)
  lipTwitch: 191, // free (random lip-corner movement while the face is big)
  browTwitch: 214, // free (random brow twitch on the way to the eye)
  w27: s(7.73), // sync: "twenty-seven" (f232: the seam glow swells; tracker WEEK 27 should land here)
  glideEnd: 256, // sync: "eyelids" (8.69 -> f261: the close-up has arrived)
  seamWake: 259, // sync: "eyelids" (the seam brightens, the lashes stir)
  seamGlint: 277, // sync: "sealed" (9.34 -> f280: a glint runs along the sealed seam)
  lidCrack: 299, // sync: "months" (10.05 -> f302: a hairline parting, trembling)
  lidOpen: 317, // sync: "open" (10.78 -> f323: the lids are visibly parting on the word)
  lidOpenFull: 339, // free (fully open, the rose-red glow at its fullest)
  blinkDown: 351, // sync: "And" (11.71 -> f351: the slow blink starts)
  blink: 358, // sync: "blinks" (11.98 -> f359: the lids meet)
  blinkUp: 375, // free (open again; held to the end)
  end: 390, // free (chapter length; C13's focus pull runs over 375-389)
} as const;

// Mother's resting heartbeat, about 60-65 a minute: one ring every 29 frames
// (heart1 -> heart2 is exactly one period, so both words get a ring).
export const HEART_PERIOD = BEATS.heart2 - BEATS.heart1;
export const HEART_RINGS = 3;
