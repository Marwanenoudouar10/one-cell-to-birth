// C06's heartbeat (Scene3's lub-dub maths, copied from src/long/chapters/C06/motion.ts),
// as functions of a BEAT CLOCK t = frames since C06's first beat. C07 drives t with a
// gently time-warped clock (see motion.ts beatClock) so the rate creeps up toward week 8
// without the phase ever jumping.
import { heartbeat } from "../../../../lib/ease";
import { FPS } from "../../../../theme/layout";

export const BPM = 110;
export const PERIOD = (60 / BPM) * FPS;
const LUB = 0.08 * PERIOD;
const DUB = 0.26 * PERIOD;
export const RING_LIFE = 40;

const raw = (t: number) => (t < 0 ? 0 : heartbeat(t, BPM));
const envelope = (t: number, release: number, span: number) => {
  let m = 0;
  for (let k = 0; k <= span; k += 0.25) m = Math.max(m, raw(t - k) * Math.exp(-k / release));
  return m;
};

// 1 on the first beat, settling to 0 over the next few beats (~0 by C07).
export const firstBeat = (t: number) => (t < 0 ? 0 : Math.exp(-t / (PERIOD * 0.85)));
export const heartPulse = (t: number) => envelope(t, 1.7, 7) * (1 + 0.7 * firstBeat(t));
export const heartGlow = (t: number) => envelope(t, 5.5, 24) * (1 + 0.9 * firstBeat(t));

// Pulse rings, one per lub plus a fainter twin per dub. `gain(birthT)` scales each
// ring by the beat-clock time it was born at (C07 lets them die out before the move).
export type Ring = { age: number; strength: number; first: boolean };
export const ringsAt = (t: number, gain: (born: number) => number = () => 1): Ring[] => {
  if (t < 0) return [];
  const n = Math.floor(t / PERIOD);
  const out: Ring[] = [];
  for (let i = Math.max(0, n - 3); i <= n; i++) {
    const boost = i === 0 ? 1.8 : i === 1 ? 1.15 : 1;
    for (const [off, k] of [[LUB, 1], [DUB, 0.38]] as const) {
      const born = i * PERIOD + off;
      const age = t - born;
      const g = gain(born);
      if (age >= 0 && age < RING_LIFE && g > 0.001) out.push({ age, strength: k * boost * g, first: i === 0 });
    }
  }
  return out;
};
export const ringRadius = (r: Ring) => 30 + 345 * (1 - Math.pow(1 - r.age / RING_LIFE, 2.2));
export const ringAlpha = (r: Ring) => Math.pow(1 - r.age / RING_LIFE, 1.6) * Math.min(1, r.age / 1.5);
