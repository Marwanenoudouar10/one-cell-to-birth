// C13 timeline: frame -> every animated value (no geometry here; index.tsx
// turns these into world positions). All times come from beats.ts.
import { Easing } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, pop, tween } from "../../../lib/ease";
import { FPS } from "../../../theme/layout";
import type { FetusPose } from "../../../shared/fetus";
import { weekAtLocal } from "../../lib/weeks";
import { BEATS, TURN } from "./beats";
import { C14_ARM, C14_AT, C14_TOES, C14_TURN_SPEED, c14HeadDown, c14Pose, c14Week } from "./handoff";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Pour choreography around one drop impact frame I (frames relative to I).
export const POUR = { tiltIn: -13, tilted: -7, release: -7, back0: 2, back1: 16, refill0: 8, refill1: 28 } as const;

// Hermite ease 0..1 with zero start speed and end slope m (in units of to/T).
const hermite = (u: number, m: number) => {
  const t = clamp01(u);
  return -2 * t ** 3 + 3 * t ** 2 + m * (t ** 3 - t ** 2);
};

export type Timeline = ReturnType<typeof timeline>;

export const timeline = (f: number) => {
  const drops = BEATS.drops;
  const n = (k: string, sp = 0.012) => noise2D(`c13-${k}`, f * sp, 0);

  // ---- camera mixes: eye close-up -> head -> whole baby
  const toHead = tween(f, BEATS.pullStart, BEATS.pullEnd, [0, 1], Easing.bezier(0.4, 0, 0.2, 1));
  const back = tween(f, BEATS.pullBack, BEATS.pullBackEnd, [0, 1], EASE.inOut);
  const hold = tween(f, BEATS.pullEnd, BEATS.pullBack, [0, 1], EASE.inOut);
  const lerpLog = (a: number, b: number, t: number) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t);
  const zHead = 2.5 + 0.12 * hold;
  const zoom = lerpLog(lerpLog(11, zHead, toHead), 1, back);
  const roll = 1.6 * (1 - toHead) - 0.6 * hold * (1 - back);

  // ---- x-ray window
  const xray =
    tween(f, BEATS.xrayStart, BEATS.xrayFull, [0, 1], EASE.inOut) * (1 - tween(f, BEATS.xrayOff, BEATS.xrayOff + 18, [0, 1], EASE.inOut));

  // ---- brain growth: one spring step per drop, a press on the skull, then the crumple
  const step = drops.reduce((acc, I) => acc + (f >= I - 1 ? 0.037 * pop(f, I) : 0), 0);
  const pressUp = tween(f, BEATS.press, BEATS.press + 10, [0, 1], EASE.out);
  const fold = tween(f, BEATS.foldStart, BEATS.foldEnd, [0, 1], EASE.inOut);
  const pressK = pressUp * (1 - tween(f, BEATS.foldStart, BEATS.foldEnd - 6, [0, 1], EASE.inOut));
  const brainScale = 0.89 + step + 0.03 * pressK + 0.004 * n("breath", 0.05);
  const done = drops.filter((I) => f >= I).length;
  const depth = clamp01(0.5 + 0.13 * drops.reduce((a, I) => a + tween(f, I, I + 12), 0) + 0.15 * fold);
  const insula = 1 - 0.12 * done - 0.5 * fold;
  const flash = drops.reduce((a, I) => a + (f >= I ? Math.exp(-(f - I) / 7) : 0), 0);
  const accent = Math.sin(Math.PI * tween(f, BEATS.brain - 6, BEATS.brain + 24, [0, 1], EASE.inOut));
  const glow = clamp01(0.45 + 0.25 * accent + 0.3 * pressK + 0.1 * fold + 0.06 * n("glow", 0.04));
  const impacts = drops.filter((I) => f >= I && f < I + 40).map((I) => f - I);

  // ---- teaspoon: appears, three pours, lifts away
  const spIn = tween(f, BEATS.spoonIn, BEATS.spoonIn + 12, [0, 1], EASE.out);
  const spOut = tween(f, BEATS.spoonOut, BEATS.spoonOut + 14, [0, 1], EASE.in);
  const pourOf = (I: number) =>
    tween(f, I + POUR.tiltIn, I + POUR.tilted, [0, 1], EASE.inOut) * (1 - tween(f, I + POUR.back0, I + POUR.back1, [0, 1], EASE.out));
  const tilt = Math.max(...drops.map(pourOf));
  const drain = Math.max(...drops.map((I) => tween(f, I + POUR.tiltIn + 2, I + POUR.release, [0, 1], EASE.in) * (1 - tween(f, I + POUR.refill0, I + POUR.refill1, [0, 1], EASE.inOut))));
  const spoon = {
    opacity: spIn * (1 - spOut),
    scale: (0.6 + 0.4 * pop(f, BEATS.spoonIn)) * (1 - 0.2 * spOut),
    lift: -46 * spOut + 3 * n("bob", 0.03),
    angle: -14 + 30 * tilt + 2.5 * n("sway", 0.02),
    fill: 1 - 0.85 * drain,
    slosh: tilt,
    glow: clamp01(flash),
  };
  // drop: k = which pour is live; u = fall progress (0 at release, 1 at impact)
  const live = drops.find((I) => f >= I + POUR.tiltIn + 3 && f < I);
  const drop = live === undefined ? null : {
    form: tween(f, live + POUR.tiltIn + 3, live + POUR.release, [0, 1], EASE.out),
    u: clamp01((f - (live + POUR.release)) / -POUR.release),
  };

  // ---- the fetus: week from the tracker, gentle life, then the half-somersault
  // that blends into C14's own START pose (mirror on throughout: see handoff.ts)
  const fl = f - C14_AT;
  const toC14 = tween(f, BEATS.turnStart - 6, C14_AT, [0, 1], EASE.inOut);
  const lerp = (a: number, b: number) => a + (b - a) * toC14;
  const week = lerp(Math.max(28, Math.min(32.5, weekAtLocal("C13", f))), c14Week(fl));
  const turnSec = (C14_AT - BEATS.turnStart) / FPS;
  const headDown = f > C14_AT ? c14HeadDown(fl) : TURN.to * hermite((f - BEATS.turnStart) / (C14_AT - BEATS.turnStart), (C14_TURN_SPEED * turnSec) / TURN.to);
  const push = tween(f, BEATS.turnStart - 8, BEATS.turnStart + 6, [0, 1], EASE.out) * (1 - tween(f, BEATS.turnStart + 8, C14_AT, [0, 1], EASE.inOut));
  const c = c14Pose(fl);
  const pose: FetusPose = {
    mirror: true,
    headDown,
    rotate: (c.rotate ?? 0) * toC14,
    curl: lerp(0.5 + 0.06 * push, c.curl ?? 0.62),
    headTilt: lerp(2 * n("tilt", 0.015), c.headTilt ?? 4),
    armPose: { rest: 1 - C14_ARM.handToFace * toC14, handToFace: C14_ARM.handToFace * toC14 },
    armSway: lerp(4 * n("arm", 0.02), c.armSway ?? 0),
    handOpen: lerp(0.5 + 0.15 * n("hand", 0.025), c.handOpen ?? 0.35),
    legKick: lerp(0.3 * push, c.legKick ?? 0),
    toesCurl: C14_TOES * toC14,
    eyeOpen: 1 - tween(f, BEATS.eyesShut, BEATS.eyesShut + 16, [0, 1], EASE.inOut),
  };

  return {
    zoom, roll, toHead, back, xray,
    veil: 0.7 * (0.55 + 0.45 * tween(f, BEATS.xrayStart, BEATS.xrayFull, [0, 1], EASE.inOut)) * (1 - tween(f, BEATS.xrayOff - 4, BEATS.pullBackEnd - 4, [0, 1], EASE.inOut)),
    brain: { scale: brainScale, depth, fold, insula, glow, flash: clamp01(flash), impacts },
    press: pressK, spoon, drop, week, pose, toC14,
  };
};

