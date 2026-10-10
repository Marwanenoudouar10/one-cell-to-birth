import { noise3D } from "@remotion/noise";
import { EASE } from "../../lib/ease";
import { Live, liveCells } from "./cells";
import { SLOTS, slotGeom } from "./blasto";
import { LAST } from "./lineage";
import { CAV, pitchAt, ringRadius, yawAt } from "./timeline";
import {
  HalfPlane, Poly, Pt, areaCentroid, clamp01, clip, lerp, project, rayExit, rot, smin, smooth,
} from "./geometry";

// Turns the live cells into 2D drawable polygons (cluster-local screen px).
// Packed cells get flat contact faces: each cell is clipped by the neighbours
// sitting behind it; the more it is in front, the less it is clipped.
export type Prim = {
  key: string;
  poly: Poly;
  z: number;
  cx: number; // centroid
  cy: number;
  er: number; // equivalent radius
  gx: number; // shading centre/radius (shared by both lobes early in a furrow)
  gy: number;
  gr: number;
  dark: number; // depth darkening 0..1
  nuc: number;
  partnerId: number; // half-plane id of the furrow (or -2)
  partnerKey: string;
  furrow: number;
  t: number; // 1 = lit as its own cell, 0 = still lit as one body with its partner
  ux: number; // light of the shared body (pair union) while the furrow is young
  uy: number;
  ur: number;
  root: boolean;
  area: number;
  u: number;
};

type Disc = {
  key: string;
  x: number;
  y: number;
  z: number;
  r: number; // reach used for contacts
  r0: number; // own round radius
  ell: { a: number; b: number; ang: number; w: number } | null;
  partner: number;
  k: number;
  live: Live;
  seed: number;
};

const toDisc = (c: Live, f: number, yaw: number, pitch: number, R: number, i: number): Disc => {
  const pr = project(rot(c.p, yaw, pitch));
  let x = pr.x;
  let y = pr.y;
  let z = pr.z;
  const r0 = c.r * pr.k;
  let r = r0;
  let ell: Disc["ell"] = null;
  if (c.g === LAST) {
    const s = SLOTS[c.idx];
    const t0 = Math.max(CAV.start, c.birth + 1) + s.delay; // stagger always survives
    const w = EASE.inOut(clamp01((f - t0) / CAV.dur));
    if (w > 0) {
      const g = slotGeom(s, R);
      x = lerp(x, g.x, w);
      y = lerp(y, g.y, w);
      z = lerp(z, 0, w);
      r = lerp(r0, Math.max(g.a, g.b), w);
      ell = { a: g.a, b: g.b, ang: g.ang, w };
    }
  }
  return { key: c.key, x, y, z, r, r0, ell, partner: -1, k: (c.k ?? 0) * pr.k, live: c, seed: i * 1.37 };
};

const ellipseR = (a: number, b: number, phi: number) =>
  (a * b) / Math.hypot(b * Math.cos(phi), a * Math.sin(phi));

const outline = (d: Disc, discs: Disc[], f: number): Pt[] => {
  const n = Math.max(22, Math.min(60, Math.round(d.r0 * 0.45)));
  const P = d.partner >= 0 ? discs[d.partner] : null;
  const amp = d.r0 > 60 ? 0.012 : 0.02;
  const sdf = P
    ? (x: number, y: number) =>
        smin(Math.hypot(x - d.x, y - d.y) - d.r0, Math.hypot(x - P.x, y - P.y) - P.r0, d.k)
    : null;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const phi = (i / n) * Math.PI * 2;
    const u: Pt = [Math.cos(phi), Math.sin(phi)];
    let t = d.r0;
    if (sdf && d.k > 0.5) t = rayExit(sdf, [d.x, d.y], u, d.r0 * 1.7);
    else if (d.ell) t = lerp(d.r0, ellipseR(d.ell.a, d.ell.b, phi - d.ell.ang), d.ell.w);
    t *= 1 + amp * noise3D("s2-wob", u[0] * 0.9 + d.seed * 3.1, u[1] * 0.9 + d.seed * 1.7, f * 0.035);
    pts.push([d.x + u[0] * t, d.y + u[1] * t]);
  }
  return pts;
};

export type Spindle = { x1: number; y1: number; x2: number; y2: number; o: number };

export const buildPrims = (f: number) => {
  const yaw = yawAt(f);
  const pitch = pitchAt(f);
  const R = ringRadius(f);
  const live = liveCells(f);
  const discs = live.map((c, i) => toDisc(c, f, yaw, pitch, R, i));
  const index = new Map(discs.map((d, i) => [d.key, i]));
  discs.forEach((d) => {
    if (d.live.partner) d.partner = index.get(d.live.partner) ?? -1;
  });

  const prims: Prim[] = discs.map((d, i) => {
    let poly: Poly = { pts: outline(d, discs, f), tags: [] };
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
    const ac = areaCentroid(poly.pts);
    return {
      key: d.key,
      poly,
      z: d.z,
      cx: ac.x,
      cy: ac.y,
      er: Math.sqrt(ac.area / Math.PI),
      gx: ac.x,
      gy: ac.y,
      gr: Math.sqrt(ac.area / Math.PI),
      area: ac.area,
      u: d.live.u ?? 1,
      dark: (1 - smooth((d.z + 170) / 240)) * 0.56,
      nuc: d.live.nuc,
      partnerId: d.partner,
      partnerKey: d.live.partner ?? "",
      furrow: d.live.furrow ?? 1,
      t: 1,
      ux: ac.x,
      uy: ac.y,
      ur: Math.sqrt(ac.area / Math.PI),
      root: d.key === "c",
    };
  });
  // While a furrow is young the two lobes are still one cell: shade them as
  // one body (same light, same depth tone, so no seam), handing over to each
  // daughter's own light only once the waist has really pinched in.
  const base = prims.map((p) => ({ cx: p.cx, cy: p.cy, area: p.area, dark: p.dark, er: p.er }));
  prims.forEach((p, i) => {
    if (p.partnerId < 0) return;
    const a = base[i];
    const q = base[p.partnerId];
    const A = a.area + q.area || 1;
    const ux = (a.cx * a.area + q.cx * q.area) / A;
    const uy = (a.cy * a.area + q.cy * q.area) / A;
    const ur = Math.sqrt(A / Math.PI);
    const t = smooth((p.u - 0.42) / 0.5);
    p.gx = lerp(ux, a.cx, t);
    p.gy = lerp(uy, a.cy, t);
    p.gr = lerp(ur, a.er, t);
    p.dark = lerp((a.dark * a.area + q.dark * q.area) / A, a.dark, t);
    p.t = t;
    p.ux = ux;
    p.uy = uy;
    p.ur = ur;
  });
  prims.sort((a, b) => a.z - b.z || (a.key < b.key ? -1 : 1));

  // Mitotic spindle hint for the first two (big, slow) divisions.
  const spindles: Spindle[] = [];
  discs.forEach((d) => {
    const u = d.live.u;
    if (u === undefined || d.live.g > 2 || d.partner < 0 || d.key > discs[d.partner].key) return;
    const P = discs[d.partner];
    const o = smooth((u - 0.08) / 0.2) * (1 - smooth((u - 0.6) / 0.3));
    if (o <= 0) return;
    const mx = (d.x + P.x) / 2;
    const my = (d.y + P.y) / 2;
    const dx = d.x - P.x;
    const dy = d.y - P.y;
    const L = Math.hypot(dx, dy) || 1;
    const reach = d.r0 * (0.35 + 0.25 * u);
    spindles.push({
      x1: mx + (dx / L) * reach,
      y1: my + (dy / L) * reach,
      x2: mx - (dx / L) * reach,
      y2: my - (dy / L) * reach,
      o,
    });
  });
  return { prims, spindles };
};
