// Pseudo-3D geometry of the hand-drawn germ disc (pure functions, no React).
// Disc coords: x = -1 (tail, left) .. +1 (head, right) along the long axis,
// vf = -1 (far rim) .. +1 (near rim) as a fraction of the half-breadth B(x),
// zf = 0 (bottom of the endoderm) .. 1 (top of the ectoderm) of the thickness T(x).
// Painted bottom-up, the near side wall shows the layers as stacked bands.
import { smoothPath } from "../../../shared/embryo/math";
import { Pt, View, lerp, smooth } from "./view";

const M = 56;
// cosine spacing: more samples near the round tips
export const XS = Array.from({ length: M + 1 }, (_, i) => -Math.cos((Math.PI * i) / M));
const PEAR = 0.2; // head end (right) broader than the tail
export const STREAK = { x0: -0.86, x1: -0.08 }; // primitive streak on the caudal half
export const MESO_ORIGIN = -0.4;

export const breadth = (v: View, x: number) => v.B * Math.sqrt(Math.max(0, 1 - x * x)) * (1 + PEAR * x);
export const thick = (v: View, x: number) => {
  const n = lerp(2.2, 4.2, v.side); // flat slab with round ends in the side cut
  return v.T * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x), n)), 0.5);
};

// Layer boundaries (from the bottom) at x: endoderm top, mesoderm top.
export const mesoFrac = (v: View, x: number) => 0.34 * smooth((v.meso * 2.1 - Math.abs(x - MESO_ORIGIN)) / 0.45);
export const bounds = (v: View, x: number): [number, number, number, number] => {
  const m = mesoFrac(v, x);
  const e = (1 - m) * 0.46;
  return [0, e, e + m, 1];
};

export const project = (v: View, x: number, vf: number, zf: number): Pt => {
  const r = (v.phi * Math.PI) / 180;
  const b = breadth(v, x);
  const t = thick(v, x);
  return { x: v.cx + x * v.A, y: v.cy + vf * b * Math.sin(r) - (zf - 0.5) * t * Math.cos(r) };
};

const curve = (v: View, vf: number, zf: (x: number) => number, rev = false) => {
  const pts = XS.map((x) => project(v, x, vf, zf(x)));
  return rev ? pts.reverse() : pts;
};

export type DiscGeo = {
  top: string; // dorsal (ectoderm) face
  bands: [string, string, string]; // near side wall: endo, meso, ecto
  sil: string; // whole silhouette
  rim: string; // far rim of the top face (rim-light line)
  topNear: Pt[]; // near rim of the top face (for the dome base)
};

export const discGeo = (v: View): DiscGeo => {
  const far = curve(v, -1, () => 1);
  const nearTop = curve(v, 1, () => 1);
  const level = (k: number) => (x: number) => bounds(v, x)[k];
  const band = (k: number) => smoothPath([...curve(v, 1, level(k + 1)), ...curve(v, 1, level(k), true)], true);
  return {
    top: smoothPath([...far, ...nearTop.slice().reverse()], true),
    bands: [band(0), band(1), band(2)],
    sil: smoothPath([...far, ...curve(v, 1, () => 0, true)], true),
    rim: smoothPath(far.slice(4, M - 4), false),
    topNear: nearTop,
  };
};

// Centre of layer k's band on the near side wall at x, and its half-height.
export const bandMid = (v: View, x: number, k: number) => {
  const b = bounds(v, x);
  const p = project(v, x, 1, (b[k] + b[k + 1]) / 2);
  const h = ((b[k + 1] - b[k]) * thick(v, x) * Math.cos((v.phi * Math.PI) / 180)) / 2;
  return { ...p, h };
};

// the amnion bubble meets the disc near its rim (no "hat brim" overhang)
const DOME_W = 0.93;

// Amnion dome over the dorsal face: upper half of the projected ellipsoid,
// closed by the near half of its base ellipse. `burst` 0..1 inflates it
// into a sphere around the whole embryo (C06's sac takes over from there).
export const domePts = (v: View, burst: number, n = 36): Pt[] => {
  const r = (v.phi * Math.PI) / 180;
  const ad = v.A * DOME_W;
  const bd = v.B * 0.86;
  const cyT = v.cy - (v.T / 2) * Math.cos(r);
  const ry = Math.hypot(bd * Math.sin(r), v.H * Math.cos(r));
  const base = bd * Math.sin(r);
  const R = 380;
  const out: Pt[] = [];
  for (let i = 0; i <= 2 * n; i++) {
    const up = i <= n;
    const th = up ? Math.PI * (1 - i / n) : Math.PI * ((i - n) / n);
    const p = { x: v.cx + ad * Math.cos(th), y: up ? cyT - ry * Math.sin(th) : cyT + base * Math.sin(th) };
    const q = { x: 540 + R * Math.cos(th), y: 860 + (up ? -1 : 1) * R * Math.sin(th) };
    out.push({ x: lerp(p.x, q.x, burst), y: lerp(p.y, q.y, burst) });
  }
  return out;
};

export const domeFrame = (v: View, burst: number) => {
  const r = (v.phi * Math.PI) / 180;
  const cyT = v.cy - (v.T / 2) * Math.cos(r);
  const ry = Math.hypot(v.B * 0.86 * Math.sin(r), v.H * Math.cos(r));
  return { cx: lerp(v.cx, 540, burst), cy: lerp(cyT, 860, burst), rx: lerp(v.A * DOME_W, 380, burst), ry: lerp(ry, 380, burst) };
};
