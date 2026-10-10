import { BEATS } from "../../theme/beats";
import { SCENES } from "../../theme/timing";

// Every Scene5 timing is derived from the story beats, so re-timing the VO in
// theme/beats.ts moves the whole scene with it.
const B = BEATS.Scene5;
const at = (a: number, b: number, k: number) => Math.round(a + (b - a) * k);

export const DURATION = SCENES.find((s) => s.id === "Scene5")!.duration;

export const T = {
  weekForty: B.weekForty,
  birth: B.birth,
  human: B.human,
  hello: B.hello,
  last: DURATION - 1,

  // Birth: light blooms, walls part, baby drifts into the light, gold-white flash.
  bloom: B.birth,
  curtainA: B.birth + 2,
  curtainB: B.human - 6,
  babyGoA: at(B.birth, B.human, 0.15),
  flashUpA: at(B.birth, B.human, 0.5),
  flashPeak: B.human - 7,
  flashOut: B.human + 20,

  // Out in the world: finger slides in, tiny hand closes, little squeeze.
  fingerA: B.human - 2,
  fingerB: at(B.human, B.hello, 0.68),
  curlA: at(B.human, B.hello, 0.58),
  curlB: B.hello - 1,
  squeeze: B.hello,
} as const;
