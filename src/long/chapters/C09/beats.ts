// C09 "Fetus" (W10 -> W11 -> W12): every story moment as a chapter-LOCAL frame (30 fps).
// 300 frames (10.0 s). Frames 0-14 sit under C08's focus pull; 285-299 under C10's fade.
//
//   > Week ten: every major organ is in place. The embryo becomes a fetus.
//   > Week twelve: fingers, toes, a face.
//
// Word onsets (chapter pack, measured from public/vo/long/C09.wav, chapter-local s):
//   Week 1.11 | ten 1.38 | every 2.27 | major 2.82 | organ 2.99 | is 3.30 | in 3.47 |
//   place 3.62 || The 4.39 | embryo 4.54 | becomes 5.15 | a 5.42 | fetus 5.47 ||
//   Week 6.50 | twelve 6.73 | fingers 7.64 | toes 8.41 | a 9.17 | face 9.22 (ends 9.87)
// Tracker (chapters.ts, orchestrator): W10 from the start, W11 at 4.45 s, W12 at 6.05 s.
// Re-time by editing ONLY this file: everything animates TO these constants.
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const DURATION = 300; // chapterFrames("C09"), incl. both 15-frame overlaps
export const OVERLAP = 15; // LONG_TRANSITION

export const BEATS = {
  // --- START = C08's END (big side view, zoom 2.55), under C08's focus pull
  focusEnd: OVERLAP, // free: the focus pull has landed
  weekTen: s(1.36), // sync: "ten" (1.38): camera has settled on the whole week-10 fetus

  // --- "every major organ is in place." six soft glows tick on ~0.25 s apart
  heart: s(2.24), // sync: "every" (2.27)
  brain: s(2.5), // free
  lungs: s(2.75), // sync: "major" (2.82)
  liver: s(2.98), // sync: "organ" (2.99)
  kidneys: s(3.22), // free
  gut: s(3.45), // sync: "in" (3.47)
  lock: s(3.6), // sync: "place" (3.62): all six pulse together once, "in place"

  // --- "The embryo becomes a fetus." warm level-up band head -> toe, curl 0.7 -> 0.55
  levelUp: s(4.45), // sync: "embryo" (4.54): eased start, the band shows from ~4.55
  fetus: s(5.44), // sync: "fetus" (5.47): the band leaves the toes, gold halo blooms

  // --- silent gap: pull back to the sac, placenta fades in on the upper-right wall
  pullBack: s(5.75), // free
  wide: s(6.5), // sync: "Week" (6.50): the wide week-12 shot has settled (Scene4's opening)
  weekTwelve: s(6.7), // sync: "twelve" (6.73): the push-in toward the hand starts

  // --- "fingers, toes, a face."
  fingers: s(7.6), // sync: "fingers" (7.64): the hand springs open, gold ring + sparkles
  toFoot: s(7.97), // free (239): the open hand has held 12 frames; camera glides down to the foot
  toes: s(8.37), // sync: "toes" (8.41): toes curl in a wave, gold ring
  toFace: s(8.63), // free (259): camera pulls back from the toes to the whole fetus (END framing)
  face: s(9.16), // sync: "a face" (9.17 / 9.22): light sweeps the profile
  glint: s(9.3), // free: as the sweep passes the eye a glint runs along the sealed lid (plants C12)
  exit: DURATION - OVERLAP, // free (285): C10 fades in on top; highlights fade 1 -> 0
  end: DURATION, // free
} as const;

// organ ticks in on-screen order (heart, brain, lungs, liver, kidneys, gut)
export const ORGAN_BEATS = [BEATS.heart, BEATS.brain, BEATS.lungs, BEATS.liver, BEATS.kidneys, BEATS.gut] as const;

// ---- END contract for C10 (enters by fade: C10's frame 0 = our frame 285; we stay opaque
// under it to 299). Numbers from timeline(285) / timeline(299); C10 must not import C09.
// The storyboard END: "Scene4's week-12 fetus in the sac" -> the WHOLE body, framed
// between the tracker band (y 290) and the caption band (y 1300).
//   camera   kit <Camera>, zoom 1.922 -> 1.932 (slow push), aim (482.1, 896.8) -> (483.0, 897.7),
//            drift 0.2, seed "c09cam"
//   fetus    shared kit, week 12, size 515, origin at world (487.8, 864.2), float noise small
//            pose { curl 0.55, headTilt ~-7.5, armSway ~-0.8, handOpen ~0.74, legKick ~0.01,
//            toesCurl ~0.15 }, rim 0.75, bloom 0, heartbeat(f, 160); cord = CordShape navel ->
//            placentaPort(sac, -38, 1), slack 0.85, side 1, twist 1, width 14 * 515 / 470 + 1
//   screen   crown (577, 301) -> (577, 297), eye (742, 572), nose (808, 632), hand at the chin
//            (742, 804), navel (566, 971), foot (675, 1178), rump (444, 1177); body box
//            x 252-824, y 297-1289 (nothing bright in the caption band)
//   world    WOMB_LOOKS.mid with sac r 375 (cx 540, cy 860, warmth 0.4), placenta at -38 deg
//            (size 1, spread 32) fully in, shafts 0.8, wall frozen (<Freeze frame={285}>,
//            backdrop seed "s3", breathe 0, opaque false); far specks "c09-far", lens "c09-lens"
//   shades   tracker band: multiply topShade 0 (zoom < 2.3, crown below y 295) + CaptionShade
//            top 0.5; captions: CaptionShade 1 + multiply 0.5
//   fx       face glow / lid glint / spotlight all at 0 by 299 (fade 285 -> 299)
