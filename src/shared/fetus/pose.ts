// Pose inputs of the fetus. Every field is optional and animatable (numbers
// you can tween frame by frame); named poses blend through weights.
import { clamp } from "./geom";

export type ArmPoseName = "rest" | "handToFace" | "thumbSuck";
// Weights per arm pose, e.g. { rest: 0.3, thumbSuck: 0.7 }. Normalised.
export type ArmPoseMix = Partial<Record<ArmPoseName, number>>;
export type ExpressionName = "neutral" | "smile" | "frown";

export type FetusPose = {
  curl?: number; // 0 stretched .. 0.5 natural (default) .. 1 tightly curled
  headTilt?: number; // degrees, + = chin down toward the chest (default 0)
  armPose?: ArmPoseName | ArmPoseMix; // default "rest" (hand raised by the chin)
  armSway?: number; // degrees of idle arm motion (drive with noise), default 0
  handOpen?: number; // 0 fist .. 1 open fan (default 0.4)
  legKick?: number; // -0.35 tucked (anticipation) .. 0 rest .. 1 fully extended
  toesCurl?: number | number[]; // -1 stretched .. 1 curled; one value or 5 per toe
  headDown?: number; // 0 upright .. 1 head-down (whole body turned 180 deg)
  breathe?: number; // 0..1 practice-breathing inhale (chest rises, belly dips)
  hiccup?: number; // 0..1 impulse: drive with a fast spike (e.g. exp decay)
  expression?: ExpressionName | number; // -1 frown .. 0 neutral .. 1 smile (subtle)
  eyeOpen?: number; // 0..1; only takes effect from ~week 26 (lids fused before)
  mirror?: boolean; // face left instead of right (light stays upper-left)
  rotate?: number; // extra whole-body rotation, degrees (light stays upper-left)
};

export type ArmWeights = Record<ArmPoseName, number>;

export type ResolvedPose = {
  curl: number;
  headTilt: number;
  arm: ArmWeights;
  armSway: number;
  handOpen: number;
  legKick: number;
  toes: number[];
  headDown: number;
  breathe: number;
  hiccup: number;
  expression: number;
  eyeOpen: number;
  mirror: boolean;
  rotate: number;
};

const EXPR: Record<ExpressionName, number> = { neutral: 0, smile: 1, frown: -1 };

const armWeights = (a: FetusPose["armPose"]): ArmWeights => {
  const raw: ArmPoseMix = typeof a === "string" ? { [a]: 1 } : a ?? { rest: 1 };
  const w = {
    rest: Math.max(0, raw.rest ?? 0),
    handToFace: Math.max(0, raw.handToFace ?? 0),
    thumbSuck: Math.max(0, raw.thumbSuck ?? 0),
  };
  const s = w.rest + w.handToFace + w.thumbSuck;
  if (s < 1e-6) return { rest: 1, handToFace: 0, thumbSuck: 0 };
  return { rest: w.rest / s, handToFace: w.handToFace / s, thumbSuck: w.thumbSuck / s };
};

export const resolvePose = (p: FetusPose = {}): ResolvedPose => {
  const tc = p.toesCurl ?? 0.15;
  const toes = Array.isArray(tc) ? [0, 1, 2, 3, 4].map((i) => tc[i] ?? tc[tc.length - 1] ?? 0) : [tc, tc, tc, tc, tc];
  const ex = p.expression ?? 0;
  return {
    curl: clamp(p.curl ?? 0.5),
    headTilt: p.headTilt ?? 0,
    arm: armWeights(p.armPose),
    armSway: p.armSway ?? 0,
    handOpen: clamp(p.handOpen ?? 0.4),
    legKick: clamp(p.legKick ?? 0, -0.35, 1),
    toes: toes.map((t) => clamp(t, -1, 1)),
    headDown: clamp(p.headDown ?? 0),
    breathe: clamp(p.breathe ?? 0),
    hiccup: clamp(p.hiccup ?? 0),
    expression: clamp(typeof ex === "string" ? EXPR[ex] : ex, -1, 1),
    eyeOpen: clamp(p.eyeOpen ?? 0),
    mirror: !!p.mirror,
    rotate: p.rotate ?? 0,
  };
};

// The pose used to measure `size` (so pose changes never rescale the body).
export const REFERENCE_POSE: FetusPose = {};
