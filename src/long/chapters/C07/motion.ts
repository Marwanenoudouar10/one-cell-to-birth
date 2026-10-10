// Everything that moves in C07, as pure functions of the chapter-local frame.
// Beat frames come from beats.ts only.
import { Easing, interpolate } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { BEATS as B, C06_BEAT0, C06_END, C06_OFFSET, DURATION } from "./beats";
import { Pose } from "./pose";
import { heartGlow, heartPulse, ringsAt } from "./world/beat";

const sine = Easing.inOut(Easing.sin);
const keys = (f: number, ts: number[], vs: number[]) =>
  interpolate(f, ts, vs, { easing: sine, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// A clock whose speed eases linearly from 1 to `to` over [a, b] (C1: no jolt).
const slowClock = (f: number, a: number, b: number, to: number) => {
  if (f <= a) return f;
  const L = b - a;
  if (f >= b) return a + (L * (1 + to)) / 2 + (f - b) * to;
  const u = (f - a) / L;
  return a + L * (u - ((1 - to) * u * u) / 2);
};

// ---- clocks (C06's noise clocks continue as f + 240)
// The womb WALL eases to a dead stop before the first move and never moves again
// (C11's first felt flutter is the first time it stirs).
const WALL_STOP = [B.fadeEnd, B.firstMove - 10] as const;
export const wallClock = (f: number) => C06_OFFSET + slowClock(f, WALL_STOP[0], WALL_STOP[1], 0);
export const WALL_FROZEN = wallClock(1e6);
// the amniotic sac (membrane, villi, rays) calms to a slow drift in the wide shot
export const sacClock = (f: number) => C06_OFFSET + slowClock(f, B.pullBack - 20, B.wide, 0.35);
export const sacWob = (f: number) => tween(f, B.pullBack - 20, B.wide, [1, 0.5], EASE.inOut);
export const fluidClock = (f: number) => C06_OFFSET + f; // specks + bokeh keep drifting

// ---- growth: kit week 6.0 -> 7.0 (GA 7 -> 7.5); arm buds lengthen into paddles
export const kitWeek = (f: number) =>
  tween(f, B.grow, B.grown, [6, 6.85], EASE.inOut) + tween(f, B.grown, B.exit, [0, 0.15], EASE.inOut);
// the head swells ahead of the body (the brain outgrows the trunk), then the body
// catches up: by the END the head is the kit's own week-7 head again
export const headWeek = (f: number) =>
  tween(f, B.grow - 2, B.grown - 12, [6, 7.15], EASE.inOut) - tween(f, B.pullBack, B.exit, [0, 0.15], EASE.inOut);
export const embryoSize = (f: number) => tween(f, B.grow, B.grown + 10, [C06_END.embryo.size, 350], EASE.inOut);
export const SIZE_END = 350;

// ---- the moves: unit bend curves (anticipation, flex, recoil past rest, settle)
const firstBend = (f: number) => {
  const t = B.firstMove;
  return keys(f, [t - 6, t, t + 8, t + 16, t + 22, t + 27], [0, -0.16, 1, -0.4, 0.08, 0]);
};
const secondBend = (f: number) => {
  const t = B.wiggle;
  return keys(f, [t, t + 7, t + 14, t + 21, t + 27], [0, 0.66, -0.24, 0.05, 0]);
};
// in the wide shot: one flick inside the still womb ("...anyone can feel it"). The
// embryo is only ~230 px wide there, so it flexes a little further than the first move
// (crown travel ~45 px on screen, ~11 px on a phone) to stay readable.
const twitch = (f: number) => {
  const t = B.twitch;
  return keys(f, [t - 4, t, t + 6, t + 12, t + 19], [0, -0.12, 1.25, -0.3, 0]);
};
export const bendAt = (f: number) => firstBend(f) + secondBend(f) + twitch(f);

// Pose: the head leads, the rump follows 3 frames later (a wave down the body), the
// chin tucks, the paddles swing passively behind.
// The recoil lifts the head only a little (a raised chin reads as a beak at phone size).
const soften = (u: number, k: number) => (u < 0 ? k * u : u);
export const poseAt = (f: number): Pose => ({
  head: 24 * soften(bendAt(f), 0.6),
  rump: -28 * bendAt(f - 3),
  nod: 12 * soften(bendAt(f - 1), 0.25),
  arm: 18 * bendAt(f - 5),
  leg: -13 * bendAt(f - 6),
  headWeek: headWeek(f),
});
// how fast the body is bending (motion arcs), 0..1
export const bendSpeed = (f: number) => Math.min(1, Math.abs(bendAt(f) - bendAt(f - 2)) / 0.22);

// A glint runs down the spinal cord just before each move (spinal circuits fire it):
// it leaves the neck on "first" and reaches the rump as the bend starts.
export const sparkAt = (f: number) => {
  const a = tween(f, B.spark, B.firstMove + 2, [0, 1], EASE.inOut);
  const b = tween(f, B.wiggle - 11, B.wiggle + 1, [0, 1], EASE.inOut);
  const env = (x: number) => (x > 0 && x < 1 ? Math.min(1, x / 0.12, (1 - x) / 0.18) : 0);
  return env(b) > 0 ? { at: b, amount: 0.75 * env(b) } : { at: a, amount: env(a) };
};

// ---- idle float (C06's embryoFloat noise, continued on its clock): still at both
// hand-offs, calm during the moves so the bends read, quiet in the wide shot
export const calmAt = (f: number) =>
  tween(f, B.fadeEnd, B.grown, [0, 1], EASE.inOut) *
  tween(f, B.spark - 10, B.spark + 6, [1, 0.35], EASE.inOut) *
  tween(f, B.wiggle + 26, B.pullBack + 10, [1, 1.6], EASE.inOut) *
  tween(f, B.pushIn - 10, B.exit, [1, 0], EASE.inOut);
export const floatAt = (f: number) => {
  const calm = calmAt(f);
  const t = (f + C06_OFFSET) * 0.012;
  return {
    dx: noise2D("c06ex", t, 0) * 5 * calm,
    dy: noise2D("c06ey", 0, t) * 7 * calm,
    rot: noise2D("c06er", t * 0.8, 2) * 2.2 * calm,
  };
};

// ---- heart: C06's 110/min lub-dub, phase-locked at frame 0, its rate creeping up
// x1.14 by the END (heading for the week-9 peak). beatClock = C06's beatT.
const RATE = 0.14 / DURATION;
export const beatClock = (f: number) => C06_BEAT0 + f + (RATE * f * f) / 2;
export const heartAt = (f: number) => {
  const t = beatClock(f);
  return { pulse: heartPulse(t), glow: heartGlow(t) };
};
// C06's pulse rings die out before the first move: the sac is calm while it moves.
const RING_FADE = [beatClock(B.fadeEnd), beatClock(B.grown)] as const;
export const ringsFor = (f: number) => ringsAt(beatClock(f), (born) => tween(born, RING_FADE[0], RING_FADE[1], [1, 0], EASE.inOut));
// C06's heart halo calms as the eye moves from the heart to the first move.
export const haloAmount = (f: number) => tween(f, B.grow, B.firstMove - 8, [1, 0.45], EASE.inOut);
export const HALO_END = 0.45;

// ---- accents: a soft warm bloom where each paddle forms
export const paddleGlow = (f: number, at: number) => {
  const t = f - at;
  if (t < -8) return 0;
  return Math.min(1, (t + 8) / 10) * Math.exp(-Math.max(0, t) / 20);
};

// ---- world hand-over for the wide shot: C06's blurred wall masses give way to the
// kit backdrop (same masses + fold rings), all frozen still
export const kitWallAt = (f: number) => tween(f, B.pullBack, B.pullBack + 30, [0, 1], EASE.inOut);
export const foldsAt = (f: number) => tween(f, B.pullBack + 4, B.wide, [0, 0.5], EASE.inOut);
export const FOLDS_END = 0.5;
export const bokehAt = (f: number) => tween(f, B.pullBack, B.pullBack + 22, [1, 0], EASE.inOut);
export const topShadeAt = (f: number) => tween(f, B.pullBack + 10, B.wide, [0, 0.5], EASE.inOut);
// rule 5: our translucent world fades out under C08 (embryo + yolk stay opaque)
export const exitAt = (f: number) => tween(f, B.exit, DURATION - 1, [1, 0], (t) => t);
