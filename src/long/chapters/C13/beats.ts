// C13 · Brain spurt: every story moment as chapter-LOCAL seconds / frames.
// Re-time to the voice take by editing THIS file only (everything animates to
// these constants). Planned times from briefs/long/storyboard.md (C13).
//   VO: "Week thirty: its brain adds about four teaspoons a week, folding as it grows."
import { FPS } from "../../../theme/layout";

const s = (sec: number) => Math.round(sec * FPS);

export const SEC = {
  // START: focus pull from C12's eye into the head
  pullStart: 0.0, // free: camera leaves the eye close-up (already moving under the focus pull)
  xrayStart: 0.35, // free: the head turns translucent, the brain glows up
  xrayFull: 1.35, // free
  pullEnd: 1.6, // free: settled on the side view of the head
  spoonIn: 1.0, // free: glowing teaspoon appears above the crown
  drop1: 1.95, // free: W29 lands (tracker), first drop hits the brain
  drop2: 3.45, // sync: "thirty:" (W30 lands)
  brain: 4.0, // sync: "brain" (accent word, soft halo lift)
  drop3: 4.95, // sync: "teaspoons" (W31 lands)
  spoonOut: 5.3, // free: spoon lifts away
  press: 5.75, // free: the grown brain presses against the skull
  foldStart: 6.1, // sync: "folding"
  foldEnd: 7.1, // sync: "grows."
  pullBack: 6.95, // free: camera pulls back to the whole baby
  xrayOff: 7.0, // free: the translucent window irises shut, head back to skin
  pullBackEnd: 8.0, // free: whole baby framed, camera at rest = C14 frame 0
  eyesShut: 7.15, // free: eyes ease shut as it starts to roll (C14 has them closed)
  turnStart: 6.9, // free: half-somersault begins (headDown 0 -> 0.6)
  turnEnd: 8.0, // free: headDown 0.6 at C14 frame 0 (handoff.ts C14_AT), still rolling
} as const;

export const BEATS = {
  pullStart: s(SEC.pullStart),
  xrayStart: s(SEC.xrayStart),
  xrayFull: s(SEC.xrayFull),
  pullEnd: s(SEC.pullEnd),
  spoonIn: s(SEC.spoonIn),
  drops: [s(SEC.drop1), s(SEC.drop2), s(SEC.drop3)],
  brain: s(SEC.brain),
  spoonOut: s(SEC.spoonOut),
  press: s(SEC.press),
  foldStart: s(SEC.foldStart),
  foldEnd: s(SEC.foldEnd),
  pullBack: s(SEC.pullBack),
  xrayOff: s(SEC.xrayOff),
  pullBackEnd: s(SEC.pullBackEnd),
  eyesShut: s(SEC.eyesShut),
  turnStart: s(SEC.turnStart),
  turnEnd: s(SEC.turnEnd),
} as const;

// END handoff to C14 (fade): headDown reached at turnEnd. The approach speed
// and C14's own START pose/world live in handoff.ts.
export const TURN = { to: 0.6 } as const;
