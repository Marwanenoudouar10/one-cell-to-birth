import { noise2D } from "@remotion/noise";
import { Pt, add, deg, dot, mul, norm, perp, smoothPath, sub, table } from "./geometry";

// Week-6 embryo (Carnegie ~14), side view, facing right. Silhouette = a curled
// tube for the back + tail, unioned with round prominences: head (brain),
// face, heart and liver. Local coords, origin = centre of the curl.

const W_S = [0, 0.15, 0.3, 0.52, 0.75, 0.86, 0.94, 1];
const W_V = [54, 51, 47, 40, 28, 18, 11, 5.5];
const R_S = [0, 0.3, 0.6, 0.85, 1];
const R_V = [66, 82, 84, 92, 104];
const TH0 = -120; // start of the back (deg, 0 = right, -90 = up)
const SWEEP = 186; // how far the body curls round to the tail tip
const N = 72;

export type Frame = { c: Pt; n: Pt; t: Pt; w: number };
export type Blob = { x: number; y: number; rx: number; ry: number; rot: number };

export type Geo = {
  at: (s: number) => Frame;
  outline: string; // back + tail tube
  blobs: Blob[]; // head, face, heart bulge, liver, core (same skin as the tube)
  spine: string; // dorsal neural tube line
  cardiac: Blob;
  arm: Blob;
  leg: Blob;
  heart: Pt;
  eye: Pt;
  stalk: Pt; // where the yolk stalk leaves the belly (hidden behind the body)
  somites: Blob[];
  vesicles: Blob[];
};

export const buildGeo = (frame: number, calm: number): Geo => {
  const tt = frame * 0.018;
  const flex = noise2D("s3flex", tt, 0) * calm;
  const wig = noise2D("s3wig", tt * 1.6, 1) * calm;

  const centre = (s: number): Pt => {
    const th = ((TH0 - s * SWEEP * (1 + 0.012 * flex) + Math.pow(s, 4) * 8 * wig) * Math.PI) / 180;
    const r = table(s, R_S, R_V) * (1 + 0.012 * flex * s);
    return { x: r * Math.cos(th), y: r * Math.sin(th) };
  };
  const width = (s: number) => table(s, W_S, W_V) * (1 + 0.02 * noise2D("s3w", s * 3, tt) * calm);

  const at = (s: number): Frame => {
    const e = 0.004;
    const c = centre(s);
    const t = norm(sub(centre(Math.min(1, s + e)), centre(Math.max(0, s - e))));
    let n = perp(t);
    if (dot(n, c) < 0) n = mul(n, -1);
    return { c, n, t, w: width(s) };
  };

  const outer: Pt[] = [];
  const inner: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const { c, n, w } = at(i / N);
    outer.push(add(c, mul(n, w)));
    inner.push(sub(c, mul(n, w)));
  }
  // Round caps: angle sweeps from one edge, through the tip, to the other.
  const cap = (s: number, a0: number, a1: number, sign: number) => {
    const { c, n, t, w } = at(s);
    const fwd = mul(t, sign);
    const pts: Pt[] = [];
    for (let k = 1; k < 10; k++) {
      const a = ((a0 + ((a1 - a0) * k) / 10) * Math.PI) / 180;
      pts.push(add(c, add(mul(fwd, Math.cos(a) * w), mul(n, Math.sin(a) * w))));
    }
    return pts;
  };
  const poly = [...outer, ...cap(1, 90, -90, 1), ...inner.reverse(), ...cap(0, -90, 90, -1)];

  const spinePts: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const s = 0.16 + (i / 40) * 0.76;
    const { c, n, w } = at(s);
    spinePts.push(add(c, mul(n, w * 0.72)));
  }

  const somites: Blob[] = [];
  const COUNT = 26;
  for (let i = 0; i < COUNT; i++) {
    const s = 0.1 + (i / (COUNT - 1)) * 0.82;
    const { c, n, t, w } = at(s);
    const p = add(c, mul(n, w * 0.45));
    somites.push({ x: p.x, y: p.y, rx: Math.max(1.4, w * 0.12), ry: Math.max(2, w * 0.22), rot: deg(t) + 90 });
  }

  // The head is bowed forward over the chest (cephalic flexure): one big
  // tilted mass whose lower front (forebrain + face) tucks down onto the
  // heart bulge. No snout, no chin — that is what reads as "human embryo".
  const breathe = 1 + 0.015 * noise2D("s3hb", tt, 5) * calm;
  const head: Blob = { x: 24, y: -80, rx: 76 * breathe, ry: 65 * breathe, rot: 40 };
  const face: Blob = { x: 52, y: -24, rx: 24, ry: 20, rot: 40 };
  const cardiac: Blob = { x: 56, y: 10, rx: 40, ry: 38, rot: -20 };
  const liver: Blob = { x: 28, y: 40, rx: 29, ry: 26, rot: 25 };
  const core: Blob = { x: -4, y: 4, rx: 38, ry: 38, rot: 0 };

  return {
    at,
    outline: smoothPath(poly, true),
    blobs: [head, face, cardiac, liver, core],
    spine: smoothPath(spinePts, false),
    cardiac,
    arm: { x: -16, y: 18, rx: 27, ry: 15, rot: 42 },
    leg: { x: 6, y: 70, rx: 21, ry: 12, rot: 18 },
    heart: { x: 58, y: 10 },
    eye: { x: 47, y: -49 },
    stalk: { x: 44, y: 58 },
    somites,
    vesicles: [
      { x: 64, y: -50, rx: 24, ry: 20, rot: 45 }, // forebrain
      { x: 10, y: -110, rx: 42, ry: 28, rot: 15 }, // midbrain (crown)
      { x: -40, y: -88, rx: 28, ry: 17, rot: -30 }, // hindbrain roof (thin, very translucent)
    ],
  };
};
