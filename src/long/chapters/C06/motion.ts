// Everything that moves in C06 is timed from here (from BEATS, never raw frames).
// The heart drivers are Scene3's (src/scenes/Scene3/motion.ts) with heartStarts
// -> BEATS.firstBeat; the rest is what the storyboard adds (zip, curl, the tube
// filling, the growth to week 6, the hand-offs).
import { spring } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, heartbeat, tween } from "../../../lib/ease";
import { FPS } from "../../../theme/layout";
import { BEATS as B, BPM, DURATION, LUB, PERIOD } from "./beats";
import { aliveAt } from "./camera";

export { PERIOD };
const DUB = 0.26 * PERIOD;
export const RING_LIFE = 40;

// ---------- Scene3's lub-dub (unchanged maths) ----------
const beatT = (f: number) => f - B.firstBeat;
const raw = (t: number) => (t < 0 ? 0 : heartbeat(t, BPM));
const envelope = (t: number, release: number, span: number) => {
  let m = 0;
  for (let k = 0; k <= span; k += 0.25) m = Math.max(m, raw(t - k) * Math.exp(-k / release));
  return m;
};

// 1 on the first beat, settling to 0 over the next few beats.
export const firstBeat = (f: number) => {
  const t = beatT(f);
  return t < 0 ? 0 : Math.exp(-t / (PERIOD * 0.85));
};
// The lub that lands on "heart" (BEATS.heartWord) beats a little harder: the
// caption's gold word and the picture's beat arrive together. 0..1, under a beat
// long: by BEATS.exit it adds < 1% to the pulse, so C07 inherits Scene3's plain beat.
const ACCENT_N = Math.round((B.heartWord - B.firstBeat - LUB) / PERIOD);
export const accentAt = (f: number) => {
  const t = beatT(f) - ACCENT_N * PERIOD - LUB; // 0 at that lub's peak
  return t < -3 ? 0 : t < 0 ? (t + 3) / 3 : Math.exp(-t / (PERIOD * 0.24));
};
export const heartPulse = (f: number) => envelope(beatT(f), 1.7, 7) * (1 + 0.7 * firstBeat(f) + 0.3 * accentAt(f));
export const heartGlow = (f: number) => envelope(beatT(f), 5.5, 24) * (1 + 0.9 * firstBeat(f) + 0.35 * accentAt(f));

// Anticipation: the world holds its breath just before the first beat.
export const hold = (f: number) =>
  tween(f, B.holdStart, B.firstBeat - 1, [0, 1], EASE.inOut) * tween(f, B.firstBeat, B.firstBeat + 14, [1, 0], EASE.out);

export type Ring = { age: number; strength: number; first: boolean };
export const rings = (f: number): Ring[] => {
  const t = beatT(f);
  if (t < 0) return [];
  const n = Math.floor(t / PERIOD);
  const out: Ring[] = [];
  for (let i = Math.max(0, n - 3); i <= n; i++) {
    const boost = i === 0 ? 1.8 : i === 1 ? 1.15 : 1;
    for (const [off, k] of [[LUB, 1], [DUB, 0.38]] as const) {
      const age = t - (i * PERIOD + off);
      // the "heart" ring launches brighter, back to normal before C07 takes over
      const accent = i === ACCENT_N ? 1 + 0.35 * Math.max(0, 1 - age / 12) : 1;
      if (age >= 0 && age < RING_LIFE) out.push({ age, strength: k * boost * accent, first: i === 0 });
    }
  }
  return out;
};
export const ringRadius = (r: Ring) => 30 + 345 * (1 - Math.pow(1 - r.age / RING_LIFE, 2.2));
export const ringAlpha = (r: Ring) => Math.pow(1 - r.age / RING_LIFE, 1.6) * Math.min(1, r.age / 1.5);

// Idle float of the embryo (calmer during the hold; still at both hand-offs).
export const embryoFloat = (f: number) => {
  const calm = (1 - 0.7 * hold(f)) * aliveAt(f);
  const t = f * 0.012;
  return {
    calm,
    dx: noise2D("c06ex", t, 0) * 5 * calm,
    dy: noise2D("c06ey", 0, t) * 7 * calm,
    rot: noise2D("c06er", t * 0.8, 2) * 2.2 * calm,
  };
};

// ---------- what the storyboard adds ----------
const sp = (f: number, at: number, damping = 13, stiffness = 70) =>
  spring({ frame: f - at, fps: FPS, config: { damping, stiffness, mass: 1 } });

// Embryo-kit week (storyboard mapping: GA 5 = kit 4.6, GA 6 = kit 6.0 = Scene3).
const smooth = (t: number) => t * t * (3 - 2 * t); // gentler than EASE.inOut: the kit changes fast at 4.2-4.5
export const kitWeek = (f: number) => {
  const curl = tween(f, B.curlStart, B.curlEnd, [4.0, 4.6], smooth);
  const creep = tween(f, B.curlEnd, B.growStart, [0, 0.18], EASE.inOut); // stays short of the eye ramp
  const grow = tween(f, B.growStart, B.armBuds, [0, 0.27], EASE.inOut); // "By week six": eye spot comes
  const arms = 0.55 * sp(f, B.armBuds); // springy: arm buds pop
  const legs = 0.4 * sp(f, B.legBuds); // a beat later: leg buds
  const w = curl + creep + grow + arms + legs;
  // the springs leave a ~0.3% wobble: land exactly on 6.0 for the END contract
  return w + (6 - w) * tween(f, B.pushEnd - 4, B.exit, [0, 1], EASE.inOut);
};

// Neural tube closure: from the neck toward both ends (the kit closes both ends last).
export const zipAt = (f: number) => tween(f, B.zipStart, B.zipTail, [0, 1], EASE.inOut);

// Size + placement: C05 left it at size 300 centred on (540, 860); Scene3 puts the
// week-6 embryo at 492,856 x1.15 = kit size 322 centred on (472.45, 835.3).
const START = { x: 540, y: 860, size: 300 };
const S3 = { x: 472.45, y: 835.3, size: 322 };
export const placeAt = (w: number) => {
  const k = EASE.inOut(Math.max(0, Math.min(1, (w - 4) / 2)));
  const g = Math.max(0, Math.min(1, (w - 4.6) / 1.4));
  return { x: START.x + (S3.x - START.x) * k, y: START.y + (S3.y - START.y) * k, size: START.size + (S3.size - START.size) * g };
};

// Warm light filling the tube (0..1), then fully lit on the first beat.
export const fillAt = (f: number) => tween(f, B.fillStart, B.fillEnd, [0, 1], EASE.inOut);
export const ignite = (f: number) => 0.38 * fillAt(f) + 0.62 * tween(f, B.firstBeat, B.firstBeat + 4, [0, 1], EASE.out);

// The squeeze wave along the tube on every beat: u 0 (inflow) .. 1 (outflow),
// arriving as the lub peaks. The first one is slow and strong.
export const squeezeAt = (f: number): { u: number; a: number } | null => {
  const t = beatT(f);
  const n = Math.max(0, Math.floor((t + 8) / PERIOD));
  for (const i of [n, n - 1]) {
    if (i < 0) continue;
    const peak = B.firstBeat + i * PERIOD + LUB;
    const dur = i === 0 ? 10 : 5.5;
    const u = (f - (peak - dur)) / (dur + 1);
    if (u >= 0 && u <= 1.15) return { u: EASE.inOut(Math.min(1, u)), a: (i === 0 ? 1.4 : 1) * Math.min(1, (1.15 - u) / 0.25) };
  }
  return null;
};

// Hand-off in: C05's backdrop gives way to Scene3's womb; the sac resolves around the embryo.
export const worldAt = (f: number) => tween(f, B.worldIn, B.curlEnd - 10, [0, 1], EASE.inOut);
export const resolveAt = (f: number) => tween(f, B.zipStart - 2, B.curlEnd - 6, [0, 1], EASE.inOut);
// Hand-off out (rule 5): C07 fades in on top, so rings, glows and the sac's
// translucent layers fade 1 -> 0 under it while the embryo + yolk stay opaque.
export const exitAt = (f: number) => tween(f, B.exit, DURATION - 1, [1, 0], (t) => t);
// Scene3 dimmed 30%; rule 11 wants non-focal layers down 40%+ while the tube is the subject.
export const dimAt = (f: number) => 1 - 0.42 * hold(f);

// The week-5 tube hands over to the kit's (Scene3's) week-6 heart bulge on a lub:
// the tube swells into the bulge while it fades and the bulge lights (0 tube .. 1 bulge).
export const handoverAt = (f: number) => tween(f, B.heartSwap - 6, B.heartSwap + 5, [0, 1], EASE.inOut);

// Bud pops: a soft accent 0..1..0 at each bud.
export const budPop = (f: number, at: number) => {
  const t = f - at;
  if (t < -2) return 0;
  return Math.max(0, Math.min(1, (t + 2) / 4)) * Math.exp(-Math.max(0, t) / 13);
};
