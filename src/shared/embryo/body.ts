import { noise2D } from "@remotion/noise";
import { Line, N, buildLine, project, projectRaw, sAt, spinPt } from "./centreline";
import { Pt, add, deg, lerp, mul, norm, perp, smoothPath, sub } from "./math";
import { Blob, HEAD_FEATURES, Rig, buildRig, fromHead } from "./rig";
import { Stage, sectionAt } from "./stage";
import { faceBlobs, faceScale } from "./Face";

// Projected body silhouettes. The body is a swept cross-section (half-thickness
// a = dorsal/ventral, half-breadth b = lateral, superellipse) along the centre
// line, seen through `project`. Germ layers = the same sweep clipped to
// u >= -1/3 a and u >= +1/3 a: painted bottom-up they show as three bands on
// the rim of the disc (exact for a convex section seen from the dorsal side).

export type Section = { a: number; b: number };
export type Body = {
  st: Stage;
  line: Line; // animated (noise) centre line, body coords
  rig: Rig; // organ placements, noise-free
  sec: Section[]; // per sample
  outline: string; // full silhouette (tube only)
  layers: string[]; // [endoderm(full), mesoderm+, ectoderm side+, top face] when germ > 0
  blobs: Blob[]; // head, face (+ nose, lip, chin): dorsal/top layer
  belly: Blob[]; // cardiac, liver, core: ventral, so drawn under the rim layers while the disc faces us
  spine: string;
  somites: (Blob & { row: number; o: number })[];
  bounds: { x0: number; y0: number; x1: number; y1: number };
};

const K = 28; // cross-section samples
const COS = Array.from({ length: K }, (_, k) => Math.cos((2 * Math.PI * k) / K));
const SIN = Array.from({ length: K }, (_, k) => Math.sin((2 * Math.PI * k) / K));
const sp = (c: number, e: number) => Math.sign(c) * Math.pow(Math.abs(c), 2 / e);

// Cross-section points (u, v) clipped to u >= u0 * a.
const sectionPts = (a: number, b: number, e: number, u0: number): Pt[] => {
  const out: Pt[] = [];
  for (let k = 0; k < K; k++) {
    const u = a * sp(COS[k], e);
    if (u >= u0 * a) out.push({ x: u, y: b * sp(SIN[k], e) });
  }
  if (u0 > -1) {
    const vc = b * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u0), e)), 1 / e);
    out.push({ x: u0 * a, y: vc }, { x: u0 * a, y: -vc });
  }
  return out;
};

const sweepOutline = (st: Stage, L: Line, sec: Section[], u0: number) => {
  const r = (st.tilt * Math.PI) / 180;
  const cr = Math.cos(r);
  const sr = Math.sin(r);
  const hi: Pt[] = [];
  const lo: Pt[] = [];
  const mids: { m: Pt; h: Pt; T: Pt }[] = [];
  for (let i = 0; i <= N; i++) {
    const { a, b } = sec[i];
    const n = L.n[i];
    const t = L.t[i];
    const Pc = projectRaw(L.c[i], 0, st.tilt);
    const T = norm({ x: t.x * cr, y: t.y });
    const Nn = perp(T);
    let mx = -Infinity;
    let mn = Infinity;
    let omx = { x: 0, y: 0 };
    let omn = { x: 0, y: 0 };
    for (const q of sectionPts(a, b, st.expo, u0)) {
      const o = { x: n.x * q.x * cr + q.y * sr, y: n.y * q.x };
      const d = o.x * Nn.x + o.y * Nn.y;
      if (d > mx) [mx, omx] = [d, o];
      if (d < mn) [mn, omn] = [d, o];
    }
    hi.push(add(Pc, omx));
    lo.push(add(Pc, omn));
    mids.push({ m: add(Pc, mul(add(omx, omn), 0.5)), h: mul(sub(omx, omn), 0.5), T });
  }
  // round caps (Scene3 style), swept from one edge, through the tip, to the other
  const cap = (i: number, sign: number, a0: number, a1: number) => {
    const { m, h, T } = mids[i];
    const w = Math.hypot(h.x, h.y) || 0.001;
    const pts: Pt[] = [];
    for (let k = 1; k < 10; k++) {
      const a = ((a0 + ((a1 - a0) * k) / 10) * Math.PI) / 180;
      pts.push(add(m, add(mul(T, sign * Math.cos(a) * w), mul(h, Math.sin(a)))));
    }
    return pts;
  };
  const poly = [...hi, ...cap(N, 1, 90, -90), ...lo.reverse(), ...cap(0, -1, -90, 90)].map((p) => spinPt(p, st.spin));
  return { d: smoothPath(poly, true), poly };
};

const sections = (st: Stage, tt: number, calm: number, seed: string): Section[] => {
  const out: Section[] = [];
  for (let i = 0; i <= N; i++) {
    const s = sAt(i);
    const k = 1 + 0.02 * noise2D(`${seed}w`, s * 3, tt) * calm;
    const q = sectionAt(st, s);
    out.push({ a: q.a * k, b: q.b * k });
  }
  return out;
};

export const buildBody = (st: Stage, frame: number, calm: number, seed: string): Body => {
  const tt = frame * 0.018;
  const flex = noise2D(`${seed}flex`, tt, 0) * calm;
  const wig = noise2D(`${seed}wig`, tt * 1.6, 1) * calm;
  const L = buildLine(st, flex, wig);
  const rig = buildRig(st, buildLine(st));
  const sec = sections(st, tt, calm, seed);
  const full = sweepOutline(st, L, sec, -1);
  const layers =
    st.germ > 0.001 ? [full.d, ...[-0.22, 0.4, 0.9].map((u) => sweepOutline(st, L, sec, u).d)] : [full.d];

  const pr = (b: Blob): Blob => ({ ...b, ...project(b, 0, st), rot: b.rot + st.spin });
  const hb = rig.headBlob;
  const breathe = 1 + 0.015 * noise2D(`${seed}hb`, tt, 5) * calm;
  const face = facePlace(rig, st);
  const fb = faceBlobs(st).map((b) => ({ ...b, ...fromHead(rig.head, b), rx: b.rx * rig.head.s, ry: b.ry * rig.head.s, rot: b.rot + rig.head.rot }));
  const blobs = [{ ...hb, rx: hb.rx * breathe, ry: hb.ry * breathe }, face, ...fb].filter((b) => b.rx > 0.5).map(pr);
  const belly = [rig.cardiac, rig.liver, rig.core].filter((b) => b.rx > 0.5).map(pr);

  const spinePts: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const s = 0.16 + (i / 40) * 0.76;
    const j = Math.round(((s - sAt(0)) / (1 - sAt(0))) * N);
    spinePts.push(project(add(L.c[j], mul(L.n[j], sec[j].a * 0.72)), 0, st));
  }

  const somites: Body["somites"] = [];
  const COUNT = 26;
  const r = (st.tilt * Math.PI) / 180;
  for (let i = 0; i < COUNT; i++) {
    const o = Math.max(0, Math.min(1, st.somites - i));
    if (o <= 0) continue;
    const s = 0.1 + (i / (COUNT - 1)) * 0.82;
    const j = Math.round(((s - sAt(0)) / (1 - sAt(0))) * N);
    const { a, b } = sec[j];
    const T = norm({ x: L.t[j].x * Math.cos(r), y: L.t[j].y });
    for (const row of [1, -1]) {
      const p = project(add(L.c[j], mul(L.n[j], a * 0.45)), row * b * 0.46, st);
      // dorsal view: lateral blocks with gaps; side view: Scene3's beads
      const rx = lerp(8.5, Math.max(1.4, a * 0.12), st.fold);
      const ry = lerp(3.6, Math.max(2, a * 0.22), st.fold);
      somites.push({ x: p.x, y: p.y, rx, ry, rot: deg(T) + 90 + st.spin, row, o });
    }
  }

  const bounds = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const grow = (p: Pt, r0 = 0) => {
    bounds.x0 = Math.min(bounds.x0, p.x - r0);
    bounds.x1 = Math.max(bounds.x1, p.x + r0);
    bounds.y0 = Math.min(bounds.y0, p.y - r0);
    bounds.y1 = Math.max(bounds.y1, p.y + r0);
  };
  full.poly.forEach((p) => grow(p));
  [...blobs, ...belly].forEach((b) => grow(b, Math.max(b.rx, b.ry) * 0.92));
  return { st, line: L, rig, sec, outline: full.d, layers, blobs, belly, spine: smoothPath(spinePts, false), somites, bounds };
};

// Face prominence rides on the head.
const facePlace = (rig: Rig, st: Stage): Blob => {
  const f = HEAD_FEATURES.face;
  const p = fromHead(rig.head, f);
  const k = rig.head.s * faceScale(st);
  return { x: p.x, y: p.y, rx: f.rx * k, ry: f.ry * k, rot: rig.head.rot + f.rot };
};
