// Macro-eye geometry (head-local units of the fetus kit: face toward +x, the
// kit's eye centre lm.eye ~ (90, 8)) and the lid timeline (seal -> crack ->
// open -> one slow blink). Closed, the lid line matches the kit's own closed
// eye exactly, so the close-up can take over from the kit without a pop.
import { interpolate } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE } from "../../../lib/ease";
import { BEATS } from "./beats";
import { P2 } from "./rig";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ramp = (f: number, a: number, b: number, ease = EASE.inOut) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// 0 sealed .. 1 open
export const lidOpenAt = (f: number) => {
  if (f < BEATS.lidCrack) return 0;
  // a hairline parting that trembles, then the slow, soft opening
  const crack = 0.11 * ramp(f, BEATS.lidCrack, BEATS.lidOpen, EASE.out);
  const tremble = f < BEATS.lidOpen + 6 ? 0.018 * noise2D("c12-trem", f * 0.35, 0) * ramp(f, BEATS.lidCrack, BEATS.lidCrack + 6) : 0;
  const open = ramp(f, BEATS.lidOpen, BEATS.lidOpenFull, (t) => EASE.inOut(t) * 0.7 + EASE.out(t) * 0.3);
  let o = Math.max(0, crack + tremble) * (1 - open) + open;
  // the blink: a soft close, a beat shut, an even softer reopening
  if (f >= BEATS.blinkDown) {
    const down = ramp(f, BEATS.blinkDown, BEATS.blink, EASE.inOut);
    const up = ramp(f, BEATS.blink + 2, BEATS.blinkUp, EASE.inOut);
    o = 1 - down + up * down;
  }
  // after opening, the lid breathes a hair
  if (f > BEATS.lidOpenFull) o *= 1 - 0.025 * (0.5 + 0.5 * noise2D("c12-lid", f * 0.03, 1));
  return clamp01(o);
};

export type EyeGeo = {
  back: P2; // outer corner (toward the back of the head)
  front: P2; // front corner
  upper: string; // upper lid edge, back -> front
  lower: string; // lower lid edge, back -> front
  aperture: string; // closed shape between them
  upperAt: (t: number) => P2; // point on the upper edge, t 0..1
  upperTan: (t: number) => P2;
  lowerAt: (t: number) => P2;
  iris: P2;
  irisR: number;
  crease: string; // upper-lid fold (shows as the lid opens)
};

const cubic = (a: P2, b: P2, c: P2, d: P2, t: number): P2 => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
};
const n = (v: number) => v.toFixed(3);
const C3 = (a: P2, b: P2, c: P2, d: P2) => `M${n(a.x)},${n(a.y)} C${n(b.x)},${n(b.y)} ${n(c.x)},${n(c.y)} ${n(d.x)},${n(d.y)}`;

// `dt` (detail) morphs the kit's strongly curved, tilted closed eye (dt 0)
// into the close-up shape (dt 1): level axis, softer seam, the upper lid
// arching highest a little forward, the front corner rounder.
export const eyeGeo = (eye: P2, open: number, dt = 1): EyeGeo => {
  const { x: ex, y: ey } = eye;
  const back = { x: ex - lerp(13, 13.5, dt), y: ey + lerp(-1, 0.8, dt) };
  const front = { x: ex + lerp(13, 12.5, dt), y: ey + lerp(2, 0.4, dt) };
  const sag = lerp(9, 6.2, dt); // closed seam: quadratic control depth below the eye centre
  const cl = (c: P2, k: number) => ({ x: c.x + (ex - c.x) * k, y: c.y + (ey + sag - c.y) * k });
  const shutU1 = cl(back, 2 / 3);
  const shutU2 = cl(front, 2 / 3);
  const u1 = { x: lerp(shutU1.x, ex - 6, open), y: lerp(shutU1.y, ey - lerp(10.5, 8.9, dt), open) };
  const u2 = { x: lerp(shutU2.x, ex + lerp(5.5, 6.8, dt), open), y: lerp(shutU2.y, ey - lerp(12.5, 11, dt), open) };
  const l1 = { x: shutU1.x - 0.7 * open, y: shutU1.y + lerp(1.6, 1.2, dt) * open };
  const l2 = { x: shutU2.x + 0.9 * open, y: shutU2.y + lerp(1.9, 0.9, dt) * open };
  const upper = C3(back, u1, u2, front);
  const lower = C3(back, l1, l2, front);
  const aperture = `${upper} C${n(l2.x)},${n(l2.y)} ${n(l1.x)},${n(l1.y)} ${n(back.x)},${n(back.y)}Z`;
  const upperAt = (t: number) => cubic(back, u1, u2, front, t);
  const upperTan = (t: number) => {
    const a = upperAt(Math.max(0, t - 0.01));
    const b = upperAt(Math.min(1, t + 0.01));
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: (b.x - a.x) / l, y: (b.y - a.y) / l };
  };
  const lowerAt = (t: number) => cubic(back, l1, l2, front, t);
  const cy = lerp(ey - 1, ey - 16.5, open);
  const crease = C3({ x: ex - 12.5, y: ey - 2.5 }, { x: ex - 5, y: cy }, { x: ex + 6, y: cy - 0.8 }, { x: ex + 12, y: ey - 2 });
  return { back, front, upper, lower, aperture, upperAt, upperTan, lowerAt, iris: { x: ex + 3.3, y: ey - 0.7 }, irisR: 8.3, crease };
};
