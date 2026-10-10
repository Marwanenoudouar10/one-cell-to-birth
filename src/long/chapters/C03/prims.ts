import { noise3D } from "@remotion/noise";
import { Live, liveCells } from "./cells";
import { C02_OFF, pitchAt, yawAt } from "./timeline";
import { HalfPlane, Poly, Pt, areaCentroid, clip, lerp, project, rayExit, rot, smin, smooth } from "./geometry";

// (Adapted from the teaser's Scene2, cleavage only.) Turns the live cells into
// 2D drawable polygons (cluster-local screen px). Packed cells get flat
// contact faces: each cell is clipped by the neighbours sitting behind it;
// the more it is in front, the less it is clipped.
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
  partnerId: number; // half-plane id of the furrow (or -1)
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

const hero1 = (key: string) => key === "ca" || key === "cb";

type Disc = { key: string; x: number; y: number; z: number; r: number; partner: number; k: number; live: Live; seed: number };

const toDisc = (c: Live, yaw: number, pitch: number, i: number): Disc => {
  const pr = project(rot(c.p, yaw, pitch));
  const r = c.r * pr.k;
  return { key: c.key, x: pr.x, y: pr.y, z: pr.z, r, partner: -1, k: (c.k ?? 0) * pr.k, live: c, seed: i * 1.37 };
};

const outline = (d: Disc, discs: Disc[], f: number): Pt[] => {
  // the root uses C02's exact 72-point membrane so the handoff edge matches
  const n = d.key === "c" ? 72 : Math.max(22, Math.min(60, Math.round(d.r * 0.45)));
  const P = d.partner >= 0 ? discs[d.partner] : null;
  const amp = d.r > 60 ? 0.012 : 0.02;
  const sdf = P
    ? (x: number, y: number) => smin(Math.hypot(x - d.x, y - d.y) - d.r, Math.hypot(x - P.x, y - P.y) - P.r, d.k)
    : null;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const phi = (i / n) * Math.PI * 2;
    const u: Pt = [Math.cos(phi), Math.sin(phi)];
    let t = d.r;
    if (sdf && d.k > 0.5) t = rayExit(sdf, [d.x, d.y], u, d.r * 1.7);
    // The root (zygote) keeps C02's exact membrane wobble for the handoff;
    // the first pair starts on it (no outline jump when the furrow begins)
    // and hands over to its own wobble as the furrow deepens.
    const w02 = d.key === "c" ? 1 : hero1(d.key) ? 1 - smooth(d.live.u ?? 1) : 0;
    const n02 = w02 > 0 ? noise3D("c02-wob", u[0] * 0.9, u[1] * 0.9, (f + C02_OFF) * 0.035) : 0;
    const own = w02 < 1 ? noise3D("c03-wob", u[0] * 0.9 + d.seed * 3.1, u[1] * 0.9 + d.seed * 1.7, f * 0.035) : 0;
    t *= 1 + amp * lerp(own, n02, w02);
    pts.push([d.x + u[0] * t, d.y + u[1] * t]);
  }
  return pts;
};

export const buildPrims = (f: number) => {
  const yaw = yawAt(f);
  const pitch = pitchAt(f);
  const discs = liveCells(f).map((c, i) => toDisc(c, yaw, pitch, i));
  const index = new Map(discs.map((d, i) => [d.key, i]));
  discs.forEach((d) => {
    if (d.live.partner) d.partner = index.get(d.live.partner) ?? -1;
  });

  // Each furrowing lobe's share of its pair's UNION body (its unclipped
  // outline cut at the bisector), so the pair is lit as one cell of the
  // right size and centre. (Summing the lobes' own areas double-counted the
  // overlap: at the furrow's first frame the light jumped from r150 to r212.)
  const uni: { a: number; x: number; y: number }[] = [];
  const prims: Prim[] = discs.map((d, i) => {
    let poly: Poly = { pts: outline(d, discs, f), tags: [] };
    poly.tags = poly.pts.map(() => -1);
    const P = d.partner >= 0 ? discs[d.partner] : null;
    const PD = P ? Math.hypot(P.x - d.x, P.y - d.y) : 0;
    if (P && PD > 1e-3) {
      const nx = (P.x - d.x) / PD;
      const ny = (P.y - d.y) / PD;
      const h = areaCentroid(clip(poly, { nx, ny, c: nx * (d.x + P.x) * 0.5 + ny * (d.y + P.y) * 0.5, id: -2 }).pts);
      uni[i] = { a: h.area, x: h.x, y: h.y };
    } else {
      const h = areaCentroid(poly.pts);
      uni[i] = { a: P ? h.area / 2 : h.area, x: h.x, y: h.y };
    }
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
    const er = Math.sqrt(ac.area / Math.PI);
    return {
      key: d.key,
      poly,
      z: d.z,
      cx: ac.x,
      cy: ac.y,
      er,
      gx: ac.x,
      gy: ac.y,
      gr: er,
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
      ur: er,
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
    const ua = uni[i];
    const uq = uni[p.partnerId];
    const UA = ua.a + uq.a || 1;
    const ux = (ua.x * ua.a + uq.x * uq.a) / UA;
    const uy = (ua.y * ua.a + uq.y * uq.a) / UA;
    const ur = Math.sqrt(UA / Math.PI);
    const A = a.area + q.area || 1;
    if (hero1(p.key)) {
      // The first pair has no neighbours, so its union half IS the lobe (the
      // back lobe's own polygon spans the whole union, which biased its
      // light toward the furrow); hand back to the drawn polygon as the
      // neck closes, so the light is continuous at birth.
      const w = smooth((p.u - 0.9) / 0.05);
      p.cx = a.cx = lerp(ua.x, a.cx, w);
      p.cy = a.cy = lerp(ua.y, a.cy, w);
      p.er = a.er = lerp(Math.sqrt(ua.a / Math.PI), a.er, w);
    }
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

  // Hero pair lobe centres (first division), for the chromosome sets.
  const ia = index.get("ca");
  const ib = index.get("cb");
  const hero = ia !== undefined && ib !== undefined ? { ax: discs[ia].x, ay: discs[ia].y, bx: discs[ib].x, by: discs[ib].y } : null;
  return { prims, hero };
};

export type Built = ReturnType<typeof buildPrims>;
