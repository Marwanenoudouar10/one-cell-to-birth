// Where things are on the fetus, in the same output px coordinates as
// <Fetus> draws in (origin = body centre, already turned by headDown /
// rotate / mirror). Use these to attach a cord, place highlights, rings,
// heartbeat glows or kick effects. Pure: call it with the same week/pose/size
// you pass to <Fetus>.
import { Pt, add, dist, mul, rot, sub } from "./geom";
import { FetusPose } from "./pose";
import { FetusGeom, buildFetus } from "./rig";
import { OutFrame, outFrame } from "./frame";

export type FetusAnchors = {
  origin: Pt; // always {0,0}
  scale: number; // px per rig unit (the rig is ~600 units crown-rump)
  turn: number; // whole-body rotation in degrees (headDown/rotate)
  headCenter: Pt; headRadius: number; // circle roughly covering the head
  crown: Pt; // top of the head
  face: Pt; // centre of the face (between eye and mouth)
  eye: Pt; nose: Pt; mouth: Pt; chin: Pt; ear: Pt; cheek: Pt;
  profile: Pt[]; // forehead -> under the chin, along the face outline
  heart: Pt; // inside the chest
  navel: Pt; // umbilical cord attachment on the belly
  navelDir: Pt; // unit vector pointing out of the belly at the navel
  shoulder: Pt; elbow: Pt; wrist: Pt;
  hand: Pt; // palm centre
  fingertips: Pt[]; // 4 fingers + thumb
  thumbTip: Pt;
  hip: Pt; knee: Pt; ankle: Pt;
  foot: Pt; // sole centre
  heel: Pt;
  toes: Pt[]; // 5 toe centres (big toe first)
  footReach: Pt[]; // heel/sole/toe points that can touch a wall (kicks)
  farFoot: Pt;
  rump: Pt; // bottom of the back
  back: Pt; // middle of the back surface
  bounds: { x0: number; y0: number; x1: number; y1: number }; // current pose, output px
};

export const anchorsFromGeom = (geo: FetusGeom, fr: OutFrame): FetusAnchors => {
  const o = fr.toOut;
  const lm = geo.lm;
  const hp = (q: Pt) => o(geo.headPt(q));
  const headC = hp({ x: 0, y: -4 });
  const n0 = geo.navel;
  const nIn = geo.sp.pos(0.62, 0.4);
  const nd = sub(o(n0), o(nIn));
  const ndl = Math.hypot(nd.x, nd.y) || 1;
  const all = geo.extent.pts.map((q, i) => ({ q: o(q), r: geo.extent.r[i] * fr.s }));
  const b = {
    x0: Math.min(...all.map((a) => a.q.x - a.r)),
    y0: Math.min(...all.map((a) => a.q.y - a.r)),
    x1: Math.max(...all.map((a) => a.q.x + a.r)),
    y1: Math.max(...all.map((a) => a.q.y + a.r)),
  };
  const h = geo.arm.hand;
  const f = geo.leg.foot;
  return {
    origin: { x: 0, y: 0 },
    scale: fr.s,
    turn: fr.rot,
    headCenter: headC,
    headRadius: 118 * geo.headS * fr.s,
    crown: hp(lm.crown),
    face: hp(mul(add(lm.eye, lm.mouth), 0.5)),
    eye: hp(lm.eye),
    nose: hp(lm.nose),
    mouth: hp(lm.mouth),
    chin: hp(lm.chin),
    ear: hp(lm.ear),
    cheek: hp(lm.cheek),
    profile: geo.profile.map(o),
    heart: o(geo.heart),
    navel: o(n0),
    navelDir: { x: nd.x / ndl, y: nd.y / ndl },
    shoulder: o(geo.arm.shoulder),
    elbow: o(geo.arm.elbow),
    wrist: o(geo.arm.wrist),
    hand: o(h.center),
    fingertips: h.tips.map(o),
    thumbTip: o(h.thumbTip),
    hip: o(geo.leg.hip),
    knee: o(geo.leg.knee),
    ankle: o(geo.leg.ankle),
    foot: o(f.center),
    heel: o(f.heel),
    toes: f.toePts.map(o),
    footReach: f.reach.map(o),
    farFoot: o(geo.farLeg.foot.center),
    rump: o(geo.sp.pos(1, -0.3)),
    back: o(geo.sp.pos(0.5, -1)),
    bounds: b,
  };
};

// Public helper: anchors for the same props you give <Fetus>.
export const fetusAnchors = (week: number, pose: FetusPose = {}, size = 600): FetusAnchors => {
  const geo = buildFetus(week, pose);
  return anchorsFromGeom(geo, outFrame(geo, size));
};

// Convenience: distance from a point to the nearest foot-reach point (kick FX).
export const footReachDistance = (a: FetusAnchors, p: Pt) => Math.min(...a.footReach.map((q) => dist(q, p)));

// Map a point from output px into a parent frame placed at (x, y) and turned
// by deg, e.g. to get the hand position in screen space.
export const placeAnchor = (p: Pt, x: number, y: number, deg = 0, k = 1): Pt => add({ x, y }, rot(mul(p, k), deg));
