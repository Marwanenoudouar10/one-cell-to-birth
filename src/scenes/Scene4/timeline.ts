import { spring } from "remotion";
import { noise2D } from "@remotion/noise";
import { BEATS } from "../../theme/beats";
import { FPS } from "../../theme/layout";
import { EASE, pop, tween } from "../../lib/ease";
import { Frame, P, lerp, lerpPt } from "./geom";
import { Pose } from "./rig";

// Every animated number of the scene, as a pure function of the local frame.
// All story moments are driven by BEATS.Scene4 so the VO can be re-timed.
const B = BEATS.Scene4;
const K = B.kick;
export const IMPACT = K + 2; // frame the foot meets the sac wall

const nz = (seed: string, f: number, speed = 0.012) => noise2D(seed, f * speed, 0);

const grow = (f: number, delay: number) =>
  spring({ frame: f - (B.weekTwenty + delay), fps: FPS, config: { damping: 11, stiffness: 75, mass: 1 } });

export const timeline = (f: number) => {
  // --- week 12 -> week 20 growth (head leads, limbs follow) ---
  const mHead = grow(f, -2);
  const m = grow(f, 0);
  const mLimb = grow(f, 4);
  // a small inhale (squash) right before the growth spurt
  const inhale =
    tween(f, B.weekTwenty - 10, B.weekTwenty - 1, [0, 1], EASE.inOut) -
    tween(f, B.weekTwenty - 1, B.weekTwenty + 6, [0, 1], EASE.out);

  // --- fingers: curl in (anticipation), spring open, relax ---
  const fa = tween(f, B.fingers - 9, B.fingers - 1, [0, 1], EASE.inOut);
  const fo = pop(f, B.fingers);
  const fr = tween(f, B.toes + 4, B.toes + 26, [0, 1], EASE.inOut);
  const startle = tween(f, K, K + 3) * (1 - tween(f, K + 6, K + 24, [0, 1], EASE.inOut));
  const spread =
    (0.28 - 0.22 * fa) * (1 - fo) + fo * lerp(1, 0.6, fr) + 0.04 * nz("fs", f, 0.05) + 0.2 * startle;

  // --- toes: stretch, then a curling wiggle that ripples across the toes ---
  const tStretch = tween(f, B.toes - 8, B.toes - 1, [0, 1], EASE.inOut) * (1 - tween(f, B.toes - 1, B.toes + 5));
  const tEnv = tween(f, B.toes - 1, B.toes + 4) * (1 - tween(f, B.toes + 22, B.toes + 34, [0, 1], EASE.inOut));
  const kickPoint = tween(f, K - 1, K + 3) * (1 - tween(f, K + 8, K + 22, [0, 1], EASE.inOut));
  const toes = [0, 1, 2, 3, 4].map(
    (i) =>
      0.15 + 0.15 * nz(`t${i}`, f, 0.04) - 0.7 * tStretch - 0.8 * kickPoint +
      tEnv * (0.35 + 0.65 * Math.sin((f - B.toes) * 0.62 - i * 0.9)),
  );

  // --- face: the chin lifts a touch into the light ---
  const lift = tween(f, B.face - 6, B.face + 10, [0, 1], EASE.inOut) * (1 - tween(f, B.weekTwenty - 14, B.weekTwenty, [0, 1], EASE.inOut));

  // --- the kick: tuck (anticipation) -> snap out -> springy follow-through ---
  const tuck = tween(f, K - 14, K - 1, [0, 1], EASE.inOut);
  const ext = tween(f, K - 1, K + 3, [0, 1], EASE.out);
  const ret = spring({ frame: f - (K + 9), fps: FPS, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const kick = -0.35 * tuck * (1 - ext) + ext * (1 - 0.88 * ret);
  const recoil = ext * (1 - ret);

  const pose: Pose = {
    m, mHead, mLimb, spread, toes, kick,
    headTilt: 1.4 * nz("ht", f) - 5 * lift + 3 * recoil,
    armSway: 2.2 * nz("as", f) + 5 * startle,
  };

  // --- fetus placement in the world (origin = sac centre) ---
  const resolve = spring({ frame: f - 6, fps: FPS, config: { damping: 200 }, durationInFrames: B.weekTwelve + 26 });
  const base = lerpPt(P(-58, 30), P(-64, 4), m);
  const fetus: Frame = {
    x: base.x + 6 * nz("fx", f, 0.008) - 14 * recoil,
    y: base.y + 7 * nz("fy", f, 0.008) - 10 * recoil + 4 * Math.sin(f * 0.07),
    rot: -3 + 6 * m + 1.3 * nz("fr", f, 0.01) - 3 * recoil, // leans into a deeper curl as it grows
    s: lerp(0.93, 1, resolve) * lerp(1, 1.1, m) * (1 - 0.035 * inhale),
  };
  const blur = tween(f, 4, B.weekTwelve + 14, [12, 0], EASE.inOut);

  // --- sac ---
  const sacR = lerp(360, 470, m) * (1 + 0.004 * Math.sin(f * 0.09));

  // --- camera: rack between hand -> toes -> face, then pull back wide ---
  const io = EASE.inOut;
  const wHand = tween(f, B.fingers - 12, B.fingers + 2, [0, 1], io) - tween(f, B.toes - 10, B.toes + 3, [0, 1], io);
  const wFoot = tween(f, B.toes - 10, B.toes + 3, [0, 1], io) - tween(f, B.face - 10, B.face + 3, [0, 1], io);
  const wFace = tween(f, B.face - 10, B.face + 3, [0, 1], io) - tween(f, B.weekTwenty - 16, B.weekTwenty + 2, [0, 1], io);
  const wSum = wHand + wFoot + wFace;
  // the pull-back lags the growth spurt, so the growth reads on screen first
  const pull = tween(f, B.weekTwenty + 2, B.weekTwenty + 32, [0, 1], io);
  const punch = tween(f, IMPACT - 1, IMPACT + 1) * Math.exp(-Math.max(0, f - IMPACT) / 6);
  const zoom = lerp(1, 1.04, tween(f, 0, 224, [0, 1], io)) * (1 + 0.5 * wHand + 0.45 * wFoot + 0.38 * wFace) * lerp(1, 0.82, pull) * (1 + 0.02 * punch);
  const shakeA = 3.5 * tween(f, IMPACT - 1, IMPACT) * Math.exp(-Math.max(0, f - IMPACT) / 7);
  const shake = P(shakeA * noise2D("sx", f * 0.45, 0), shakeA * noise2D("sy", 0, f * 0.45));

  // --- highlights ---
  const ringHand = tween(f, B.fingers - 1, B.fingers + 14) * tween(f, B.toes - 8, B.toes, [1, 0], EASE.in);
  const ringFoot = tween(f, B.toes - 1, B.toes + 14) * tween(f, B.face - 8, B.face, [1, 0], EASE.in);
  // the light finishes crossing the face (lips, chin) while the camera still
  // holds the close-up; the pull-back only starts once the sweep is done
  const sweep = tween(f, B.face - 2, B.face + 18, [0, 1], io);
  const faceGlow = tween(f, B.face - 2, B.face + 8) * tween(f, B.weekTwenty - 12, B.weekTwenty - 2, [1, 0], EASE.in);

  // warm bloom from the body during the growth spurt
  const bloom = tween(f, B.weekTwenty - 1, B.weekTwenty + 6) * tween(f, B.weekTwenty + 8, B.weekTwenty + 34, [1, 0], io);

  return {
    bloom, pose, fetus, blur, sacR, zoom, shake, wHand, wFoot, wFace, wSum, punch,
    ringHand, ringFoot, sweep, faceGlow, m,
    translucency: lerp(1, 0.65, m),
  };
};

export type TL = ReturnType<typeof timeline>;
