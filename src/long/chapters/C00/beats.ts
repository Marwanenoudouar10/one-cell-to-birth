// C00 "The question" (intro hook) story beats, as chapter-local frames (frame 0 =
// the film's first frame and its thumbnail; C01 follows by a hard cut). Planned
// times from the storyboard and the caption word timings in data/lines.ts.
// Re-time to the voice take by editing ONLY this file: every other timing in the
// chapter (timeline.ts) is derived from these.
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  // --- the grip: "Have you ever wondered how you began?" ---
  question: s(0.4), // sync: "Have"      (push toward the palm is already moving)
  wondered: s(1.25), // sync: "wondered"  (a tiny squeeze of the grip, the speck twinkles)
  began: s(2.2), // sync: "began?"    (the gold speck in the palm brightens)

  // --- the dive into the speck ---
  dive: s(2.8), // free             (camera plunges into the speck, light streaks rush out)
  through: s(3.3), // free             (through the light: gold peak, the room is gone)
  dark: s(3.65), // free             (settled into the dark plum world)

  // --- "Long before your first breath, you were a single cell," ---
  resolved: s(4.85), // free             (the glowing point has resolved into the cell)
  you: s(5.0), // sync: "you"       (the gold zygote, centred, breathing)
  single: s(5.55), // sync: "single"    (one soft halo pulse: the chime)

  // --- "smaller than a grain of salt." ---
  smaller: s(6.2), // sync: "smaller"   (salt crystal slides in, camera pulls back)
  land: s(6.6), // free             (crystal comes to rest beside the cell: the clink)
  salt: s(7.35), // sync: "salt."     (a glint runs across the crystal)

  // --- the rewind into C01 ---
  away: s(7.6), // free             (crystal slides away, cell heads for C01's spot)
  rewind: s(7.7), // free              (the gold drains back out of the cell)
  egg: s(8.3), // free             (pearly egg at 540,560 r100; walls + corona in)
} as const;
