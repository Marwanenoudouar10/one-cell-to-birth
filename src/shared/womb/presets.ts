// Three ready-made looks so every womb chapter sits in one consistent world.
// Spread them into the components and override what you need:
//   const L = WOMB_LOOKS.mid;
//   <WombBackdrop {...L.backdrop} />
//   <AmnioticSac {...L.sac} ripples={rs}> <Placenta {...L.placenta} /> ... </AmnioticSac>
//   <LightShafts {...L.shafts} />   (as a sac child, so it is clipped to the fluid)
// House rule: the placenta sits on the upper-right wall (-38..-50 deg), the
// key light comes from the upper left.
// Interpolate between looks with mixLook(a, b, t) for growth across a chapter.
import { lerp } from "./geom";

export type WombLook = {
  backdrop: { warmth: number; depth: number; folds: number; r: number; cx: number; cy: number; aspect: number; pear: number };
  sac: { cx: number; cy: number; r: number; aspect: number; pear: number; warmth: number; villi: number; wobble: number };
  placenta: { at: number; size: number; spread: number };
  shafts: { intensity: number };
  cordWidth: number;
};

export const WOMB_LOOKS: Record<"early" | "mid" | "late", WombLook> = {
  // weeks 4-10: small dark glassy sac, fuzzy chorion, soft tissue masses
  early: {
    backdrop: { warmth: 0.1, depth: 1.15, folds: 0.18, r: 360, cx: 540, cy: 860, aspect: 1, pear: 0 },
    sac: { cx: 540, cy: 860, r: 300, aspect: 1, pear: 0, warmth: 0, villi: 1, wobble: 1 },
    placenta: { at: -38, size: 0.7, spread: 26 },
    shafts: { intensity: 1 },
    cordWidth: 9,
  },
  // weeks 12-24: bigger sac, placenta on the upper-right wall, soft folds
  mid: {
    backdrop: { warmth: 0.2, depth: 1.05, folds: 0.45, r: 400, cx: 540, cy: 860, aspect: 1, pear: 0 },
    sac: { cx: 540, cy: 860, r: 360, aspect: 1, pear: 0, warmth: 0.4, villi: 0, wobble: 1 },
    placenta: { at: -38, size: 1, spread: 32 },
    shafts: { intensity: 0.8 },
    cordWidth: 16,
  },
  // weeks 30-40: cramped, nearly frame-filling warm sac hugged by crisp folds
  late: {
    backdrop: { warmth: 0.95, depth: 0.9, folds: 1, r: 436, cx: 540, cy: 850, aspect: 1.05, pear: 0.5 },
    sac: { cx: 540, cy: 850, r: 428, aspect: 1.05, pear: 0.5, warmth: 0.9, villi: 0, wobble: 0.7 },
    placenta: { at: -46, size: 0.85, spread: 30 },
    shafts: { intensity: 0.45 },
    cordWidth: 22,
  },
};

const mixObj = <T extends Record<string, number>>(a: T, b: T, t: number): T => {
  const out = { ...a };
  for (const k of Object.keys(a) as (keyof T)[]) out[k] = lerp(a[k] as number, b[k] as number, t) as T[keyof T];
  return out;
};

// Blend two looks (t 0..1), e.g. mixLook(WOMB_LOOKS.mid, WOMB_LOOKS.late, grow).
export const mixLook = (a: WombLook, b: WombLook, t: number): WombLook => ({
  backdrop: mixObj(a.backdrop, b.backdrop, t),
  sac: mixObj(a.sac, b.sac, t),
  placenta: mixObj(a.placenta, b.placenta, t),
  shafts: mixObj(a.shafts, b.shafts, t),
  cordWidth: lerp(a.cordWidth, b.cordWidth, t),
});
