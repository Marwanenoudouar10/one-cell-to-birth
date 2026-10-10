// Copied from src/scenes/Scene1/camera.ts (C00 end = C01 frame 0). Noise seeds match C01's camera so the cut is exact.
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../../lib/ease";
import { B, DUR, END } from "./constants";
import { keys } from "./math";

// Camera: a slow push in and tilt up toward the egg, a punch-in during the
// slow-mo approach, a recoil after the flash, then a dead-still END frame
// with the zygote at (540, 860) and zoom 1.5 (core radius 150 px).
// The first key sits before frame 0 so the push is already moving on the
// very first frame (frame 0 itself is still z 1.0, egg at y 560: the thumbnail).
export const Z0 = 1.0;
const F = [-20, 0, B.raceStart, B.millions, B.oneWins + 3, B.fertilise, END - 4, DUR];
const zoomK = keys(F, [0.975, Z0, 1.01, 1.07, 1.42, 1.62, 1.5, 1.5]);
const exK = keys(F, [540, 540, 540, 540, 566, 570, 540, 540]);
const eyK = keys(F, [556, 560, 562, 600, 748, 752, 860, 860]);

export type Cam = { z: number; ex: number; ey: number };

export const camAt = (f: number): Cam => {
  // organic handheld drift, fading to zero before the handoff
  const calm = 1 - tween(f, B.fertilise + 6, END - 6, [0, 1], EASE.inOut);
  const t = f * 0.012;
  let ex = exK(f) + noise2D("c01-cx", t, 0) * 7 * calm;
  let ey = eyK(f) + noise2D("c01-cy", 0, t) * 7 * calm;
  // short impact shake at fertilisation
  const k = f >= B.fertilise ? Math.exp(-(f - B.fertilise) / 5) * calm : 0;
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

// Story time: runs at 1x, drops to 0.3x for the slow-mo approach right
// before contact, then snaps back to real time on the flash.
const rate = (f: number) =>
  tween(f, B.oneWins - 6, B.oneWins + 8, [1, 0.3], EASE.inOut) +
  tween(f, B.fertilise - 1, B.fertilise + 5, [0, 0.7], EASE.out);

const WARP: number[] = (() => {
  const out: number[] = [];
  let T = 0;
  for (let f = 0; f <= DUR + 2; f++) {
    out.push(T);
    T += rate(f);
  }
  return out;
})();

export const warp = (f: number) => {
  const i = Math.max(0, Math.min(WARP.length - 2, Math.floor(f)));
  return WARP[i] + (WARP[i + 1] - WARP[i]) * (f - i);
};
