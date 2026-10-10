import { Easing } from "remotion";
import { BEATS } from "../../theme/beats";
import { HERO } from "../../theme/layout";
import { SCENES, TRANSITION } from "../../theme/timing";
import { EASE, tween } from "../../lib/ease";

// Every time and motion curve of Scene2 lives here, derived from BEATS so the
// VO can be re-timed without touching the drawing code.
export const B = BEATS.Scene2;
export const DUR = 165;
export const CX = HERO.cx;
export const CY = HERO.cy;

// START handoff: Scene1's last frames are Scene2's first. Scene1 ends on the
// zygote at core radius 150 / zona 175.5, breathing 2% on a 56-frame cycle;
// Scene2 frame f is Scene1 frame f + S1_END, so the breath stays in phase.
export const R0 = 150;
export const ZR = R0 * 1.17;
const S1_END = SCENES[0].duration - TRANSITION;
export const breathAt = (f: number) =>
  1 + 0.02 * Math.sin(((f + S1_END) / 56) * Math.PI * 2) * (1 - tween(f, 40, B.hundreds + 2, [0, 1], EASE.inOut));

// Cleavage. GENS[g - 1] is the division that creates stage g (2, 4, ... 64 cells).
// start = earliest furrow start, dur = furrow length, jitter = asynchrony (frames).
export type Gen = { start: number; dur: number; jitter: number };
export const GENS: Gen[] = [
  { start: B.two - 25, dur: 22, jitter: 0 }, // 1 -> 2   the hero split
  { start: B.four - 13, dur: 10, jitter: 2 }, // 2 -> 4   (two cells rest ~12f first)
  { start: B.four + 5, dur: 5, jitter: 2 }, // 4 -> 8    rapid cascade...
  { start: B.hundreds - 16, dur: 4, jitter: 1 }, // 8 -> 16
  { start: B.hundreds - 10, dur: 4, jitter: 1 }, // 16 -> 32
  { start: B.hundreds - 6, dur: 5, jitter: 1 }, // 32 -> 64 (morula lands on "hundreds")
];

// Slow 3D tumble of the cluster so it reads as a ball, not a flat diagram.
export const yawAt = (f: number) => -0.05 + f * 0.0095;
export const pitchAt = (f: number) => 0.3 + 0.06 * Math.sin(f * 0.03);

// Morula -> blastocyst: cells flow out to a ring + inner cell mass. Starts a
// few frames after the morula is complete, so it rests and the stagger shows.
export const CAV = { start: B.hundreds + 4, dur: 14, stagger: 7 };
export const cavityOpen = (f: number) => tween(f, CAV.start - 1, CAV.start + 17, [0, 1], EASE.inOut);

// Hatching: the blastocyst swells, the zona thins, cracks and falls away.
export const HATCH = { swell0: B.hundreds + 8, swell1: B.hundreds + 24, crack: B.implant - 14 };
export const ringRadius = (f: number) =>
  146 + 14 * tween(f, HATCH.swell0, HATCH.swell1, [0, 1], EASE.out) + 1.6 * Math.sin(f * 0.16);
export const BLASTO_R = 172; // outer radius of the hatched blastocyst

// Descent into the womb wall. World space: the zygote starts at (CX, CY), the
// womb surface sits far below and the camera cranes down to it.
export const TISSUE_Y = CY + 930;
export const SINK = 0.52 * BLASTO_R;
export const DESC = { start: B.hundreds - 22, end: B.implant };
// Crane: eases in, long soft landing onto the wall.
const CRANE = Easing.bezier(0.45, 0, 0.3, 1);

export const blastoY = (f: number) => {
  const contact = TISSUE_Y - BLASTO_R;
  if (f <= DESC.end) return CY + (contact - CY) * tween(f, DESC.start, DESC.end, [0, 1], CRANE);
  return contact + SINK * tween(f, DESC.end, DUR + 6, [0, 1], EASE.inOut);
};

// How far (world px) the blastocyst leads the camera: it visibly drifts down,
// lands, then the camera settles it back to frame centre.
const lead = (f: number) =>
  60 * tween(f, DESC.start + 16, DESC.end - 4, [0, 1], EASE.inOut) *
  (1 - tween(f, DESC.end - 3, DUR - 16, [0, 1], EASE.inOut));

export const camera = (f: number) => {
  const camY = blastoY(f) - lead(f);
  const s =
    1 +
    0.08 * tween(f, 0, B.hundreds, [0, 1], EASE.inOut) -
    0.11 * tween(f, DESC.start + 10, B.implant - 4, [0, 1], EASE.inOut) +
    0.4 * tween(f, B.implant - 4, DUR - 1, [0, 1], Easing.bezier(0.4, 0, 0.45, 1));
  return { camY, s };
};

// 0 = descent not started, 1 = camera fully down at the womb wall.
export const reveal = (f: number) => tween(f, DESC.start, DESC.end, [0, 1], CRANE);

// Implantation: contact glow + tissue wrap.
export const contact = (f: number) => tween(f, B.implant - 2, B.implant + 14, [0, 1], EASE.out);
export const wrap = (f: number) => tween(f, B.implant, DUR - 1, [0, 1], EASE.inOut);

// Colour temperature of the cells: gold-white -> warm peach/rose near the womb.
export const warmth = (f: number) => tween(f, B.hundreds - 6, B.implant + 16, [0, 1], EASE.inOut);
