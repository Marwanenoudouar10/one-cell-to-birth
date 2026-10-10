// C14 motion curves: pure functions of the chapter-local frame, all driven by
// BEATS (never hard-coded frames). Shared by the baby, the rhythm line, the
// mouth swirls, the lung inset and the camera.
import { Easing, interpolate } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { weekAtLocal } from "../../lib/weeks";
import { BEATS as B } from "./beats";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const cosEase = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(u));

// ---- the turn: C13 hands over mid-somersault (headDown 0.6) still moving,
// so the curve leaves frame 0 with some speed and settles softly.
const TURN_EASE = Easing.bezier(0.3, 0.45, 0.3, 1);
export const headDownAt = (f: number) => 0.6 + 0.4 * tween(f, 0, B.turnEnd, [0, 1], TURN_EASE);

// little overshoot "settle" as the head lands (degrees of extra rotation)
export const settleRotAt = (f: number) => {
  const t = (f - B.turnEnd + 8) / 30;
  if (t < 0) return 0;
  return -2.2 * Math.sin(Math.min(t, 1) * Math.PI) * Math.exp(-2.2 * t);
};

// ---- practice breathing: one slow episode with two inhales (peaks on
// "breathing" and "air"), the last exhale ending on "Not" (a normal pause).
const mid = Math.round((B.firstPeak + B.noAir) / 2);
const KEYS: [number, number][] = [
  [B.breatheIn, 0],
  [B.firstPeak, 0.92],
  [mid, 0.1],
  [B.noAir, 0.85],
  [B.breathePause, 0],
];
export const breatheAt = (f: number) => {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [f0, v0] = KEYS[i];
    const [f1, v1] = KEYS[i + 1];
    if (f >= f0 && f <= f1) return v0 + (v1 - v0) * cosEase((f - f0) / (f1 - f0));
  }
  // one small practice movement with the pulse in the inset
  const p = B.practicePulse;
  return 0.32 * cosEase((f - (p - 12)) / 12) * (1 - cosEase((f - p) / 18));
};

// the hand drifts a little off the lips for the breathing episode (so the
// mouth swirls read), then settles back to the C15 handoff pose
export const handAwayAt = (f: number) =>
  tween(f, 14, B.breatheIn + 6, [0, 1], EASE.inOut) * (1 - tween(f, B.pauseHold, B.rhythmOut + 24, [0, 1], EASE.inOut));

// the rhythm trace's own history value (same curve, small organic waver)
export const rhythmAt = (f: number) => breatheAt(f) + 0.03 * noise2D("c14-rh", f * 0.05, 0) * (f < B.breathePause ? 1 : 0.3);

// ---- growth: fetus week follows the tracker (32 -> 36), smoothed so the
// kit's fat/creases grow continuously instead of in weekly steps.
export const fetusWeekAt = (f: number) => {
  let sum = 0;
  let n = 0;
  for (let k = -24; k <= 24; k += 6) {
    sum += weekAtLocal("C14", Math.max(0, f + k));
    n++;
  }
  return Math.max(31.6, Math.min(36.4, sum / n));
};

// ---- camera: the house slow push, framing kept wide for C15's start
export const cameraAt = (f: number) => ({
  zoom: interpolate(f, [0, B.end], [1.0, 1.045], { easing: EASE.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  y: 860 + tween(f, B.chestPush, B.insetOut, [0, -10], EASE.inOut),
});

// ---- envelopes (0..1) for the graphic layers
export const rhythmEnv = (f: number) => tween(f, B.breatheIn - 6, B.breatheIn + 10) * (1 - tween(f, B.pauseHold + 6, B.rhythmOut, [0, 1], EASE.inOut));
export const glowEnv = (f: number) => tween(f, B.headGlow - 10, B.turnEnd + 8, [0, 1], EASE.inOut) * (1 - 0.55 * tween(f, B.turnEnd + 10, B.breathePause, [0, 1], EASE.inOut));

// lungs: chest x-ray window, tree reveal, sacs, surfactant, practice pulse
const out = (f: number) => 1 - tween(f, B.insetOut, B.end - 3, [0, 1], EASE.inOut);
export const xrayEnv = (f: number) => tween(f, B.lungTree - 8, B.lungTree + 10, [0, 1], EASE.inOut) * out(f);
export const treeProg = (f: number) => tween(f, B.lungTree, B.lungTree + 26, [0, 1], EASE.inOut);
export const tipsProg = (f: number) => tween(f, B.sacsBloom - 4, B.sacsBloom + 12, [0, 1], EASE.back);
export const surfProg = (f: number) => tween(f, B.surfactant, B.surfactant + 18, [0, 1], EASE.inOut);
export const shimmerAt = (f: number) => (f - B.surfactant) / 26; // sweep position, 0..1 across
export const pulseProg = (f: number) => (f - B.practicePulse) / 12; // 0..1 root -> sacs
export const sacSwell = (f: number, delay: number) => {
  const t = (f - B.practicePulse - 6 - delay) / 13;
  return t <= 0 ? 0 : Math.sin(Math.min(1, t) * Math.PI) * Math.exp(-0.6 * t);
};
export const lensOpen = (f: number) => tween(f, B.sacsBloom - 9, B.sacsBloom + 9, [0, 1], EASE.back) * out(f);
export const lensFade = out;

// a warm "level-up" bloom on the baby as W36 lands
export const bloomAt = (f: number) => 0.1 + 0.45 * tween(f, B.w36 - 14, B.w36 + 2, [0, 1], EASE.inOut) * (1 - tween(f, B.w36 + 6, B.w36 + 36, [0, 1], EASE.inOut));
