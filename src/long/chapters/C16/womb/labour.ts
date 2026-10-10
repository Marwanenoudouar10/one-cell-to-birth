import { T } from "../timeline";

// Labour, kept abstract: slow warm waves that start at the sac and roll outward
// through the concentric womb folds (the womb tightening in waves).
// Each wave's front travels from the sac rim (r 400) out past the frame edge.
const R0 = 380;
const SPEED = 15; // px per frame
const WIDTH = 120; // px, soft width of a front
const RISE = 10; // frames for a wave to swell at the sac before it rolls out

const waveFront = (frame: number, start: number) => R0 + Math.max(0, frame - start - RISE) * SPEED;

// 0..1 envelope of a wave: swells in, then thins out as it travels.
const envelope = (frame: number, start: number) => {
  const t = frame - start;
  if (t < 0) return 0;
  const swell = Math.min(1, t / RISE);
  const fade = Math.exp(-Math.max(0, t - RISE) / 38);
  return swell * swell * (3 - 2 * swell) * fade;
};

const STRENGTH = [1, 0.8];

// How much the labour wave is pushing at radius r (px from the sac centre).
export const labourAt = (frame: number, r: number) =>
  T.labour.reduce((acc, start, k) => {
    const front = waveFront(frame, start);
    const g = Math.exp(-((r - front) ** 2) / (2 * WIDTH * WIDTH));
    return acc + g * envelope(frame, start) * STRENGTH[k];
  }, 0);

// The sac itself is squeezed gently while each wave swells.
export const labourSqueeze = (frame: number) => Math.min(1, labourAt(frame, R0));

export const labourWaves = (frame: number) =>
  T.labour.map((start, k) => ({ r: waveFront(frame, start), a: envelope(frame, start) * STRENGTH[k] }));
