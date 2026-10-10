// Arms and legs. The near arm blends named poses (rest / handToFace /
// thumbSuck) by placing the wrist and solving a 2-bone IK, so the hand lands
// on the face whatever the head size or tilt. Legs are forward kinematics
// (from the teaser's Scene4) with curl and kick.
import { Pt, add, capsule, clamp, dir, dist, lerp, mul, sub } from "./geom";
import { Growth } from "./growth";
import { ResolvedPose } from "./pose";
import { Spine, spineTheta } from "./spine";
import { Foot, Hand, buildFoot, buildHand, thumbTipOffset } from "./handFoot";

// natural spine headings the limb angles were authored against (curl 0.5, wk 12)
const REF_TURN = 67;
const REF_SH = spineTheta(REF_TURN, 0.15);
const REF_HIP = spineTheta(REF_TURN, 0.85);

const ik = (a: Pt, target: Pt, l1: number, l2: number) => {
  const d = clamp(dist(a, target), Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  const base = Math.atan2(target.y - a.y, target.x - a.x);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const ang = base + Math.acos(cosA); // elbow bends down/back (clockwise side)
  const elbow = add(a, { x: Math.cos(ang) * l1, y: Math.sin(ang) * l1 });
  const wd = sub(target, elbow);
  const wl = Math.hypot(wd.x, wd.y) || 1;
  return { elbow, wrist: add(elbow, mul(wd, l2 / wl)) };
};

export type Arm = { path: string; hand: Hand; shoulder: Pt; elbow: Pt; wrist: Pt; r: number[] };

// headPt maps head-local points to rig space; headRot is the head angle.
export const buildArm = (
  g: Growth, sp: Spine, p: ResolvedPose, headPt: (q: Pt) => Pt, headRot: number, mouth: Pt, cheek: Pt,
): Arm => {
  const L = g.L;
  const bodyAng = sp.theta(0.15) - REF_SH;
  const up = mul(dir(sp.theta(0.15)), -1);
  const sh = add(sp.pos(0.15, 0.5), mul(up, L * (0.03 * p.hiccup + 0.012 * p.breathe)));
  const lu = g.armU * L;
  const lf = g.armF * L;
  const hs = g.handS;
  const sway = p.armSway + 6 * p.hiccup;
  const w = p.arm;

  // rest: forearm raised, hand in front of the chin (the teaser's pose)
  const eR = add(sh, mul(dir(58 + sway * 0.5 + bodyAng), lu));
  const wR = add(eR, mul(dir(-40 - sway + bodyAng), lf));
  const aR = -73 + bodyAng;
  const sR = p.handOpen;
  // hand to face: palm resting on the cheek, fingers up along the face
  const aF = headRot - 74 + sway * 0.3;
  const sF = lerp(0.45, 0.85, p.handOpen);
  const touch = add(mul(cheek, 0.55), mul(mouth, 0.45));
  const wF = sub(headPt(add(touch, { x: -8, y: 14 })), mul(dir(aF), 20 * hs));
  // thumb suck: loose fist, thumb tip at the lips
  const aS = headRot - 52 + sway * 0.2;
  const sS = 0.05 + 0.1 * p.handOpen;
  const wS = sub(headPt(mouth), thumbTipOffset(aS, hs, sS, g.fingerSep, 1));

  const target = add(add(mul(wR, w.rest), mul(wF, w.handToFace)), mul(wS, w.thumbSuck));
  const ang = aR * w.rest + aF * w.handToFace + aS * w.thumbSuck;
  const spread = sR * w.rest + sF * w.handToFace + sS * w.thumbSuck;
  const { elbow, wrist } = ik(sh, target, lu, lf);
  const r = [g.armR * L, g.armR * 0.79 * L, g.armR * 0.6 * L];
  const path = capsule(sh, r[0], elbow, r[1]) + capsule(elbow, r[1], wrist, r[2]);
  const hand = buildHand(wrist, ang, hs, spread, g.fingerSep, g.fat, w.thumbSuck);
  return { path, hand, shoulder: sh, elbow, wrist, r };
};

export type Leg = { path: string; foot: Foot; hip: Pt; knee: Pt; ankle: Pt; r: number[] };

const legFK = (
  hip: Pt, thigh: number, shinRel: number, footRel: number, lt: number, ls: number, r: number[],
  fs: number, kick: number, curls: number[], sep: number, fat: number,
): Leg => {
  // kick < 0 tucks the leg in (anticipation), kick > 0 extends it
  const tuck = Math.max(0, -kick) / 0.35;
  const ext = Math.max(0, kick);
  const aT = thigh - 14 * tuck + 30 * ext;
  const aS = aT + shinRel + 28 * tuck - 102 * ext;
  const aF = aS + footRel - 24 * tuck + 30 * ext;
  const knee = add(hip, mul(dir(aT), lt));
  const ankle = add(knee, mul(dir(aS), ls));
  const path = capsule(hip, r[0], knee, r[1]) + capsule(knee, r[1], ankle, r[2]);
  return { path, foot: buildFoot(ankle, aF, fs, curls, sep, fat), hip, knee, ankle, r };
};

export const buildLegs = (g: Growth, sp: Spine, p: ResolvedPose) => {
  const L = g.L;
  const pelvis = sp.theta(0.85) - REF_HIP;
  const c = p.curl - 0.5;
  const hip = sp.pos(0.8, 0.3);
  const thigh = -8 + pelvis - 36 * c - g.cramp;
  const shinRel = 120 + 26 * c + 0.5 * g.cramp;
  const footRel = -104;
  const lt = g.legT * L;
  const ls = g.legS * L;
  const r = [g.legR * L, g.legR * 0.73 * L, g.legR * 0.46 * L];
  const kick = p.legKick + 0.08 * p.hiccup;
  const near = legFK(hip, thigh, shinRel, footRel, lt, ls, r, g.footS, kick, p.toes, g.fingerSep, g.fat);
  // tucked just behind the near leg; revealed as a shaded leg when it kicks
  const far = legFK(
    add(hip, mul(dir(sp.theta(0.8) + 180), 0.03 * L)), thigh + 3, shinRel + 1, footRel - 7, lt, ls,
    r.map((x) => x * 0.95), g.footS * 0.95, Math.min(0, kick) * 0.5, [0.3, 0.3, 0.3, 0.3, 0.3], g.fingerSep, g.fat,
  );
  return { near, far };
};
