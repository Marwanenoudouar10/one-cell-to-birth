// C00 "The question" (intro hook) story beats, as chapter-local frames (frame 0 =
// the film's first frame and its thumbnail; C01 follows by a hard cut).
// Synced to the REPAIRED voice clip (briefs/long/vo-words.md, chapter-local s):
//   Have 0.21  you 0.38  ever 0.60  wondered 0.86  how 1.47  you 1.65  began? 1.86 (line ends 2.50)
//   Long 2.88  before 3.28  your 3.62  first 3.76  breath, 4.22  you 4.95  were 5.11
//   a 5.25  single 5.32  cell, 5.82  smaller 6.62  than 7.11  a 7.27  grain 7.40
//   of 7.69  salt. 7.79 (line ends 8.43)
// (key onsets re-checked against the energy of public/vo/long/C00.wav, clipAt 0.15: within ~0.03 s)
// Sync beats sit on the word onset or 1-2 frames before it: s(onset) - n.
// Re-time to the voice take by editing ONLY this file: every other timing in the
// chapter (timeline.ts) is derived from these.
// FROZEN: frame 0 (the thumbnail: the hand camera's push/pan keys hang off `dive`,
// so `dive` stays put) and the END (away / rewind / egg = the glide into C01's
// frame 0). The crystal is fully visible on "salt" (its ease-in exit starts at
// salt - 4, clearing the cell's glide by >= 45 px) and is off screen by salt + 9.
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  // --- the grip: "Have you ever wondered how you began?" ---
  question: s(0.21) - 1, // sync: "Have"      (push toward the palm is already moving)
  wondered: s(0.86) - 1, // sync: "wondered"  (a tiny squeeze of the grip, the speck twinkles)
  began: s(1.86) - 1, // sync: "began?"    (the gold speck in the palm brightens)

  // --- the dive into the speck (in the pause before "Long", landing on "before") ---
  dive: s(2.8), // free             (camera plunges into the speck, light streaks rush out; FROZEN: frame 0)
  through: s(3.3), // free             (through the light: gold peak, the room is gone; "before" 3.28)
  dark: s(3.65), // free             (settled into the dark plum world)

  // --- "Long before your first breath, you were a single cell," ---
  resolved: s(4.85), // free             (the glowing point has resolved into the cell)
  you: s(4.95) - 1, // sync: "you"       (the gold zygote, centred, breathing)
  single: s(5.32) - 2, // sync: "single"    (one soft halo pulse: the chime)

  // --- "smaller than a grain of salt." ---
  smaller: s(6.62) - 2, // sync: "smaller"   (salt crystal slides in, camera pulls back)
  land: s(6.62) + 10, // free             (smaller + 12: crystal comes to rest beside the cell, the clink)
  grain: s(7.4) - 1, // sync: "grain"     (a glint runs across the resting crystal)
  salt: s(7.79), // sync: "salt."     (the crystal is still in full view on the word, just starting to slide away)

  // --- the rewind into C01 (FROZEN END) ---
  away: s(7.6), // free             (the cell heads for C01's spot; the crystal stays until "salt")
  rewind: s(7.7), // free              (the gold drains back out of the cell, under "salt.")
  egg: s(8.3), // free             (pearly egg at 540,560 r100; walls + corona in)
} as const;
