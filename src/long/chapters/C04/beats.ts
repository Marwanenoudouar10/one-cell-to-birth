import { FPS } from "../../../theme/layout";

// C04 "A message to mum": every story moment as a LOCAL frame (frame 0 = the
// chapter's first frame; 0..15 is the fade from C03, 240..255 the focus pull
// into C05). Animate TO these; re-time to the voice by editing only this file.
//
// Real voice, REPAIRED take (briefs/long/vo-words.md 2026-10-10, chapter-local s;
// measured onsets, +-2 f). The line starts at 1.19: the morula holds until "Now".
//   Now 1.19  a 1.56  hollow 1.66  ball 2.13  it 2.65  burrows 2.89  into 3.28
//   the 3.49  womb 3.64  wall 3.89  and 4.26  sends 4.39  a 4.69  message 4.77
//   the 5.78  hormone 5.87  a 6.59  pregnancy 6.63  test 7.11  detects 7.50 (ends 8.11)
// Sync beats land on their word or 1-3 frames before it (message: 5 f, see its note).
// Frozen: frame 0 (C03's END) and the END (closeup and everything after it:
// C05 is matched to it). The hatch is unnarrated: it fits between "ball" and
// "burrows" (squeeze 10 f, as before); the fall to the wall is 13 f.
// Tracker (chapters.ts, orchestrator-owned): chip "hollow ball" on the cavity,
// "implanting" + WEEK 03 on "stick", WEEK 04 + "size of a poppy seed" landing
// on "test" (the missed period). Keys must follow these beats when they move.
const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  cavity: s(1.13), // sync: "Now" (1.19)       fluid starts to gather inside the morula
  hollow: s(1.63), // sync: "hollow" (1.66)    the ball reads hollow (cavity open; last outer cells settle 5 f later)
  stretch: s(1.93), // free                    the ball swells, the zona stretches thin
  knot: s(2.07), // sync: "ball" (2.13)        the gold inner knot gets its soft highlight
  opening: s(2.47), // free                    a small opening appears in the zona
  squeeze: s(2.5), // free                     the ball starts to squeeze out (figure-8)
  free: s(2.83), // sync: "burrows" (2.89)     pops free with an overshoot; the shell crumples
  stick: s(3.27), // sync: "into" (3.28)       rolls onto the wall and sticks
  sink: s(3.47), // sync: "the" (3.49)         starts to sink in
  roots: s(3.6), // sync: "womb" (3.64)        root-like threads start to reach for vessels
  closed: s(4.1), // free                      (end of "wall") the lining has closed over it
  message: s(4.23), // sync: "sends" (4.39)    glowing particles leave the outer cells (leads by 5 f: they need ~4 f to fade in and clear the shell, so they are visibly leaving ON "sends")
  stream: s(4.7), // sync: "message" (4.77)    they enter the vessel and stream away
  strip: s(5.7), // sync: "the" (5.78)         a clean test strip slides in
  dot1: s(5.83), // sync: "hormone" (5.87)     one glow dot (the hormone)
  dot2: s(6.07), // free                       doubles to two
  dot4: s(6.3), // free                        four (a cascade, like the cells)
  dot8: s(6.5), // free                        eight (just before "pregnancy")
  absorb: s(6.7), // free                      the dots stream up into the test window
  line: s(7.03), // sync: "test" (7.11)        the second line has drawn itself (W04 lands)
  detects: s(7.43), // sync: "detects" (7.50)  the line glows once more
  closeup: s(7.0), // free                     slow push toward the buried embryo begins (END: frozen)
} as const;
