// C15 "Her voice": every story moment as a LOCAL frame. Re-time the voice take
// by editing only this file; everything else animates TO these values.
// Caption (planned: 0.5-2.2, 2.3-3.4, 3.7-5.4 s): "Now it can tell its mother's voice from a
// stranger's, and after birth, it prefers hers."
// Voice-wave beats are ARRIVAL times: the moment the first arc of a train
// reaches the baby's head. The trains are launched earlier (shot.ts works the
// launch frame out from the distance), so the response lands on the word.
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  // 0-0.5 s: crossfade from C14's END (head-down, cramped, warm) - free
  handoff: s(0.5), // free

  // ---- "Now it can tell its mother's voice"
  warmReach: s(1.4), // sync: "mother's"   first warm (gold/rose) arc reaches the head
  settleIn: s(1.45), // sync: "mother's"   small settling movement starts (1.4-2.2)
  warmGlow: s(1.85), // sync: "voice"      gentle glow on the face peaks
  settleOut: s(2.25), // free              settling movement complete

  // ---- "from a stranger's,"
  coolReach: s(2.8), // sync: "stranger's" first cool (cyan) arc reaches the face
  stir: s(2.85), // sync: "stranger's"     smaller, different response: a tiny stir, no glow
  stirOut: s(3.4), // free                 stir settled

  // ---- "and after birth, it prefers hers."
  warmReach2: s(4.6), // sync: "prefers"   the warm arcs reach the head again
  warmGlow2: s(4.95), // sync: "prefers"    glow returns, fuller
  calm: s(5.25), // sync: "hers"            settled deeper, calm (held to the end)

  // ---- END hold 6.0-6.5 s: head-down, cramped, warm (C16 focus-pulls in)
  endHold: s(6.0), // free
  end: s(6.5), // free (chapter length)
} as const;

export type BeatKey = keyof typeof BEATS;
