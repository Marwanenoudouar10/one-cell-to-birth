import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { B, DUR, END } from "./beats";
import { inc, keys } from "./math";

// Two cameras share one clock:
// 1. The EGG camera (Scene1's, stretched): frame 0 is Scene1's thumbnail
//    (zoom 1, egg at 540,560); a slow push while the swarm travels, a punch-in
//    on the slow-mo approach and fusion, then a dead-still END with the zygote
//    at (540, 860), zoom 1.5 (core radius 150 px).
// 2. The CLIMB: the corridor (walls, gates, specks) scrolls down past the
//    camera while the swarm keeps pace, so the camera travels "upward". The egg
//    is the distant goal at the end of the corridor and barely moves.
export const Z0 = 1.0;
const F = inc([-20, 0, B.raceStart, B.cruise, B.gate, B.restEnd - 8, B.oneOut + 3, B.touch, B.fuse, END - 4, DUR]);
const zoomK = keys(F, [0.975, Z0, 1.01, 1.05, 1.1, 1.2, 1.34, 1.46, 1.62, 1.5, 1.5]);
const exK = keys(F, [540, 540, 540, 540, 540, 548, 560, 566, 570, 540, 540]);
const eyK = keys(F, [556, 560, 562, 575, 592, 628, 712, 748, 752, 860, 860]);

export type Cam = { z: number; ex: number; ey: number };

export const camAt = (f: number): Cam => {
  // organic handheld drift, fading to zero before the handoff
  const calm = 1 - tween(f, B.fuse + 6, END - 6, [0, 1], EASE.inOut);
  const t = f * 0.012;
  let ex = exK(f) + noise2D("c01-cx", t, 0) * 7 * calm;
  let ey = eyK(f) + noise2D("c01-cy", 0, t) * 7 * calm;
  // short impact shake at fusion
  const k = f >= B.fuse ? Math.exp(-(f - B.fuse) / 5) * calm : 0;
  ex += noise2D("c01-sx", f * 0.55, 0) * 8 * k;
  ey += noise2D("c01-sy", 0, f * 0.55) * 8 * k;
  const z = zoomK(f) * (1 + noise2D("c01-cz", t * 0.7, 3) * 0.006 * calm);
  return { z, ex, ey };
};

// Parallax: a layer with depth factor p (1 = egg plane, >1 nearer, <1 farther)
// zooms as z^p and travels p times as far as the egg plane.
export type LayerXf = { zL: number; ox: number; oy: number };

export const layerXf = (f: number, p: number): LayerXf => {
  const c = camAt(f);
  const camX = (540 - c.ex) / c.z;
  const camY = (960 - c.ey) / c.z;
  const zL = Z0 * Math.pow(c.z / Z0, p);
  return { zL, ox: 540 - zL * p * camX, oy: 960 - zL * p * camY };
};

export const xfAttr = (L: LayerXf) => `translate(${L.ox} ${L.oy}) scale(${L.zL})`;

// Screen point -> layer coordinates at frame f.
export const toLayer = (f: number, p: number, sx: number, sy: number) => {
  const L = layerXf(f, p);
  return { x: (sx - L.ox) / L.zL, y: (sy - L.oy) / L.zL };
};

// Integrate a per-frame rate into a lookup table (value at frame f).
const integrate = (rate: (f: number) => number) => {
  const out: number[] = [0];
  for (let f = 0; f <= DUR + 2; f++) out.push(out[f] + rate(f));
  return (f: number) => {
    if (f <= 0) return f * rate(0);
    const i = Math.min(out.length - 2, Math.floor(f));
    return out[i] + (out[i + 1] - out[i]) * (f - i);
  };
};

// The climb: egg-plane units per frame. Eases up with the swarm, cruises
// through the three gates, and settles to a stop inside the tube.
export const CLIMB_V = 32;
const climbRate = (f: number) =>
  CLIMB_V *
  tween(f, B.push - 6, B.cruise, [0, 1], EASE.inOut) *
  (1 - tween(f, B.gate + 2, B.rest + 10, [0, 1], EASE.inOut));
const SCROLL = integrate((f) => climbRate(f + 0.5));
export const scroll = (f: number) => (f <= 0 ? 0 : SCROLL(f));

// Story time: runs at 1x, drops to 0.3x for the slow-mo approach on "Only",
// then snaps back to real time on fusion.
const rate = (f: number) =>
  tween(f, B.oneOut - 6, B.oneOut + 8, [1, 0.3], EASE.inOut) + tween(f, B.fuse - 1, B.fuse + 5, [0, 0.7], EASE.out);
export const warp = integrate(rate);
