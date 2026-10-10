import { Easing } from "remotion";
import { Pt, smin, smooth } from "./geometry";
import { B, EXIT, HOLE_R, axialStretch, ballR, holeHalf } from "./timeline";
import { tween } from "../../../lib/ease";

// Hatching deformation of the whole hollow ball.
//  - squeeze (B.squeeze..B.free): the ball (drawn at the zona centre) flows
//    through the opening as a figure-8: an inner lobe that stays inside the
//    shell, tangent to the opening, shrinks while an outer lobe grows outside
//    it (area conserved), joined by a neck the width of the opening. Every
//    axial slice of the round ball is mapped onto the matching slice of the
//    figure-8, so cells, cavity and knot all follow. Output: zona-local px.
//  - stretch (after B.free): springy overshoot along the exit axis around
//    the ball centre (ball-local px).
type Squeeze = { kind: "squeeze"; ux: number; uy: number; R: number; p: number; us: number; rin: number; rout: number; cin: number; cout: number; zh: number; h: number };
type Stretch = { kind: "stretch"; ux: number; uy: number; st: number };
export type Warp = Squeeze | Stretch | null;

const SQUEEZE = Easing.bezier(0.58, 0, 0.72, 0.82);
export const squeezeP = (f: number) => tween(f, B.squeeze, B.free, [0, 1], SQUEEZE);

// Area fraction of a disc of radius R lying beyond the chord at u = us.
const capFrac = (us: number, R: number) => {
  const x = Math.max(-1, Math.min(1, us / R));
  return (Math.acos(x) - x * Math.sqrt(1 - x * x)) / Math.PI;
};

export const warpAt = (f: number): Warp => {
  const ux = Math.cos(EXIT);
  const uy = Math.sin(EXIT);
  if (f >= B.squeeze && f < B.free) {
    const R = ballR(f) + 3;
    const p = squeezeP(f);
    const rin = R * Math.sqrt(1 - p);
    const rout = R * Math.sqrt(p);
    const zh = HOLE_R;
    const cin = zh - rin - (zh - R) * (1 - p) ** 2;
    let lo = -R;
    let hi = R;
    for (let i = 0; i < 14; i++) {
      const m = (lo + hi) / 2;
      if (capFrac(m, R) > p) lo = m;
      else hi = m;
    }
    const h = holeHalf(f) * smooth(p / 0.06) * (1 - smooth((p - 0.86) / 0.14));
    return { kind: "squeeze", ux, uy, R, p, us: (lo + hi) / 2, rin, rout, cin, cout: zh + rout, zh, h };
  }
  const st = axialStretch(f);
  if (Math.abs(st - 1) < 0.002) return null;
  return { kind: "stretch", ux, uy, st };
};

const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

// Half-width of the figure-8 at axial position X (zona-local).
const halfW = (w: Squeeze, X: number) => {
  const a = Math.sqrt(Math.max(0, w.rin * w.rin - (X - w.cin) ** 2));
  const b = Math.sqrt(Math.max(0, w.rout * w.rout - (X - w.cout) ** 2));
  const neck = w.h * Math.exp(-(((X - w.zh) / 24) ** 2));
  return smax(smax(a, b, 26), neck, 22);
};

export const warpPt = (w: Warp, x: number, y: number): Pt => {
  if (!w) return [x, y];
  const u = x * w.ux + y * w.uy;
  const v = -x * w.uy + y * w.ux;
  let U = u;
  let V = v;
  if (w.kind === "stretch") {
    U = u * w.st;
    V = v / Math.sqrt(w.st);
  } else {
    const { R, us } = w;
    const uc = Math.max(-R, Math.min(R, u));
    const X =
      uc < us
        ? us + R < 1e-3
          ? w.zh
          : w.cin - w.rin + ((w.zh - (w.cin - w.rin)) * (uc + R)) / (us + R)
        : R - us < 1e-3
          ? w.zh
          : w.zh + ((w.cout + w.rout - w.zh) * (uc - us)) / (R - us);
    const w0 = Math.max(6, Math.sqrt(Math.max(0, R * R - uc * uc)));
    U = X + (u - uc);
    V = (v * halfW(w, X)) / w0;
  }
  return [U * w.ux - V * w.uy, U * w.uy + V * w.ux];
};

export const warpPts = (w: Warp, pts: Pt[]): Pt[] => (w ? pts.map(([x, y]) => warpPt(w, x, y)) : pts);

// Where the ball's mass sits (same space as warpPt's output).
export const warpCentre = (w: Warp): Pt => {
  if (!w || w.kind === "stretch") return [0, 0];
  const c = w.cin * (1 - w.p) + w.cout * w.p;
  return [c * w.ux, c * w.uy];
};

// Circle as points (for shapes that must follow the warp).
export const circlePts = (r: number, n = 64, cx = 0, cy = 0): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt;
  });
