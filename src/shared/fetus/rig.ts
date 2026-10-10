// Builds the whole fetus geometry for a week + pose, in rig units (face
// toward +x, head up, crown-rump ~600 units). Pure and deterministic.
import { Pt, add, dir, mul, place, rot, smooth } from "./geom";
import { blendPts, keyWeights } from "./curve";
import { Growth, growth } from "./growth";
import { FetusPose, ResolvedPose, resolvePose } from "./pose";
import { Spine, buildSpine, spineTheta } from "./spine";
import { HEAD_KEYS, HEAD_WEEKS, HeadLandmarks, LANDMARK_KEYS, PROFILE } from "./headShapes";
import { Arm, Leg, buildArm, buildLegs } from "./limbs";

const HEAD_UNITS = 234; // authored head height (crown -> chin)
const REF_NECK = spineTheta(67, 0);

export type FetusGeom = {
  g: Growth;
  p: ResolvedPose;
  sp: Spine;
  torso: string;
  head: string;
  headPts: Pt[];
  profile: Pt[];
  headO: Pt;
  headRot: number;
  headS: number;
  lm: HeadLandmarks; // head-local
  headPt: (q: Pt) => Pt; // head-local -> rig
  arm: Arm;
  leg: Leg;
  farLeg: Leg;
  navel: Pt;
  heart: Pt;
  silhouette: string[]; // near-side parts (rim light, halo)
  extent: { pts: Pt[]; r: number[] }; // circles that bound the body
};

const blendLm = (w: number[]): HeadLandmarks => {
  const keys = Object.keys(LANDMARK_KEYS[0]) as (keyof HeadLandmarks)[];
  const out = {} as HeadLandmarks;
  keys.forEach((k) => {
    out[k] = blendPts(w, LANDMARK_KEYS.map((l) => [l[k]]))[0];
  });
  return out;
};

export const buildFetus = (week: number, pose: FetusPose | ResolvedPose = {}): FetusGeom => {
  const g = growth(week);
  const p: ResolvedPose = "arm" in pose ? (pose as ResolvedPose) : resolvePose(pose as FetusPose);
  const sp = buildSpine(g, p);
  const L = g.L;

  // head: pivots on the front of the neck, rotates with the upper spine
  const hw = keyWeights(g.week, HEAD_WEEKS);
  const headLocal = blendPts(hw, HEAD_KEYS);
  const lm = blendLm(hw);
  const headS = g.headH / HEAD_UNITS;
  const th0 = sp.theta(0);
  const lift = mul(dir(th0), -L * (0.03 * p.hiccup + 0.01 * p.breathe));
  const pivot = add(add(add(sp.centre(0), mul(dir(th0 - 90), 0.07 * L)), mul(dir(th0), -0.03 * L)), lift);
  const headRot = 14 + p.headTilt + (th0 - REF_NECK) * 0.6 - 5 * p.hiccup - 1.5 * p.breathe;
  const headO = add(pivot, mul(rot(lm.neck, headRot), -headS));
  const headPt = (q: Pt) => add(headO, rot(mul(q, headS), headRot));
  const headPts = place(headLocal, headO, headRot, headS);
  const head = smooth(headPts);
  const profile = headPts.slice(PROFILE[0], PROFILE[1] + 1);

  const arm = buildArm(g, sp, p, headPt, headRot, add(lm.mouth, { x: -3, y: 0 }), lm.cheek);
  const { near: leg, far: farLeg } = buildLegs(g, sp, p);

  const navel = sp.pos(0.62, 0.9);
  const heart = sp.pos(0.3, 0.12);
  const h = arm.hand;
  const f = leg.foot;
  const silhouette = [sp.torso, head, arm.path, h.palm, ...h.fingers, h.thumb, leg.path, f.sole, ...f.toes];

  const ex: Pt[] = [...sp.outline, ...headPts, arm.shoulder, arm.elbow, arm.wrist, ...h.tips, leg.hip, leg.knee, leg.ankle, ...f.reach];
  const er: number[] = [
    ...sp.outline.map(() => 0), ...headPts.map(() => 0),
    ...arm.r, ...h.tips.map(() => 5 * h.s), ...leg.r, ...f.reach.map(() => 6 * f.s),
  ];
  return {
    g, p, sp, torso: sp.torso, head, headPts, profile, headO, headRot, headS, lm, headPt,
    arm, leg, farLeg, navel, heart, silhouette, extent: { pts: ex, r: er },
  };
};

export const bbox = (geo: FetusGeom) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  geo.extent.pts.forEach((q, i) => {
    const r = geo.extent.r[i];
    x0 = Math.min(x0, q.x - r);
    y0 = Math.min(y0, q.y - r);
    x1 = Math.max(x1, q.x + r);
    y1 = Math.max(y1, q.y + r);
  });
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, c: { x: (x0 + x1) / 2, y: (y0 + y1) / 2 } };
};
