// C09 "Fetus" — every story moment as a chapter-LOCAL frame (30 fps).
// Narration: "Week ten: every major organ is in place. The embryo becomes a
// fetus. Week twelve: fingers, toes, a face."
// Re-time to the voice take by editing ONLY this file; everything animates TO
// these constants (camera, organ ticks, level-up, highlights).
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  // 0-0.5 s: focus pull in from C08 (framework crossfade + our own rack)
  focusIn: s(0), // free
  weekTen: s(0.6), // sync: "ten" (W10 lands on the tracker)

  // "every major organ is in place." six soft organ glows tick on, ~0.25 s apart
  heart: s(1.3), // sync: "every"
  brain: s(1.55), // free
  lungs: s(1.8), // sync: "organ"
  liver: s(2.05), // free
  kidneys: s(2.3), // free
  gut: s(2.55), // sync: "place"

  // "The embryo becomes a fetus." warm level-up sweep, head -> toe; C-curl relaxes
  levelUp: s(3.3), // sync: "embryo"
  fetus: s(4.35), // sync: "fetus" (sweep reaches the toes, halo bloom)

  // silent gap: W11 lands, cord + placenta fade in
  cordIn: s(4.9), // free (W11 lands)

  // "Week twelve: fingers, toes, a face."
  weekTwelve: s(6.2), // sync: "twelve" (push-in starts; W12 lands 6.5)
  fingers: s(6.8), // sync: "fingers"
  toes: s(7.4), // sync: "toes"
  face: s(8.0), // sync: "face"
  glint: s(8.2), // free (glint runs along the sealed eyelid, plants C12)
  settle: s(8.45), // free (camera eases back to the END framing)
  end: s(9.0), // free (END state held for the C10 crossfade)
} as const;

// organ ticks in on-screen order (heart, brain, lungs, liver, kidneys, gut)
export const ORGAN_BEATS = [BEATS.heart, BEATS.brain, BEATS.lungs, BEATS.liver, BEATS.kidneys, BEATS.gut] as const;
