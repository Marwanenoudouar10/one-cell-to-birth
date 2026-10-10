import { noise3D } from "@remotion/noise";
import { EASE } from "../../../lib/ease";
import { CELL_R, MORULA, SLOTS, slotGeom } from "./morula";
import { CAV, pitchAt, ringRadius, rollAt, yawAt } from "./timeline";
import { HalfPlane, Poly, Pt, areaCentroid, clamp01, clip, lerp, project, rot, rot2, smooth } from "./geometry";
import { Warp, warpPt } from "./warp";
import { at03, key3 } from "./c03";

// Turns the cells into drawable 2D polygons (ball-local screen px). Packed
// cells get flat contact faces: each cell is clipped by the neighbours behind
// it. The morula tumbles in 3D; as the cavity opens every cell flows to its
// flat hollow-ball slot (ring or knot), then the whole ball can warp.
export type Prim = {
  key: string;
  poly: Poly;
  z: number;
  cx: number;
  cy: number;
  er: number; // equivalent radius
  dark: number; // depth darkening 0..1
  ring: boolean;
  flat: number; // 0 = round morula cell, 1 = settled in its slot
};

type Disc = {
  x: number;
  y: number;
  z: number;
  r: number;
  r0: number;
  ell: { a: number; b: number; ang: number; w: number } | null;
  seed: number;
  ring: boolean;
};

const ellipseR = (a: number, b: number, phi: number) => (a * b) / Math.hypot(b * Math.cos(phi), a * Math.sin(phi));

const toDisc = (i: number, f: number, R: number, roll: number): Disc => {
  const pr = project(rot(MORULA[i], yawAt(f), pitchAt(f)));
  let x = pr.x;
  let y = pr.y;
  let z = pr.z;
  const r0 = CELL_R * pr.k;
  let r = r0;
  let ell: Disc["ell"] = null;
  const s = SLOTS[i];
  const w = EASE.inOut(clamp01((f - (CAV.start + s.delay)) / CAV.dur));
  if (w > 0) {
    const g = slotGeom(s, R);
    const [gx, gy] = rot2(g.x, g.y, roll);
    x = lerp(x, gx, w);
    y = lerp(y, gy, w);
    z = lerp(z, 0, w);
    r = lerp(r0, Math.max(g.a, g.b), w);
    ell = { a: g.a, b: g.b, ang: g.ang + roll, w };
  }
  return { x, y, z, r, r0, ell, seed: i * 1.37, ring: s.ring };
};

// Membrane outline. The round morula cells keep C03's exact sampling and
// wobble (same noise, same clock) so the fade from C03 lines up.
const outline = (d: Disc, f: number): Pt[] => {
  const n = Math.max(22, Math.min(60, Math.round(d.r0 * 0.45)));
  const amp = d.r0 > 60 ? 0.012 : 0.02;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const phi = (i / n) * Math.PI * 2;
    const u: Pt = [Math.cos(phi), Math.sin(phi)];
    let t = d.r0;
    if (d.ell) t = lerp(d.r0, ellipseR(d.ell.a, d.ell.b, phi - d.ell.ang), d.ell.w);
    t *= 1 + amp * noise3D("c03-wob", u[0] * 0.9 + d.seed * 3.1, u[1] * 0.9 + d.seed * 1.7, at03(f) * 0.035);
    pts.push([d.x + u[0] * t, d.y + u[1] * t]);
  }
  return pts;
};

export const buildPrims = (f: number, warp: Warp): Prim[] => {
  const R = ringRadius(f);
  const roll = rollAt(f);
  const discs = MORULA.map((_, i) => toDisc(i, f, R, roll));
  const prims: Prim[] = discs.map((d, i) => {
    let poly: Poly = { pts: outline(d, f), tags: [] };
    poly.tags = poly.pts.map(() => -1);
    discs.forEach((o, j) => {
      if (j === i || o.z > d.z + 0.01) return;
      const dx = o.x - d.x;
      const dy = o.y - d.y;
      const D = Math.hypot(dx, dy);
      if (D < 1e-3 || D >= d.r + o.r) return;
      const tRad = (D * D + d.r * d.r - o.r * o.r) / (2 * D);
      const off = smooth((d.z - o.z) / (0.6 * (d.r + o.r)));
      // +0.7px overlap so touching faces never show an anti-aliasing hairline.
      const t = tRad + (d.r * 1.25 - tRad) * off + 0.7;
      if (t >= d.r * 1.25) return;
      const nx = dx / D;
      const ny = dy / D;
      const hp: HalfPlane = { nx, ny, c: nx * d.x + ny * d.y + t, id: j };
      poly = clip(poly, hp);
    });
    if (warp) poly = { pts: poly.pts.map(([x, y]) => warpPt(warp, x, y)), tags: poly.tags };
    const ac = areaCentroid(poly.pts);
    return {
      key: key3(i),
      poly,
      z: d.z,
      cx: ac.x,
      cy: ac.y,
      er: Math.sqrt(ac.area / Math.PI),
      dark: (1 - smooth((d.z + 170) / 240)) * 0.56,
      ring: d.ring,
      flat: d.ell ? d.ell.w : 0,
    };
  });
  prims.sort((a, b) => a.z - b.z || (a.key < b.key ? -1 : 1));
  return prims;
};
