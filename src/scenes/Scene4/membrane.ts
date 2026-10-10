import { noise2D } from "@remotion/noise";
import { P, Pt, angDiff, smooth } from "./geom";

// The amniotic sac outline as a living membrane: slow organic wobble, a
// bulge where the foot pushes, damped ringing after release and a ripple
// that travels along the wall away from the impact point.
export type Impact = {
  angle: number; // radians, where the foot meets the wall
  push: number; // px the foot is pushing the wall outward right now
  t: number; // frames since impact (negative = not yet)
};

const SAMPLES = 120;

export const membraneR = (theta: number, R: number, f: number, k: Impact) => {
  const wob = noise2D("sac", Math.cos(theta) * 1.1 + f * 0.006, Math.sin(theta) * 1.1 + 3) * R * 0.012;
  const d = angDiff(theta, k.angle);
  const bump = Math.exp(-((d / 0.24) ** 2));
  let r = R + wob + k.push * bump;
  if (k.t > 0) {
    // ringing of the struck spot
    r += bump * 22 * Math.exp(-k.t / 9) * Math.sin(k.t * 0.55);
    // travelling ripple along the rim, both directions
    const a = Math.abs(d) * R;
    const front = k.t * 24;
    const ahead = Math.max(0, Math.min(1, (front - a) / 40));
    r += 9 * ahead * Math.exp(-k.t / 16) * Math.exp(-a / 700) * Math.sin((a - front) / 16);
  }
  return r;
};

export const membranePts = (R: number, f: number, k: Impact): Pt[] =>
  Array.from({ length: SAMPLES }, (_, i) => {
    const th = (i / SAMPLES) * Math.PI * 2;
    const r = membraneR(th, R, f, k);
    return P(Math.cos(th) * r, Math.sin(th) * r);
  });

export const membranePath = (R: number, f: number, k: Impact) => smooth(membranePts(R, f, k));

// An open arc of the membrane between two angles (radians), for wall flashes.
export const membraneArc = (R: number, f: number, k: Impact, a0: number, a1: number, steps = 24) =>
  smooth(
    Array.from({ length: steps + 1 }, (_, i) => {
      const th = a0 + ((a1 - a0) * i) / steps;
      const r = membraneR(th, R, f, k);
      return P(Math.cos(th) * r, Math.sin(th) * r);
    }),
    false,
  );
