// C15 motion: pure functions of the chapter-local frame, all driven by BEATS.
// One source of truth for the baby's pose, the face/ear glow, the camera and
// the membrane ripples, so every layer stays glued together.
import { interpolate, random } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { FetusAnchors, FetusPose, fetusAnchors } from "../../../shared/fetus";
import { Ripple, soundRipples } from "../../../shared/womb";
import { Pt } from "../../../shared/womb/geom";
import { BEATS as B } from "./beats";
import { BABY, C14_END, EAR, KIT_CLOCK, SAC, TRAINS, Train, arcArrival, kit, trainStart } from "./shot";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
// smooth 0 -> 1 -> 0 bump between two frames
const bump = (f: number, a: number, b: number) => Math.sin(Math.PI * clamp01((f - a) / (b - a))) ** 2;
// fast attack, soft decay impulse starting at `at`
const flick = (f: number, at: number, tau: number) => (f < at ? 0 : Math.min(1, (f - at) / 3) * Math.exp(-(f - at) / tau));

// Voice-like unevenness per arc (same formula as the kit's SoundWaves).
export const loudness = (t: Train, k: number) => 0.6 + 0.4 * random(`c15-${t.key}v${k}`);

// ---- envelopes ----------------------------------------------------------------
// settling movement to her voice (1.4-2.2 s) and the deeper, calm settle (4.5-5.3 s)
export const settle1 = (f: number) => tween(f, B.settleIn, B.settleOut, [0, 1], EASE.inOut);
export const settle2 = (f: number) => tween(f, B.warmReach2, B.calm + 8, [0, 1], EASE.inOut);
// the stranger's response: a small, quick stir (fingers flick, head turns a hair)
export const stirAt = (f: number) => flick(f, B.stir, 8);
export const stirTurn = (f: number) => bump(f, B.stir, B.stirOut);

// gentle warm glow on the face: rises with her voice, ebbs away before the
// stranger's arrives (that one gets none), returns fuller and stays warm.
export const faceGlow = (f: number) => {
  const g1 = tween(f, B.warmReach - 3, B.warmGlow, [0, 1], EASE.out) * (1 - tween(f, B.warmGlow + 8, B.coolReach - 4, [0, 0.92], EASE.inOut));
  const g2 = tween(f, B.warmReach2 - 3, B.warmGlow2, [0, 1], EASE.out) * (1 - 0.35 * tween(f, B.calm, B.end, [0, 1], EASE.inOut));
  return Math.max(g1, g2);
};

// the ear brightens softly as each warm arc reaches it
export const earGlow = (f: number) => {
  let v = 0;
  for (const t of TRAINS) {
    if (t.key === "str") continue;
    for (let k = 0; k < t.count; k++) {
      const at = arcArrival(t, k, EAR);
      v += loudness(t, k) * flick(f, at, 9);
    }
  }
  return Math.min(1, v * 0.8);
};

// ---- the baby ---------------------------------------------------------------
export type BabyState = { week: number; size: number; pose: FetusPose; a: FetusAnchors; w: (p: Pt) => Pt };

export const babyAt = (f: number): BabyState => {
  const week = interpolate(f, [0, B.end], [BABY.weekStart, BABY.weekEnd], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const size = interpolate(f, [B.handoff, B.end], [BABY.size, BABY.sizeEnd], { easing: EASE.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // C14's idle (same seeds, same clock) so the handoff frames are identical,
  // calming to half its restlessness once she has spoken the second time.
  const t = kit(f) * 0.02;
  const s1 = settle1(f);
  const s2 = settle2(f);
  const calm = 1 - 0.5 * s2;
  const n = (seed: string, sp: number, k: number) => noise2D(seed, t * sp, k) * calm;
  const st = stirAt(f);
  const turn = stirTurn(f);
  const pose: FetusPose = {
    mirror: true,
    headDown: 1,
    rotate: 1.2 * n("c14-rot", 0.5, 0) - 1.6 * s1 - 0.8 * s2,
    curl: 0.62 + 0.03 * n("c14-curl", 0.6, 1) + 0.05 * s1 + 0.05 * s2,
    headTilt: 4 + 2 * n("c14-tilt", 0.7, 2) + 5 * s1 + 3 * s2 - 5 * turn,
    armPose: { rest: C14_END.arm.rest - 0.25 * s1 - 0.15 * s2, handToFace: C14_END.arm.handToFace + 0.25 * s1 + 0.15 * s2 },
    armSway: 4 * n("c14-arm", 1, 3) + 9 * st,
    handOpen: 0.35 + 0.1 * n("c14-hand", 1, 4) + 0.1 * s1 + 0.55 * st - 0.08 * s2,
    legKick: -0.05 + 0.04 * n("c14-leg", 0.8, 5) + 0.1 * st,
    toesCurl: 0.25 - 0.8 * st,
  };
  const a = fetusAnchors(week, pose, size);
  return { week, size, pose, a, w: (p) => ({ x: BABY.x + p.x, y: BABY.y + p.y }) };
};

// ---- camera: leans in a touch toward the head while she speaks and the
// stranger answers, then relaxes into Scene5's framing for C16 -----------------
const CAM: [number, number, number][] = [
  [0, 1.045, 850], // = C14 END
  [B.handoff, 1.045, 850],
  [B.stirOut, 1.075, 888],
  [B.endHold, 1.033, 871],
  [B.end, 1.031, 872], // ~ Scene5 / C16 START framing (sac r ~418 at y ~848)
];
export const cameraAt = (f: number) => {
  let i = 0;
  while (i < CAM.length - 2 && f > CAM[i + 1][0]) i++;
  const [f0, z0, y0] = CAM[i];
  const [f1, z1, y1] = CAM[i + 1];
  const u = EASE.inOut(clamp01((f - f0) / (f1 - f0)));
  return { zoom: z0 + (z1 - z0) * u, y: y0 + (y1 - y0) * u };
};

// ---- membrane: the sac quivers where each voice comes in (kit clock) --------
export const voiceRipples = (): Ripple[] =>
  TRAINS.flatMap((t) => {
    const start = trainStart(t) + KIT_CLOCK;
    const end = start + (t.length + (t.count - 1) * t.spacing) / t.speed;
    return soundRipples(
      { from: t.from, dir: t.dir, count: t.count, spacing: t.spacing, length: t.length, start, end, seed: `c15-${t.key}`, strength: t.key === "str" ? 0.55 : 1 },
      SAC,
    );
  });
