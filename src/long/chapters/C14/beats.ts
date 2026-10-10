// C14 "Practice breaths": every story moment as a LOCAL frame. Re-time the
// voice by editing only this file; everything else animates TO these values.
// Caption (planned): "It practises breathing, though there's no air. Not yet.
// By week thirty-six, its lungs are probably ready."
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  // the turn from C13 completes (headDown 0.6 -> 1), soft glow under the head
  turnEnd: s(1.6), // free
  headGlow: s(0.9), // free
  // practice-breathing episode: chest + diaphragm rise and fall
  breatheIn: s(0.75), // sync: "practises"
  firstPeak: s(1.35), // sync: "breathing"
  noAir: s(2.75), // sync: "air"
  breathePause: s(3.6), // sync: "Not"
  pauseHold: s(4.3), // sync: "yet"
  rhythmOut: s(5.2), // free
  // lungs
  chestPush: s(5.4), // free (camera eases toward the chest)
  w36: s(6.05), // sync: "thirty-six"
  lungTree: s(6.7), // sync: "lungs"
  sacsBloom: s(7.15), // sync: "are"
  surfactant: s(7.45), // sync: "probably"
  practicePulse: s(7.9), // sync: "ready"
  insetOut: s(8.55), // free (inset fades through the C15 crossfade)
  end: s(9.0), // free (last frame + 1)
} as const;

export type BeatKey = keyof typeof BEATS;
