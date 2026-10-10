import { chapterFrames } from "../../chapters";
import { BEATS } from "./beats";

// Every C16 timing is derived from the story beats in beats.ts, so re-timing the
// voice there moves the whole chapter with it. (Mirrors Scene5's timeline.ts.)
const B = BEATS;
const at = (a: number, b: number, k: number) => Math.round(a + (b - a) * k);

export const DURATION = chapterFrames("C16");

export const T = {
  ...B,
  last: DURATION - 1,

  // Womb: labour waves roll outward through the fold rings.
  labour: [B.fullTerm, B.labour2] as const,

  // Birth: light blooms, walls part, baby drifts into the light, gold-white flash.
  curtainA: B.bloom + 2,
  curtainB: B.flashPeak + 1,
  babyGoA: at(B.bloom, B.flashPeak + 7, 0.15),
  flashUpA: at(B.bloom, B.flashPeak + 7, 0.5),
  flashOut: B.flashPeak + 24,
  swap: B.flashPeak + 1, // womb world is replaced by the lungs under the flash

  // Lungs: they show through the decaying flash and dissolve into the cry light.
  lungsOut: B.cry + 14,

  // Grip: finger slides in, tiny fingers close one by one, squeeze, tighten.
  curlStagger: Math.max(3, Math.round((B.curlB - B.curlA) * 0.17)),
} as const;
