// C00 derived timings and per-frame curves. Every time here comes from BEATS
// (beats.ts), so re-timing the voice moves the whole chapter with it.
import { Easing } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import { chapterFrames } from "../../chapters";
import { BEATS as B } from "./beats";
import { layerXf } from "./s1/camera";
import { B as S1, END as S1_END } from "./s1/constants";

export const LAST = chapterFrames("C00") - 1;

export const T = {
  ...B,
  last: LAST,
  // the hand camera's push settles here, then eases back before the plunge.
  // Keyed off `dive` (not `began`) so the thumbnail (frame 0) never moves.
  pushEnd: B.dive - 10,
  // the dive
  streaksIn: B.dive + 3,
  handGone: B.through - 1,
  bloomOut: B.dark + 4,
  // the cell
  cellIn: B.through - 4,
  pullBack: B.land + 6,
  // the crystal's ease-in exit: still in full view on "salt", and it slides
  // right just fast enough to stay >= 45 px clear of the cell's glide to C01
  crystalOut: B.salt - 4,
  crystalGone: B.salt + 11,
  // C01's opening world
  worldIn: B.rewind + 2,
  worldDone: B.egg + 2,
} as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Scene1 clock: 0 on the last frame, so the closing frames ARE Scene1's
// frames -N..0 (its camera and wall wobble are already running).
export const clockAt = (f: number) => f - LAST;

// Scene1 "story" frame for the cell's look: the settled gold zygote (END),
// then run backwards through the fertilisation to the unfertilised egg.
const PRE = S1.fertilise - 1;
export const storyAt = (f: number) => tween(f, B.rewind, B.egg, [S1_END, PRE], Easing.bezier(0.45, 0, 0.3, 1));

// Breathing amplitude: the zygote's 2%, easing to the egg's 0.8% (Scene1).
export const breathAmpAt = (f: number) => tween(f, B.rewind, B.egg, [0.02, 0.008], EASE.inOut);

export type EggXf = { x: number; y: number; z: number };

// Hold and salt framings (z = scale of Scene1's egg units, core r = 100 z).
const HOLD: EggXf = { x: 540, y: 860, z: 1.5 };
export const SALT: EggXf = { x: 195, y: 880, z: 0.76 };

// Where the cell sits on screen.
export const eggXfAt = (f: number): EggXf => {
  // the dive keeps travelling forward: the point of light swells into the
  // cell, fast at first, settling as it arrives
  const k = tween(f, T.cellIn, B.resolved, [0, 1], Easing.bezier(0.12, 0.75, 0.3, 1));
  // then a slow push while it breathes
  const zIn = HOLD.z * Math.pow(0.05, 1 - k) + 0.06 * tween(f, B.resolved, B.smaller + 8, [0, 1], EASE.inOut);
  const p = tween(f, B.smaller, T.pullBack, [0, 1], Easing.bezier(0.4, 0, 0.2, 1));
  let x = lerp(HOLD.x, SALT.x, p);
  let y = lerp(HOLD.y, SALT.y, p);
  let z = lerp(zIn, SALT.z, p);
  // the hand-off: glide into Scene1's camera (which keeps moving to the end)
  const w = tween(f, B.away, B.egg, [0, 1], Easing.bezier(0.5, 0, 0.25, 1));
  if (w > 0) {
    const L = layerXf(clockAt(f), 1);
    x = lerp(x, L.ox, w);
    y = lerp(y, L.oy, w);
    z = lerp(z, L.zL, w);
  }
  return { x, y, z };
};

// Focus pull on the arriving cell.
export const eggBlurAt = (f: number) => tween(f, T.cellIn, B.resolved - 6, [24, 0], Easing.bezier(0.2, 0.6, 0.35, 1));

// C01's world (tube walls, corona, its caption shade) fading in.
export const worldAt = (f: number) => tween(f, T.worldIn, T.worldDone, [0, 1], EASE.inOut);

// Salt crystal: slide in on "smaller", settle, glint on "grain", slide away on "salt".
export const crystalAt = (f: number) => {
  const inn = tween(f, B.smaller - 3, B.land + 4, [0, 1], Easing.bezier(0.2, 0.85, 0.3, 1));
  const out = tween(f, T.crystalOut, T.crystalGone, [0, 1], Easing.bezier(0.5, 0, 0.75, 0.6));
  return { inn, out, on: inn > 0 && out < 1 };
};
