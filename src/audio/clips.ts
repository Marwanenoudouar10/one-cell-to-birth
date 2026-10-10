import { interpolate } from "remotion";
import { BEATS } from "../theme/beats";
import { FPS } from "../theme/layout";
import { SCENE_START, sec } from "../theme/timing";
import { VO_TIMING } from "../theme/voTiming";

// Every sound in the film. Paths are inside /public. Times are GLOBAL seconds.
// Effects hang off the same story beats the animation uses, so re-timing
// beats.ts moves picture and sound together. Ducking under the voice hangs off
// the word timings in voTiming.ts.
// `volume` is a number or a function of the clip-local frame (frame 0 = the
// clip's first frame), passed straight to Remotion's <Audio volume>.
export type Clip = { src: string; at: number; volume?: number | ((f: number) => number) };

type Scene = keyof typeof BEATS;
const beat = <S extends Scene>(s: S, k: keyof (typeof BEATS)[S], offsetSec = 0) =>
  (SCENE_START[s] + (BEATS[s][k] as number)) / FPS + offsetSec;

// Volume envelope given as [global second, volume] points, held flat before the
// first and after the last point. Returns the clip-local frame function.
const envelope = (at: number, points: [number, number][]) => {
  const f0 = sec(at);
  const ins = points.map(([t]) => t * FPS - f0);
  const outs = points.map(([, v]) => v);
  return (f: number) =>
    interpolate(f, ins, outs, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

export const VOICE: Clip[] = Object.values(VO_TIMING).map((t) => ({ src: t.src, at: t.clipAt }));

export const MUSIC: Clip[] = [];

// "hundreds": a quick cascade of ever smaller, higher pops
const CASCADE = [0, 0.07, 0.12, 0.18, 0.22, 0.27, 0.31, 0.36, 0.4, 0.45].map((d, i) => ({
  src: i % 2 ? "sfx/pop-hi2.wav" : "sfx/pop-hi.wav",
  at: beat("Scene2", "hundreds", d),
  volume: 0.42 * (1 - i * 0.06),
}));

// Scene3: heartbeat.wav starts 0.1 s (3 frames) before heartStarts, so the
// first lub still peaks just after the heart's first beat on screen. It sits
// under "...a tiny heart starts to beat." and comes up once the line ends.
const L4 = VO_TIMING.l4;
const HEART_AT = beat("Scene3", "heartStarts", -0.1);
const HEART_VOL = envelope(HEART_AT, [
  [L4.end, 0.2],
  [L4.end + 0.2, 0.85],
]);

// Scene5: light swell peaks on the flash (riser take peaks 1.25s in). It swells
// at full level, ducks under "...whole new human" (its loudest stretch), then
// comes back for the flash-out tail before "Hello, world."
const L7 = VO_TIMING.l7;
const RISER_AT = (SCENE_START.Scene5 + BEATS.Scene5.human - 7) / FPS - 1.25;
// The render applies volume about 2 frames late, so the duck starts 0.07 s early.
const RISER_VOL = envelope(RISER_AT, [
  [L7.words[6] - 0.07, 0.6], // "a"
  [L7.words[7] - 0.07, 0.2], // "whole"
  [L7.end, 0.2],
  [L7.end + 0.13, 0.45],
]);

export const SFX: Clip[] = [
  // Scene1: the race and the spark
  { src: "sfx/whoosh.wav", at: beat("Scene1", "raceStart", -0.12), volume: 0.55 },
  { src: "sfx/whoosh-low.wav", at: beat("Scene1", "millions", -0.1), volume: 0.4 },
  { src: "sfx/whoosh.wav", at: beat("Scene1", "oneWins", -0.45), volume: 0.28 },
  { src: "sfx/impact.wav", at: beat("Scene1", "fertilise", -0.03), volume: 0.5 },
  // Scene2: cells dividing, then nesting into the wall (pop files start on the hit)
  { src: "sfx/pop.wav", at: beat("Scene2", "two", 0.01), volume: 0.6 },
  { src: "sfx/pop-hi.wav", at: beat("Scene2", "four", 0.01), volume: 0.55 },
  ...CASCADE,
  { src: "sfx/pop-lo.wav", at: beat("Scene2", "implant"), volume: 0.5 },
  { src: "sfx/heartbeat.wav", at: HEART_AT, volume: HEART_VOL },
  // Scene4: the kick
  { src: "sfx/kick.wav", at: beat("Scene4", "kick", -0.02), volume: 0.45 },
  { src: "sfx/riser.wav", at: RISER_AT, volume: RISER_VOL },
];
