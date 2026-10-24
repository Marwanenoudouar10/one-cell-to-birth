// C11 body timeline: the fetus's week, size, pose and placement as a pure
// function of the local frame. Adapted from the teaser's Scene4 timeline (the
// weekTwenty spring-morph with its little inhale, the startle, and the kick's
// tuck -> snap -> springy follow-through), re-driven by C11 BEATS and the
// shared fetus kit (kit week = gestational week).
// `dx` is the sideways placement solved in staging.ts so the kicking foot
// meets the sac wall exactly.
import { spring } from "remotion";
import { noise2D } from "@remotion/noise";
import { FPS } from "../../../theme/layout";
import { EASE, tween } from "../../../lib/ease";
import { FetusPose, crlCm } from "../../../shared/fetus";
import { BEATS as B } from "./beats";

export type P2 = { x: number; y: number };

export const SAC_C: P2 = { x: 540, y: 860 }; // sac centre (world px)
export const R18 = 366; // sac radius before the growth spurt
export const R20 = 404; // sac radius at week 20
export const SIZE20 = 590; // px height of the week-20 curled body
export const ROT = -9; // body roll (deg): the kick lands on the lower-right wall
export const IMPACT = B.kick + 2; // frame the foot meets the wall
export const EAR_HIT = B.startle - 1; // frame the sound ring reaches the ear
// "A flutter...": four light, quick flicks of the same foot that will kick;
// each one is felt by the wall right by the toes (frames of closest approach)
export const TAPS = [1, 7, 14, 21].map((d) => B.flutter + d);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const nz = (seed: string, f: number, speed = 0.012) => noise2D(`c11-${seed}`, f * speed, 0);

// Scene4's growth spring: a soft overshoot, so the spurt feels alive
const grow = (f: number, delay = 0) =>
  spring({ frame: f - (B.weekTwenty + delay), fps: FPS, config: { damping: 11, stiffness: 75, mass: 1 } });

export const core = (f: number, dx: number) => {
  // --- week: 17.7 -> 18 (W18 lands), -> 19 (W19), spring -> 20 (W20) ---
  const w18 = tween(f, 0, B.w18 + 4, [0, 1], EASE.out);
  const w19 = tween(f, B.sound - 16, B.sound + 2, [0, 1], EASE.inOut);
  const m = grow(f, 0);
  const week = 17.7 + 0.3 * w18 + w19 + m;
  // a small inhale (squash) right before the spurt, as in Scene4
  const inhale =
    tween(f, B.weekTwenty - 10, B.weekTwenty - 1, [0, 1], EASE.inOut) -
    tween(f, B.weekTwenty - 1, B.weekTwenty + 6, [0, 1], EASE.out);
  // true relative size (crown-rump length), so the growth is honest
  const size = SIZE20 * (crlCm(week) / crlCm(20)) * (1 - 0.035 * inhale);
  const sacR = R18 + 8 * w19 + (R20 - R18 - 8) * grow(f, 3);

  // --- the tiny startle when the sound ring reaches the ear ---
  const st = tween(f, B.startle - 1, B.startle + 2) * (1 - tween(f, B.startle + 4, B.startle + 22, [0, 1], EASE.inOut));

  // --- the stretch ("its mother feels it move") ---
  // reaches full stretch on "move", holds through "for the first", relaxes on "time"
  const sEnv =
    tween(f, B.stretch, B.stretchPeak, [0, 1], EASE.inOut) * (1 - tween(f, B.stretchPeak + 16, B.stretchEnd + 6, [0, 1], EASE.inOut));

  // --- flutter: the foot flicks toward the wall (3 frames out, 7 back), the
  // toes point with it; the hand gives a small restless wiggle meanwhile ---
  const tap = Math.max(
    0,
    ...TAPS.map((t, i) => (0.34 - 0.03 * i) * tween(f, t - 3, t, [0, 1], EASE.out) * (1 - tween(f, t, t + 7, [0, 1], EASE.inOut))),
  );
  const flEnv = tween(f, B.flutter - 3, B.flutter + 1) * (1 - tween(f, TAPS[3], TAPS[3] + 12, [0, 1], EASE.inOut));
  const flOsc = Math.sin((f - B.flutter) * 0.9);

  // --- the kick (Scene4): tuck -> snap out -> springy follow-through ---
  const K = B.kick;
  const tuck = tween(f, B.tuck, K - 1, [0, 1], EASE.inOut);
  const ext = tween(f, K - 1, K + 3, [0, 1], EASE.out);
  const ret = spring({ frame: f - (K + 9), fps: FPS, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const settle = tween(f, B.settle, B.end + 12, [0, 1], EASE.inOut);
  const kick = (-0.35 * tuck * (1 - ext) + ext * (1 - 0.88 * ret)) * (1 - 0.7 * settle);
  const recoil = ext * (1 - ret);
  const kickPoint = tween(f, K - 1, K + 3) * (1 - tween(f, K + 8, K + 22, [0, 1], EASE.inOut));

  const toes = [0, 1, 2, 3, 4].map(
    (i) =>
      0.15 + 0.15 * nz(`t${i}`, f, 0.04) - 0.8 * kickPoint - 0.55 * sEnv - 0.5 * st - 1.6 * tap * (1 - 0.12 * i),
  );

  const pose: FetusPose = {
    curl: 0.5 - 0.38 * sEnv + 0.03 * nz("cu", f) + 0.04 * tuck * (1 - ext) - 0.05 * st,
    headTilt: 1.4 * nz("ht", f) - 5 * st - 17 * sEnv + 3 * recoil,
    armPose: "rest",
    armSway: 2.2 * nz("as", f) + 11 * st - 30 * sEnv + 4 * flEnv * flOsc,
    handOpen: 0.4 + 0.6 * st + 0.6 * sEnv + 0.08 * nz("ho", f, 0.03) + 0.15 * flEnv * (0.5 + 0.5 * flOsc),
    legKick: kick + 0.16 * st + 0.14 * sEnv + tap,
    toesCurl: toes,
    rotate: ROT - 4 * sEnv - 3 * recoil + 1.3 * nz("fr", f, 0.01),
  };

  // --- placement in the world (scales with the sac as it grows) ---
  const k = sacR / R20;
  const pos: P2 = {
    x: SAC_C.x + dx * k + 6 * nz("fx", f, 0.008) - 14 * recoil,
    y: SAC_C.y + 6 * k + 7 * nz("fy", f, 0.008) - 10 * recoil + 4 * Math.sin(f * 0.07) - 7 * st,
  };

  // warm bloom from the body during the growth spurt (Scene4)
  const bloom = tween(f, B.weekTwenty - 1, B.weekTwenty + 6) * tween(f, B.weekTwenty + 8, B.weekTwenty + 34, [1, 0], EASE.inOut);

  return { week, size, sacR, pose, pos, m, st, sEnv, tap, recoil, bloom };
};

export type Core = ReturnType<typeof core>;
