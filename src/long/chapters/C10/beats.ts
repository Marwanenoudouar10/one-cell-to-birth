// C10 "Hands of its own" - every story moment as a LOCAL frame (chapter
// frame 0 = first frame of the 15-frame fade-in from C09). Animate TO these;
// when the real voice is re-timed, edit ONLY this file.
//
// Narration: "Week fifteen: it sucks its thumb. Week seventeen: fingerprints,
// set for life, different even from an identical twin's."
import { FPS } from "../../../theme/layout";

export const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  // --- womb shot: week 13 -> 14, silent X-ray (bones + skull plates)
  xrayOn: s(0.4), // free  (W13 lands 0.45)
  ossify: s(0.8), // free  shafts start warming cartilage-blue -> bone-white
  ossifyDone: s(2.8), // free  (W14 lands 1.95)
  xrayOff: s(3.0), // free

  // --- week 15: thumb-sucking
  handUp: s(3.35), // sync: "fifteen"  near hand starts drifting up (W15 lands 3.45)
  thumbIn: s(4.6), // sync: "thumb"  thumb meets the lips (pose thumbSuck)
  release: s(5.55), // free  hand slides off the lips and opens (W16 lands 4.95)

  // --- week 17: push in to one fingertip
  pushIn: s(6.1), // sync: "Week"  (second "Week") camera pushes to the fingertip
  macroIn: s(6.42), // free  the fingertip pad takes over the frame (W17 lands 6.45)

  // --- fingerprint A
  ripplesA: s(6.9), // sync: "fingerprints"  2-3 start points glow, rings spread
  lockA: s(8.1), // sync: "life"  the whorl locks with a soft click-glow

  // --- the twin's fingertip, fingerprint B
  slideB: s(8.5), // sync: "different"  a second fingertip slides in beside the first
  ripplesB: s(9.0), // free  same start points, same ripple
  lockB: s(10.0), // sync: "twin's"  a visibly different pattern locks

  end: s(10.5), // free  two glowing fingertips side by side (focus pull into C11)
} as const;

// Short helper: seconds after a beat, in frames.
export const after = (beat: number, sec: number) => beat + Math.round(sec * FPS);
