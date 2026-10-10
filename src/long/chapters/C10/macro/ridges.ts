// Fingerprint ridges as a phase field: ridge = cos(2*pi*phi / LAMBDA) > t.
// Three ridge systems (pad centre, tip, crease) grow as rings from their
// start points; behind each front the rings relax toward that system's final
// flow (a whorl at the core, outline-parallel ridges near the tip, arched
// ridges at the crease), and a smooth-min where the systems meet makes the
// deltas. Pure + deterministic. Static per-pixel data is cached per print;
// each frame only blends + shades (a few ms).
import { C } from "../../../../theme/colors";
import { clamp, smoothstep } from "../geom";
import { APEX, LAMBDA, PAD, axisRadius, halfWidth } from "./pad";
import { DELAYS, PrintSpec, SOURCES } from "./prints";

// wave fronts travel at one speed (px/s), so a pixel belongs to the front
// that reaches it first: the systems meet where their waves meet
export const WAVE_SPEED = 430;

// canvas region in pad px (covers the fingerprint area)
export const BOX = { x0: -262, y0: Math.floor(APEX - 8), w: 524, h: Math.ceil(PAD.crease + 6 - (APEX - 8)) };

const TAU = Math.PI * 2;
const RC = PAD.hw * 1.22;
const M = (r: number) => RC * Math.asin(Math.min(r / RC, 0.995));
// surface coords: the pad is a dome, so ridges bunch up toward its edges
const sx = (x: number) => Math.sign(x) * M(Math.abs(x));
const sy = (y: number) => (y < PAD.capY ? PAD.capY - M(PAD.capY - y) : y);

// per in-pad pixel: d = [core, tip, crease ring distances, owner's ring distance],
// F = [core whorl, spiral term, marginal, crease] final phase fields
export type Field = { n: number; pix: Int32Array; mask: Float32Array; own: Uint8Array; d: Float32Array; F: Float32Array };

const cache = new Map<string, Field>();

const build = (spec: PrintSpec): Field => {
  const { w, h, x0, y0 } = BOX;
  const src = SOURCES.map((p) => ({ x: sx(p.x), y: sy(p.y) }));
  const { c, hl, tilt, spiral, off } = spec.core;
  const cq = { x: sx(c.x), y: sy(c.y) };
  const ct = Math.cos((-tilt * Math.PI) / 180), st = Math.sin((-tilt * Math.PI) / 180);
  const Mhw = M(PAD.hw);
  // tip + crease rings start in phase with their final flow at the start point
  const ringOff = [0, Mhw - M(axisRadius(SOURCES[1].x, SOURCES[1].y)) + spec.offM, PAD.crease - SOURCES[2].y + spec.offK];
  const pix: number[] = [], mask: number[] = [], own: number[] = [], d: number[] = [], F: number[] = [];
  for (let py = 0; py < h; py++) {
    const y = y0 + py + 0.5;
    if (y > PAD.crease) continue;
    const hwy = halfWidth(y);
    for (let px = 0; px < w; px++) {
      const x = x0 + px + 0.5;
      if (Math.abs(x) >= hwy) continue;
      const edge = PAD.hw - axisRadius(x, y);
      // fade at the outline + crease; key light upper-left keeps that side crisper
      const lit = 0.72 + 0.28 * clamp(0.5 - (x * 0.6 + (y + 60) * 0.8) / 520);
      const m = smoothstep(1, 34, edge) * (0.55 + 0.45 * smoothstep(20, 90, edge)) * (1 - smoothstep(PAD.crease - 36, PAD.crease - 3, y)) * lit;
      if (m <= 0.002) continue;
      const qx = sx(x), qy = sy(y);
      // a little wobble on each wave front, so the lines where waves meet are organic
      const ds = src.map((s, i) => Math.hypot(qx - s.x, qy - s.y) + 9 * Math.sin(0.043 * qx + 0.017 * qy + 2.1 * i) + 6 * Math.sin(-0.021 * qx + 0.051 * qy + 1.3 * i));
      const arr = ds.map((v, i) => v + WAVE_SPEED * DELAYS[i]);
      let o = 0;
      if (arr[1] < arr[o]) o = 1;
      if (arr[2] < arr[o]) o = 2;
      // core: stadium (or spiral) around a short tilted segment
      const ux = (qx - cq.x) * ct - (qy - cq.y) * st;
      const uy = (qx - cq.x) * st + (qy - cq.y) * ct;
      const vy = uy - Math.max(-hl, Math.min(hl, uy));
      const f0 = Math.hypot(ux, vy) + off;
      const sp = (spiral * LAMBDA * Math.atan2(vy, ux)) / TAU;
      const f1 = Mhw - M(axisRadius(x, y)) + spec.offM;
      const f2 = PAD.crease - y + spec.bow * x * x + spec.offK;
      let wv = 0;
      for (const [kx, ky, ph, amp] of spec.warp) wv += amp * Math.sin(kx * x + ky * y + ph);
      pix.push(py * w + px);
      mask.push(m);
      own.push(o);
      d.push(ds[0], ds[1] + ringOff[1], ds[2] + ringOff[2], ds[o]);
      F.push(f0 + wv, sp, f1 + wv, f2 + wv);
    }
  }
  return {
    n: pix.length, pix: Int32Array.from(pix), mask: Float32Array.from(mask), own: Uint8Array.from(own),
    d: Float32Array.from(d), F: Float32Array.from(F),
  };
};

export const fieldFor = (spec: PrintSpec): Field => {
  let f = cache.get(spec.id);
  if (!f) {
    f = build(spec);
    cache.set(spec.id, f);
  }
  return f;
};

export type RidgeLook = {
  R: number[]; // front radius of each system (surface px)
  settle: number; // 0 raw rings .. 1 fully settled pattern (global)
  ridgeA: number; // ridge opacity
  furrowA: number; // furrow (shade) opacity
  gold: number; // 0 warm white .. 1 gold ridges
  front: number; // brightness of the travelling wave fronts
  lift: number; // lock flash (whiter, brighter)
};

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const WHITE = rgb(C.text), GOLD = rgb(C.gold), SHADE = rgb(C.skinShade), PEACH = rgb(C.skin);
const FEATHER = 10;
const PEN = 420;
// soft minimum as a softmax-weighted average: no dip below the true min, so
// two systems meeting almost tangentially do not grow lens-shaped loops
const smin3 = (a: number, b: number, c: number, k: number) => {
  const m = Math.min(a, b, c);
  const wa = Math.exp((m - a) / k), wb = Math.exp((m - b) / k), wc = Math.exp((m - c) / k);
  return (a * wa + b * wb + c * wc) / (wa + wb + wc);
};

export const rasterize = (fd: Field, spec: PrintSpec, L: RidgeLook, out: Uint8ClampedArray) => {
  out.fill(0);
  const { n, pix, mask, own, d, F } = fd;
  const AA = (TAU / LAMBDA) * 1.25;
  const spiralW = smoothstep(0.78, 1, L.settle);
  for (let j = 0; j < n; j++) {
    const o = own[j];
    const e = L.R[o] - d[4 * j + 3];
    if (e < -FEATHER) continue;
    const vis = smoothstep(-FEATHER, 0, e) * mask[j];
    // core rings relax into the whorl behind their front; tip + crease ridges
    // are born in their final flow. Ownership hands over from "whose wave
    // arrived first" to "whose field is lowest" through a fading penalty, so
    // boundaries slide into deltas instead of ridges sweeping across.
    const sc = Math.max(0.6 * smoothstep(60, 320, e), L.settle);
    const sr = Math.max(smoothstep(20, 170, e), L.settle);
    const pen = PEN * (1 - L.settle);
    const kk = 0.6 + (spec.k - 0.6) * L.settle;
    const a = d[4 * j] + (F[4 * j] - d[4 * j]) * sc + F[4 * j + 1] * spiralW + (o === 0 ? 0 : pen);
    const b = d[4 * j + 1] + (F[4 * j + 2] - d[4 * j + 1]) * sr + (o === 1 ? 0 : pen);
    const c = d[4 * j + 2] + (F[4 * j + 3] - d[4 * j + 2]) * sr + (o === 2 ? 0 : pen);
    const phi = smin3(a, b, c, kk);
    const v = Math.cos((phi * TAU) / LAMBDA);
    const fw = Math.max(0.07, AA * Math.sqrt(Math.max(0, 1 - v * v)));
    const cr = clamp((v - 0.12) / fw + 0.5);
    const cf = clamp((-v - 0.5) / fw + 0.5);
    const fg = L.front * Math.exp(-(e * e) / 162);
    // furrow, then the glowing front halo, then the ridge ("over" compositing)
    const af = cf * vis * L.furrowA;
    let A = af, r = af * SHADE[0], g = af * SHADE[1], bl = af * SHADE[2];
    const ah = fg * 0.4 * vis;
    r = ah * GOLD[0] + (1 - ah) * r; g = ah * GOLD[1] + (1 - ah) * g; bl = ah * GOLD[2] + (1 - ah) * bl; A = ah + (1 - ah) * A;
    const ar = cr * vis * clamp(L.ridgeA + 0.5 * fg + 0.35 * L.lift);
    const gm = clamp(L.gold + fg);
    const wl = L.lift * 0.6;
    const cR = (WHITE[0] * (1 - gm) + GOLD[0] * gm) * (1 - wl) + WHITE[0] * wl;
    const cG = (WHITE[1] * (1 - gm) + GOLD[1] * gm) * (1 - wl) + WHITE[1] * wl;
    const cB = (WHITE[2] * (1 - gm) + GOLD[2] * gm) * (1 - wl) + WHITE[2] * wl;
    r = ar * cR + (1 - ar) * r; g = ar * cG + (1 - ar) * g; bl = ar * cB + (1 - ar) * bl; A = ar + (1 - ar) * A;
    if (A <= 0.001) continue;
    const q = pix[j] * 4;
    out[q] = r / A; out[q + 1] = g / A; out[q + 2] = bl / A; out[q + 3] = A * 255;
  }
};

// a flat skin base under the ridges for standalone tests
export const TEST_BG = PEACH;
