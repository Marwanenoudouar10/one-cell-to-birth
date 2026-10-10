import { Line, Frame, buildLine, frameAt, frameDeg, inFrame, project, toFrame } from "./centreline";
import { Pt, add, lerpPt, mul, ramp, rot, sub } from "./math";
import { Stage, sectionAt, stageAt } from "./stage";

// Organs and limbs ride on the centre line: each one is stored in the
// (tangent, normal) frame of a chosen s, measured on the Scene3 week-6 pose,
// so week 6 reproduces Scene3 exactly and every other week bends with the body.

export type Blob = { x: number; y: number; rx: number; ry: number; rot: number };

const REF = buildLine(stageAt(6));
type Pin = { s: number; tau: number; u: number; drot: number };
const pin = (s: number, p: Pt, r = 0): Pin => {
  const F = frameAt(REF, s);
  return { s, ...toFrame(F, p), drot: r - frameDeg(F) };
};

// Scene3 week-6 placements (local coords).
const HEAD = { x: 24, y: -80, rx: 76, ry: 65, rot: 40 };
const P_HEAD = pin(-0.18, HEAD, HEAD.rot);
const P_NECK = 0;
const P_CARD = pin(0.1, { x: 56, y: 10 }, -20);
const P_LIVER = pin(0.22, { x: 28, y: 40 }, 25);
const P_CORE = pin(0.42, { x: -4, y: 4 });
const P_STALK = pin(0.45, { x: 44, y: 58 });
// limb roots = base end of Scene3's buds (centre - axis * rx)
const budRoot = (x: number, y: number, rx: number, r: number) => ({
  x: x - rx * Math.cos((r * Math.PI) / 180),
  y: y - rx * Math.sin((r * Math.PI) / 180),
});
const P_ARM = pin(0.3, budRoot(-16, 18, 27, 42), 42);
const P_LEG = pin(0.72, budRoot(6, 70, 21, 18), 18);

// Head-local coords (head centre, head x-axis) of Scene3's head features.
const headLocal = (p: Pt) => rot(sub(p, HEAD), -HEAD.rot);
export const HEAD_FEATURES = {
  face: { ...headLocal({ x: 52, y: -24 }), rx: 24, ry: 20, rot: 0 },
  eye: headLocal({ x: 47, y: -49 }),
  vesicles: [
    { ...headLocal({ x: 64, y: -50 }), rx: 24, ry: 20, rot: 5 },
    { ...headLocal({ x: 10, y: -110 }), rx: 42, ry: 28, rot: -25 },
    { ...headLocal({ x: -40, y: -88 }), rx: 28, ry: 17, rot: -70 },
  ],
};

export type Head = { c: Pt; rot: number; s: number };
export type Rig = {
  head: Head; // centre, rotation (deg) and scale of the head (Scene3 head = scale 1)
  headBlob: Blob;
  cardiac: Blob;
  heart: Pt;
  liver: Blob;
  core: Blob;
  stalk: Pt;
  arm: { root: Pt; dir: number };
  leg: { root: Pt; dir: number };
  neck: Pt;
};

const place = (L: Line, p: Pin, scale = 1): { at: Pt; rot: number; F: Frame } => {
  const F = frameAt(L, p.s);
  return { at: inFrame(F, p.tau * scale, p.u * scale), rot: frameDeg(F) + p.drot, F };
};

// Head-local point -> body coords.
export const fromHead = (h: Head, p: Pt): Pt => add(h.c, rot(mul(p, h.s), h.rot));

// Rig in body coords (unprojected). Built from the noise-free centre line.
export const buildRig = (st: Stage, L: Line): Rig => {
  const neck = frameAt(L, P_NECK).c;
  const hp = place(L, P_HEAD, Math.max(0.35, st.head));
  // head lift: the head swings about the neck
  const hc = add(neck, rot(sub(hp.at, neck), st.headLift));
  const hs = Math.max(0.001, st.head);
  const head: Head = { c: hc, rot: hp.rot + st.headLift, s: hs };
  // organs sit on the ventral surface while the disc is still open, and slide
  // into their Scene3 places as the C closes
  const settle = ramp(st.curl, 0.6, 1);
  const organ = (p: Pin, depth: number) => {
    const q = place(L, p);
    const surf = inFrame(q.F, 0, -sectionAt(st, p.s).a * depth);
    return { ...q, at: lerpPt(surf, q.at, settle) };
  };
  const cd = organ(P_CARD, 0.45);
  const lv = organ(P_LIVER, 0.55);
  const co = organ(P_CORE, 0.85);
  const ar = place(L, P_ARM);
  const lg = place(L, P_LEG);
  const b = st.bulge;
  return {
    head,
    headBlob: { x: hc.x, y: hc.y, rx: HEAD.rx * hs, ry: HEAD.ry * hs, rot: head.rot },
    cardiac: { x: cd.at.x, y: cd.at.y, rx: 40 * b, ry: 38 * b, rot: cd.rot },
    heart: add(cd.at, rot({ x: 2, y: 0 }, cd.rot + 20)),
    liver: { x: lv.at.x, y: lv.at.y, rx: 29 * st.liver, ry: 26 * st.liver, rot: lv.rot },
    core: { x: co.at.x, y: co.at.y, rx: 38 * st.core, ry: 38 * st.core, rot: 0 },
    stalk: organ(P_STALK, 0.6).at,
    arm: { root: ar.at, dir: ar.rot - 42 + st.arm.rot },
    leg: { root: lg.at, dir: lg.rot - 18 + st.leg.rot },
    neck,
  };
};

// Screen position (design units) of a body point, for the given stage.
export const view = (st: Stage, p: Pt): Pt => project(p, 0, st);
