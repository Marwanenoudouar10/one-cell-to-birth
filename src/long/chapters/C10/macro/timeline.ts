// Every animated number of the macro shot (~6.4 s .. end): the zoom-through
// into the fingertip, the two ripples, the locks and the twin slide-in.
import { spring } from "remotion";
import { noise2D } from "@remotion/noise";
import { FPS } from "../../../../theme/layout";
import { EASE, tween } from "../../../../lib/ease";
import { BEATS, after } from "../beats";
import { Pt, flash, lerp, lerpPt } from "../geom";
import { RidgeLook, WAVE_SPEED } from "./ridges";
import { DELAYS } from "./prints";

const B = BEATS;
const io = EASE.inOut;

export type TipPlace = { x: number; y: number; rot: number; s: number; opacity: number; blur: number };
export type TipState = {
  place: TipPlace;
  look: RidgeLook | null; // null = no ridges yet
  dots: number[]; // start-point glow 0..1 per source
  glow: number; // halo + ridge glow strength
  ring: number; // lock ring progress 0..1 (0 = none)
  lock: number; // lock flash 0..1
};

export const SOLO: Pt = { x: 540, y: 826 };
export const PAIR = { a: { x: 316, y: 806 }, b: { x: 764, y: 806 }, s: 0.7 };

const ripple = (f: number, start: number, lockAt: number, dim: number): Omit<TipState, "place"> => {
  const t = (f - start) / FPS;
  const look: RidgeLook | null =
    f < start - 1
      ? null
      : {
          R: DELAYS.map((d) => WAVE_SPEED * Math.max(0, t - d)),
          settle: tween(f, lockAt - Math.round(0.6 * FPS), lockAt - 1, [0, 1], io),
          ridgeA: 0.62 + 0.14 * (1 - dim),
          furrowA: 0.56,
          gold: lerp(0.42, 0.16, tween(f, lockAt, lockAt + 14, [0, 1], io)),
          front: 1 - tween(f, start + Math.round(0.85 * FPS), start + Math.round(1.15 * FPS), [0, 1], io),
          lift: flash(f, lockAt, 9),
        };
  const dots = DELAYS.map((d) => {
    const at = start + Math.round(d * FPS);
    const pop = spring({ frame: f - at + 3, fps: FPS, config: { damping: 12, stiffness: 160, mass: 0.6 } });
    return pop * (1 - tween(f, at + 8, at + 26, [0, 1], io));
  });
  const lock = flash(f, lockAt, 10);
  const ring = f >= lockAt ? tween(f, lockAt, lockAt + 22, [0, 1], EASE.out) : 0;
  const glow = (look ? 0.55 + 0.25 * (1 - tween(f, lockAt, lockAt + 16)) : 0.3) * (1 - 0.35 * dim) + 0.8 * lock;
  return { look, dots, glow, ring: ring >= 1 ? 0 : ring, lock };
};

export const macroTimeline = (f: number, tipS: Pt, tipAngle: number, tipWidth: number) => {
  // --- zoom-through: the pad grows out of the on-screen fetus fingertip
  const z = tween(f, B.macroIn, after(B.macroIn, 0.62), [0, 1], io);
  const s0 = Math.max(0.03, tipWidth / 500);
  const sz = Math.exp(lerp(Math.log(s0), 0, z));
  const gz = (sz - s0) / (1 - s0);
  const enter = tween(f, B.macroIn, after(B.macroIn, 0.3), [0, 1], io);

  // --- twin slide: A eases left + shrinks, B springs in from the right
  const sl = tween(f, B.slideB, after(B.slideB, 0.6), [0, 1], io);
  const sp = spring({ frame: f - B.slideB, fps: FPS, config: { damping: 15, stiffness: 70, mass: 1 } });
  const nz = (k: string, sp2 = 0.01) => noise2D(`c10-m${k}`, f * sp2, 0);

  const aBase = lerpPt(SOLO, PAIR.a, sl);
  const A: TipPlace = {
    x: lerp(tipS.x, aBase.x, gz) + 4 * nz("ax"),
    y: lerp(tipS.y, aBase.y, gz) + 5 * nz("ay"),
    rot: lerp(tipAngle + 90, 0, gz) + lerp(0, 3.5, sl) + 0.6 * nz("ar"),
    s: sz * lerp(1, PAIR.s, sl),
    opacity: enter,
    blur: lerp(11, 0, Math.sqrt(z)),
  };
  const Bp: TipPlace = {
    x: lerp(1330, PAIR.b.x, sp) + 4 * nz("bx"),
    y: lerp(880, PAIR.b.y, sp) + 5 * nz("by"),
    rot: lerp(-16, -3.5, sp) + 0.6 * nz("br"),
    s: PAIR.s,
    opacity: tween(f, B.slideB, after(B.slideB, 0.15)),
    blur: lerp(6, 0, tween(f, B.slideB, after(B.slideB, 0.45))),
  };

  // B forming: A steps back a little (one focal point), then both glow at lockB
  const dimA = tween(f, B.ripplesB - 6, B.ripplesB + 6) * (1 - tween(f, B.lockB - 4, B.lockB + 2));
  const a = { place: A, ...ripple(f, B.ripplesA, B.lockA, dimA) };
  A.s *= 1 + 0.02 * a.lock; // the "click": a tiny pop as the pattern locks
  const lockB = flash(f, B.lockB, 12);
  a.glow += 0.5 * lockB;
  const b = { place: Bp, ...ripple(f, B.ripplesB, B.lockB, 0) };
  Bp.s *= 1 + 0.02 * b.lock;

  // whole macro world: fades in with the pad, slow push + drift
  const world = {
    opacity: tween(f, after(B.macroIn, 0.03), after(B.macroIn, 0.6), [0, 1], io), // an even dissolve from the bright womb
    push: lerp(1, 1.045, tween(f, B.macroIn, B.end, [0, 1], io)),
    bloom: 0.25 * flash(f, B.lockA, 14) + 0.3 * lockB,
    // warm flare that hides the scale-match as we pass into the fingertip
    flare: tween(f, after(B.macroIn, -0.05), after(B.macroIn, 0.18), [0, 1], io) * (1 - tween(f, after(B.macroIn, 0.22), after(B.macroIn, 0.6), [0, 1], io)),
    flareAt: lerpPt(tipS, SOLO, gz),
  };
  // a neighbouring finger, out of focus behind A; steps aside for the twin
  const away = tween(f, after(B.slideB, -0.1), after(B.slideB, 0.45), [0, 1], io);
  const ghost: TipPlace = {
    x: A.x + 330 * A.s + 260 * away, y: A.y + 120 * A.s, rot: A.rot + 7, s: A.s * 0.94,
    opacity: A.opacity * (1 - away) * 0.62, blur: 18,
  };
  return { a, b, ghost, showB: f >= B.slideB, world };
};

export type MacroTL = ReturnType<typeof macroTimeline>;
