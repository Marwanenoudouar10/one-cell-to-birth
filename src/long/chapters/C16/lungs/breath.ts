import { Easing } from "remotion";
import { EASE, tween } from "../../../../lib/ease";
import { T } from "../timeline";
import { TRACHEA_S1 } from "./lungTree";

// The first breaths. Each inhale pushes the air front further down the
// branches (s units, 0 = top of the windpipe, 1 = deepest sac). Air stays in
// after each breath (the lungs never collapse back), so the front only advances;
// `inflate` is the in-out volume that makes the whole lungs swell and relax.
const BREATHS = [T.breath1, T.breath2, T.breath3];
// how far each breath gets past the windpipe (0 = carina, 1 = deepest sac)
const FRONT = [0.38, 0.72, 1.12].map((k) => TRACHEA_S1 + k * (1 - TRACHEA_S1));
const INHALE = 8;
const EXHALE = 6;
const IN = Easing.bezier(0.3, 0, 0.2, 1);

export const airFront = (frame: number) =>
  BREATHS.reduce((acc, b, i) => {
    const prev = i === 0 ? 0 : FRONT[i - 1];
    return frame < b ? acc : prev + (FRONT[i] - prev) * tween(frame, b, b + INHALE + 3, [0, 1], IN);
  }, 0);

// 0..1 lung volume: swells on each inhale, relaxes to a resting level that rises
// with every breath (air stays in), then settles into calm newborn breathing.
// Each breath starts from wherever the previous one was, so re-timed beats that
// crowd together never jump.
const REST = [0.3, 0.45, 0.55];
const volume = (i: number, frame: number): number => {
  if (i < 0) return 0;
  const b = BREATHS[i];
  if (frame < b) return volume(i - 1, frame);
  const from = volume(i - 1, b);
  const up = tween(frame, b, b + INHALE, [0, 1], IN);
  const down = tween(frame, b + INHALE, b + INHALE + EXHALE, [0, 1], EASE.inOut);
  return (from + (1 - from) * up) * (1 - down) + REST[i] * down;
};

export const inflate = (frame: number) => {
  const after = BREATHS[2] + INHALE + EXHALE;
  if (frame <= after) return volume(2, frame);
  return REST[2] + 0.1 * (1 - Math.cos(((frame - after) / 26) * Math.PI * 2));
};

// How "airy" a point at path distance s is (0 = fluid-filled, 1 = full of air).
export const airAt = (frame: number, s: number, soft = 0.06) => {
  const a = (airFront(frame) - s) / soft;
  return Math.max(0, Math.min(1, a));
};

// 0..1 how much of the lungs holds air overall (lobes brighten with it).
export const airAll = (frame: number) => {
  const t = Math.max(0, Math.min(1, (airFront(frame) - TRACHEA_S1) / (1.05 - TRACHEA_S1)));
  return t * t * (3 - 2 * t);
};
