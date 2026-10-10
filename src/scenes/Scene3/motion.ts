import { interpolate, spring } from "remotion";
import { noise2D } from "@remotion/noise";
import { BEATS } from "../../theme/beats";
import { FPS } from "../../theme/layout";
import { EASE, heartbeat, tween } from "../../lib/ease";
import { Pt } from "./geometry";

// Everything that moves in Scene3 is timed from here.
export const B = BEATS.Scene3;
export const DURATION = 165;
export const SAC = { x: 540, y: 860, r: 330 } as const;
// Where the embryo's local origin sits in the world, and its size.
export const EMBRYO = { x: 492, y: 856, scale: 1.15 } as const;

export const BPM = 110;
export const PERIOD = (60 / BPM) * FPS;
const LUB = 0.08 * PERIOD;
const DUB = 0.26 * PERIOD;
export const RING_LIFE = 40;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const beatT = (frame: number) => frame - B.heartStarts;
const raw = (t: number) => (t < 0 ? 0 : heartbeat(t, BPM));

// Fast attack / smooth release of the lub-dub. Sampled at sub-frames so every
// beat peaks equally (the raw curve is ~1 frame wide and would alias at 30fps).
const envelope = (t: number, release: number, span: number) => {
  let m = 0;
  for (let k = 0; k <= span; k += 0.25) m = Math.max(m, raw(t - k) * Math.exp(-k / release));
  return m;
};

// 1 on the first beat, settling to 0 over the next few beats.
export const firstBeat = (frame: number) => {
  const t = beatT(frame);
  return t < 0 ? 0 : Math.exp(-t / (PERIOD * 0.85));
};

export const heartPulse = (frame: number) =>
  envelope(beatT(frame), 1.7, 7) * (1 + 0.7 * firstBeat(frame));
export const heartGlow = (frame: number) =>
  envelope(beatT(frame), 5.5, 24) * (1 + 0.9 * firstBeat(frame));

// Anticipation: the world holds its breath just before the first beat.
export const hold = (frame: number) =>
  tween(frame, B.heartStarts - 24, B.heartStarts - 1, [0, 1], EASE.inOut) *
  tween(frame, B.heartStarts, B.heartStarts + 14, [1, 0], EASE.out);

// The heart lights up on the first beat and stays lit.
export const ignite = (frame: number) =>
  tween(frame, B.heartStarts, B.heartStarts + 4, [0, 1], EASE.out);

export type Ring = { age: number; strength: number; first: boolean };
export const rings = (frame: number): Ring[] => {
  const t = beatT(frame);
  if (t < 0) return [];
  const n = Math.floor(t / PERIOD);
  const out: Ring[] = [];
  for (let i = Math.max(0, n - 3); i <= n; i++) {
    const boost = i === 0 ? 1.8 : i === 1 ? 1.15 : 1;
    for (const [off, k] of [[LUB, 1], [DUB, 0.38]] as const) {
      const age = t - (i * PERIOD + off);
      if (age >= 0 && age < RING_LIFE) out.push({ age, strength: k * boost, first: i === 0 });
    }
  }
  return out;
};

// Ring radius over its life (world px from the heart).
// Fast launch, decelerating as it spreads; it dies out just past the membrane.
export const ringRadius = (r: Ring) => 30 + 345 * (1 - Math.pow(1 - r.age / RING_LIFE, 2.2));
export const ringAlpha = (r: Ring) => Math.pow(1 - r.age / RING_LIFE, 1.6) * Math.min(1, r.age / 1.5);

// Embryo arrival: floats in, scales up, focus pulls from blur.
export const reveal = (frame: number) => {
  const t0 = B.weekSix - 12;
  const sp = spring({ frame: frame - t0, fps: FPS, config: { damping: 13, stiffness: 42, mass: 1.2 } });
  return {
    opacity: tween(frame, 0, t0 + 24, [0.35, 1]),
    // stays soft through the crossfade, then the focus pull lands on "Week six"
    blur: 34 * (1 - interpolate(frame, [4, B.weekSix + 20], [0, 1], { ...clamp, easing: EASE.inOut })),
    scale: 0.7 + 0.3 * sp,
    dy: (1 - sp) * 54,
    rot: (1 - sp) * -16,
  };
};

// Idle float of the embryo (calmer during the anticipation hold).
export const embryoFloat = (frame: number) => {
  const calm = 1 - 0.7 * hold(frame);
  const t = frame * 0.012;
  return {
    calm,
    dx: noise2D("s3ex", t, 0) * 5 * calm,
    dy: noise2D("s3ey", 0, t) * 7 * calm,
    rot: noise2D("s3er", t * 0.8, 2) * 2.2 * calm,
  };
};

export type Cam = { scale: number; fx: number; fy: number; dx: number; dy: number; rot: number };
const PUSH_END = DURATION + 30;

// Slow push 1.00 -> 1.15 toward the heart, with a pause before the first beat
// and a small thump when it lands.
export const camera = (frame: number, target: Pt): Cam => {
  const pre = tween(frame, 0, B.heartStarts - 6, [0, 0.035], EASE.inOut);
  const endNorm = EASE.inOut((DURATION - 1 - B.heartStarts) / (PUSH_END - B.heartStarts));
  const post = interpolate(frame, [B.heartStarts, PUSH_END], [0, 1], { ...clamp, easing: EASE.inOut }) / endNorm;
  const k = Math.max(0, frame - B.heartStarts - 1) / 3;
  const kick = k * Math.exp(1 - k);
  const scale = 1 + pre + 0.115 * post + 0.03 * kick;
  const p = Math.min(1, (scale - 1) / 0.15) * 0.55;
  const t = frame * 0.01;
  return {
    scale,
    fx: SAC.x + (target.x - SAC.x) * p,
    fy: SAC.y + (target.y - SAC.y) * p,
    dx: noise2D("s3cx", t, 0) * 6,
    dy: noise2D("s3cy", 0, t) * 6,
    rot: noise2D("s3cr", t * 0.6, 3) * 0.5,
  };
};

// SVG transform for a depth layer (depth 1 = sac plane, <1 far, >1 near).
export const camTransform = (c: Cam, depth = 1) => {
  const s = 1 + (c.scale - 1) * depth;
  const fx = SAC.x + (c.fx - SAC.x) * depth;
  const fy = SAC.y + (c.fy - SAC.y) * depth;
  return `translate(${SAC.x + c.dx * depth} ${SAC.y + c.dy * depth}) rotate(${c.rot * depth}) scale(${s}) translate(${-fx} ${-fy})`;
};
