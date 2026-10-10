import { Pt, add, deg, lerpPt, mul, norm, perp, ramp, sub, table } from "./math";
import { Stage } from "./stage";

// The body's centre line, head (s = S0) to tail tip (s = 1), in the embryo's
// own sagittal plane ("body" coords, = Scene3 local coords at week 6).
// Reference curve = Scene3's curled tube (a polar spiral). The disc stages
// straighten it by blending every segment's direction toward one axis (curl),
// so the C literally unrolls into a straight, vertical disc (head up).

export const S0 = -0.3; // s < 0: cranial plate that folds into the head
export const N = 91; // samples over [S0, 1]; sample I0 sits exactly at s = 0
export const I0 = 21;
export const sAt = (i: number) => S0 + (i / N) * (1 - S0);

const R_S = [0, 0.3, 0.6, 0.85, 1];
const R_V = [66, 82, 84, 92, 104];
const AXIS = (-270 * Math.PI) / 180; // straight disc points down the screen (head on top)

export type Line = { c: Pt[]; t: Pt[]; n: Pt[] };

export const buildLine = (st: Stage, flex = 0, wig = 0): Line => {
  const P: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const s = sAt(i);
    const th = ((st.th0 - s * st.sweep * (1 + 0.012 * flex) + Math.pow(Math.max(0, s), 4) * 8 * wig) * Math.PI) / 180;
    const r = table(s, R_S, R_V) * (1 + 0.012 * flex * s);
    P.push({ x: r * Math.cos(th), y: r * Math.sin(th) });
  }
  // segment directions (unwrapped) and lengths
  const phi: number[] = [];
  const len: number[] = [];
  for (let j = 0; j < N; j++) {
    const d = sub(P[j + 1], P[j]);
    let a = Math.atan2(d.y, d.x);
    if (j > 0) {
      while (a - phi[j - 1] > Math.PI) a -= 2 * Math.PI;
      while (a - phi[j - 1] < -Math.PI) a += 2 * Math.PI;
    }
    phi.push(a);
    const s = sAt(j + 0.5);
    len.push(Math.hypot(d.x, d.y) * st.lenScale * (1 - 0.72 * st.tailCut * ramp(s, 0.7, 0.97)));
  }
  // bring the unrolled axis onto the same branch as the spiral
  const mid = phi[Math.floor(N / 2)];
  const axis = AXIS + 2 * Math.PI * Math.round((mid - AXIS) / (2 * Math.PI));
  const k = st.curl;
  const dir = phi.map((a) => axis + k * (a - axis));

  const c: Pt[] = new Array(N + 1);
  c[I0] = P[I0];
  for (let j = I0; j < N; j++) c[j + 1] = add(c[j], { x: len[j] * Math.cos(dir[j]), y: len[j] * Math.sin(dir[j]) });
  for (let j = I0 - 1; j >= 0; j--) c[j] = sub(c[j + 1], { x: len[j] * Math.cos(dir[j]), y: len[j] * Math.sin(dir[j]) });

  const t: Pt[] = [];
  const n: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const tt = norm(sub(c[Math.min(N, i + 1)], c[Math.max(0, i - 1)]));
    t.push(tt);
    n.push(perp(tt)); // outward = dorsal side of the C
  }
  return { c, t, n };
};

export type Frame = { c: Pt; t: Pt; n: Pt };

// Frame at any s (linear between samples; beyond the ends it extrapolates).
export const frameAt = (L: Line, s: number): Frame => {
  const f = ((s - S0) / (1 - S0)) * N;
  const i = Math.max(0, Math.min(N - 1, Math.floor(f)));
  const u = f - i;
  const t = norm(lerpPt(L.t[i], L.t[i + 1], u));
  return { c: lerpPt(L.c[i], L.c[i + 1], u), t, n: perp(t) };
};

// Point given in a frame's (tangent, normal) coords.
export const inFrame = (F: Frame, tau: number, u: number): Pt => add(F.c, add(mul(F.t, tau), mul(F.n, u)));

// Inverse: express a body point in a frame's coords.
export const toFrame = (F: Frame, p: Pt) => {
  const d = sub(p, F.c);
  return { tau: d.x * F.t.x + d.y * F.t.y, u: d.x * F.n.x + d.y * F.n.y };
};

export const frameDeg = (F: Frame) => deg(F.t);

// Orthographic view, rotated by `tilt` about the screen-vertical axis, then
// spun in the screen plane by `spin` (both deg). Body point p (sagittal plane)
// + lateral offset v -> screen (design units).
export type View = { tilt: number; spin: number };
export const projectRaw = (p: Pt, v: number, tilt: number): Pt => {
  const r = (tilt * Math.PI) / 180;
  return { x: p.x * Math.cos(r) + v * Math.sin(r), y: p.y };
};
export const spinPt = (p: Pt, spin: number): Pt => {
  if (!spin) return p;
  const r = (spin * Math.PI) / 180;
  return { x: p.x * Math.cos(r) - p.y * Math.sin(r), y: p.x * Math.sin(r) + p.y * Math.cos(r) };
};
export const project = (p: Pt, v: number, view: View): Pt => spinPt(projectRaw(p, v, view.tilt), view.spin);
