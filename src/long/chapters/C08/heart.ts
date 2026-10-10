// The heartbeat keeps C07's beat clock (handoff.ts c07BeatClock: phase-locked through
// the fade) and then speeds it up: on "Week eight" the rate climbs from C07's ~124/min
// to ~165/min, heading for the week-9 peak (about 175/min, shown only as a quicker glow,
// no numbers). Same lub-dub shape and envelopes as C07 (world/beat.ts).
import { BEATS as B } from "./beats";
import { c07BeatClock, c07BeatRate } from "./handoff";
import { heartGlow, heartPulse } from "./world/beat";

const R1 = 1.5; // clock speed vs C06's 110/min -> 165/min
const T0 = B.quicken - 4;
const T1 = B.pushEnd;

// integral of a smoothstep 0..x (the rate eases up with no jolt in phase)
const S = (x: number) => (x <= 0 ? 0 : x >= 1 ? x - 0.5 : x * x * x - (x * x * x * x) / 2);

export const beatClock = (f: number) => {
  if (f <= T0) return c07BeatClock(f);
  const d = T1 - T0;
  const r0 = c07BeatRate(T0);
  return c07BeatClock(T0) + r0 * (f - T0) + (R1 - r0) * d * S((f - T0) / d);
};

export const heartAt = (f: number) => {
  const t = beatClock(f);
  return { pulse: heartPulse(t), glow: heartGlow(t) };
};
