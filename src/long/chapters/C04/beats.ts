import { FPS } from "../../../theme/layout";

// C04 "A message to mum": every story moment as a LOCAL frame (frame 0 = the
// chapter's first frame; 0..15 is the fade from C03, 240..255 the focus pull
// into C05). Animate TO these; re-time to the voice by editing only this file.
//
// Real voice (briefs/long/vo-words.md, chapter-local s):
//   Now 0.40  a 0.62  hollow 1.19  ball 1.65  it 2.05  burrows 2.28  into 2.89
//   the 3.20  womb 3.46  wall 3.77  and 4.08  sends 4.34  a 4.70  message 4.85
//   the 5.54  hormone 5.87  a 6.45  pregnancy 6.64  test 7.36  detects 7.89 (ends 8.05)
// Tracker (chapters.ts): chip "hollow ball" from 0.6, "implanting" from 2.75,
// WEEK 04 + "size of a poppy seed" from 6.85 (the number lands ~7.3, on "test").
const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
  cavity: s(0.4), // sync: "Now" (0.40)       fluid starts to gather inside the morula
  hollow: s(1.17), // sync: "hollow" (1.19)   the hollow ball is fully formed
  stretch: s(1.45), // free                   the ball swells, the zona stretches thin
  knot: s(1.62), // sync: "ball" (1.65)       the gold inner knot gets its soft highlight
  opening: s(1.83), // free                   a small opening appears in the zona
  squeeze: s(1.87), // free                   the ball starts to squeeze out (figure-8)
  free: s(2.2), // sync: "burrows" (2.28)     pops free with an overshoot; the shell crumples
  stick: s(2.83), // sync: "into" (2.89)      rolls onto the wall and sticks
  sink: s(3.17), // sync: "the" (3.20)        starts to sink in
  roots: s(3.43), // sync: "womb" (3.46)      root-like threads start to reach for vessels
  closed: s(3.97), // free                    (end of "wall") the lining has closed over it
  message: s(4.3), // sync: "sends" (4.34)    glowing particles leave the outer cells
  stream: s(4.82), // sync: "message" (4.85)  they enter the vessel and stream away
  strip: s(5.5), // sync: "the" (5.54)        a clean test strip slides in
  dot1: s(5.83), // sync: "hormone" (5.87)    one glow dot (the hormone)
  dot2: s(6.17), // free                      doubles to two
  dot4: s(6.5), // free                       four (a cascade, like the cells)
  dot8: s(6.8), // free                       eight
  absorb: s(7.0), // free                     the dots stream up into the test window
  line: s(7.32), // sync: "test" (7.36)       the second line has drawn itself (W04 lands)
  detects: s(7.86), // sync: "detects" (7.89) the line glows once more
  closeup: s(7.0), // free                    slow push toward the buried embryo begins
} as const;
