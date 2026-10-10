// C12 "The senses wake": every story moment as a chapter-local frame.
// Animate TO these constants; re-timing the voice only edits this file.
// Planned times from briefs/long/storyboard.md (C12). Line:
// "Week twenty-two: it can hear its mother's heartbeat, even her tummy
//  rumbling. Around week twenty-seven, its eyelids, sealed for months, open.
//  And it blinks."
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  w21: s(0.45), // free (tracker lands W21 under the focus pull)
  w22: s(1.75), // sync: "twenty-two"
  heart1: s(2.55), // sync: "hear"        that ring reaches the ear (ear glows)
  heartOut: s(5.3), // free               the last heartbeat ring has faded out
  rumbleIn: s(4.35), // sync: "tummy"     one wobbly, bubbly ring rolls in
  startle: s(4.95), // sync: "rumbling"   tiny startle as it passes
  glideStart: s(5.3), // free             camera starts gliding to the eye
  lipTwitch: s(6.05), // free             random lip-corner twitch
  browTwitch: s(7.05), // free            random brow twitch
  glideEnd: s(8.3), // sync: "Around"     extreme close-up of the closed eye
  seamGlint: s(8.4), // free              glint runs along the sealed lid (C09 callback)
  w27: s(8.75), // sync: "twenty-seven"   seam glow swells as W27 lands
  seamWake: s(9.65), // sync: "eyelids"   seam brightens, lashes stir
  lidCrack: s(10.45), // sync: "months"   hairline parting, trembling
  lidOpen: s(10.95), // sync: "open"      the lids part
  lidOpenFull: s(11.6), // free           fully open; rose-red glow at its fullest
  blinkDown: s(12.0), // free             the slow blink starts
  blink: s(12.2), // sync: "blinks"       lids meet
  blinkUp: s(12.65), // free              open again, then hold
  end: s(13.0), // free                   chapter end (C13 focus pull starts 12.5)
} as const;

// Mother's heartbeat, about 70 a minute: ring k reaches the ear at heart1 + k * HEART_PERIOD.
export const HEART_BPM = 70;
export const HEART_PERIOD = (60 / HEART_BPM) * FPS;
export const HEART_RINGS = 4;
