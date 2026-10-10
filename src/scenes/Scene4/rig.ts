import {
  P, Pt, add, capsule, dir, lerp, lerpPt, lerpPts, mul, place, rot, smooth,
} from "./geom";
import {
  FINGER_CLOSED, FINGER_LEN, FINGER_OPEN, FINGER_R, FOOT, HEAD12, HEAD20, KNUCKLES, PALM,
  PADS, PROFILE, THUMB_BASE, TOE_R, TOES, TORSO12, TORSO20,
} from "./shapes";

// Animated inputs of the fetus rig.
export type Pose = {
  m: number; // body growth: 0 = week 12, 1 = week 20 (springs may overshoot)
  mHead: number; // head growth (leads)
  mLimb: number; // limb growth (lags: overlapping action)
  spread: number; // fingers 0 = curled, 1 = open fan
  toes: number[]; // per-toe curl, -1 stretched .. 1 curled
  kick: number; // -0.35 tucked .. 0 rest .. 1 extended
  headTilt: number; // degrees, + = chin down
  armSway: number; // degrees of idle arm motion
};

export type Hand = { palm: string; fingers: string[]; thumb: string; center: Pt; tips: Pt[] };
export type Foot = {
  sole: string; toes: string[]; center: Pt; toePts: Pt[]; tip: Pt; reach: Pt[];
  pads: { c: Pt; rx: number; ry: number; rot: number }[];
};

export type Body = {
  torso: string;
  head: string;
  headO: Pt;
  headRot: number;
  headS: number;
  mHead: number;
  profile: Pt[]; // face profile points, fetus-local
  arm: string;
  hand: Hand;
  leg: string;
  foot: Foot;
  farLeg: string;
  torsoPts: Pt[];
  farFoot: Foot;
  belly: Pt;
  eye: Pt; // fetus-local
  hip: Pt;
  hipR: number;
  shoulder: Pt;
  shoulderR: number;
  silhouette: string[]; // near-side parts, for rim light / glow
};

const L = lerp;
const LP = lerpPt;

const buildHand = (wrist: Pt, deg: number, s: number, spread: number): Hand => {
  const palmPts = place(PALM, wrist, deg, s);
  const fingers: string[] = [];
  const tips: Pt[] = [];
  KNUCKLES.forEach((k, i) => {
    const a = L(FINGER_CLOSED[i], FINGER_OPEN[i], spread);
    const l = FINGER_LEN[i] * L(0.52, 1, spread);
    const base = add(wrist, rot(mul(k, s), deg));
    const tip = add(base, mul(dir(deg + a), l * s));
    tips.push(tip);
    fingers.push(capsule(base, FINGER_R[i] * s, tip, FINGER_R[i] * 0.86 * s));
  });
  const tb = add(wrist, rot(mul(THUMB_BASE, s), deg));
  const ta = deg + L(-30, -64, spread);
  const tTip = add(tb, mul(dir(ta), L(14, 19, spread) * s));
  const thumb = capsule(tb, 5.6 * s, tTip, 4.6 * s);
  const center = add(wrist, rot(mul(P(20, 0), s), deg));
  return { palm: smooth(palmPts), fingers, thumb, center, tips: [...tips, tTip] };
};

const buildFoot = (ankle: Pt, deg: number, s: number, curls: number[]): Foot => {
  const sole = smooth(place(FOOT, ankle, deg, s));
  const toePts: Pt[] = [];
  const toes = TOES.map((t, i) => {
    const c = curls[i] ?? 0;
    // Curl: seen from the sole, a curling toe tucks back toward the ball
    // of the foot and shrinks a touch; stretched toes reach out and fan.
    const local = add(t, P(-c * 4.5, t.y * -0.06 * c));
    const p = add(ankle, rot(mul(local, s), deg));
    toePts.push(p);
    const r = TOE_R[i] * s * (1 - 0.1 * c);
    return capsule(p, r, p, r);
  });
  const center = add(ankle, rot(mul(P(28, 1), s), deg));
  // points that can touch the wall: heel, sole, ball, toes
  const reach = [P(-8, 11), P(10, 15), P(30, 18), P(44, 17), P(50, 8)].map((q) => add(ankle, rot(mul(q, s), deg)));
  const pads = PADS.map((q) => ({ c: add(ankle, rot(mul(q.c, s), deg)), rx: q.rx * s, ry: q.ry * s, rot: deg }));
  return { sole, toes, center, toePts, tip: toePts[1], reach: [...reach, ...toePts], pads };
};

type LegCfg = { hip: Pt; thigh: number; shin: number; foot: number; lt: number; ls: number; r: number[]; fs: number };

const leg = (c: LegCfg, kick: number, curls: number[]) => {
  // kick < 0 tucks the leg in (anticipation), kick > 0 extends it.
  const tuck = Math.max(0, -kick) / 0.35;
  const ext = Math.max(0, kick);
  const aT = c.thigh - 14 * tuck + 30 * ext;
  const aS = c.shin + 14 * tuck - 72 * ext;
  const aF = c.foot - 10 * tuck - 42 * ext;
  const knee = add(c.hip, mul(dir(aT), c.lt));
  const ankle = add(knee, mul(dir(aS), c.ls));
  const path = capsule(c.hip, c.r[0], knee, c.r[1]) + capsule(knee, c.r[1], ankle, c.r[2]);
  return { path, foot: buildFoot(ankle, aF, c.fs, curls) };
};

export const buildBody = (p: Pose): Body => {
  const { m, mLimb: ml } = p;
  const mh = p.mHead;
  const torsoPts = lerpPts(TORSO12, TORSO20, m);
  const torso = smooth(torsoPts);

  // Head: own frame so the face details can be placed in head-local space.
  const headO = LP(P(38, -180), P(46, -210), mh); // chin stays tucked onto the chest
  const headRot = L(14, 15, mh) + p.headTilt;
  const headS = L(1, 0.88, mh); // head ~1/2 of crown-rump at 12 wk, ~1/3 at 20 wk
  const headLocal = lerpPts(HEAD12, HEAD20, mh);
  const headPts = place(headLocal, headO, headRot, headS);
  const head = smooth(headPts);
  const profile = headPts.slice(PROFILE[0], PROFILE[1] + 1);

  // Near arm: shoulder -> elbow -> wrist, hand raised in front of the chin.
  const sh = LP(P(32, -48), P(42, -78), ml);
  const elbow = add(sh, mul(dir(L(58, 62, ml) + p.armSway * 0.5), L(92, 128, ml)));
  const wrist = add(elbow, mul(dir(L(-37, -44, ml) - p.armSway), L(86, 118, ml)));
  const ar = [L(24, 31, ml), L(19, 25, ml), L(14, 18, ml)];
  const arm = capsule(sh, ar[0], elbow, ar[1]) + capsule(elbow, ar[1], wrist, ar[2]);
  const hand = buildHand(wrist, L(-72, -74, ml), L(1.22, 1.6, ml), p.spread);

  // Legs: folded up, knees toward the elbows, feet under the knees.
  const near: LegCfg = {
    hip: LP(P(8, 118), P(12, 170), m),
    thigh: L(-8, -10, ml), shin: L(112, 114, ml), foot: L(8, 10, ml),
    lt: L(100, 152, ml), ls: L(90, 140, ml),
    r: [L(33, 45, ml), L(24, 33, ml), L(15, 21, ml)],
    fs: L(1.25, 1.6, ml),
  };
  const nl = leg(near, p.kick, p.toes);
  const far: LegCfg = {
    ...near,
    // tucked just behind the near leg: hidden at rest (no stray knee bump by
    // the cord), revealed as a shaded folded leg when the near leg kicks out
    hip: add(near.hip, P(-8, -5)),
    thigh: near.thigh + 3, shin: near.shin + 4, foot: near.foot - 7,
    r: near.r.map((r) => r * 0.95),
    fs: near.fs * 0.95,
  };
  // full tuck with the near leg, so the far foot never peeks out as a
  // duplicate under the near foot during the wind-up
  const fl = leg(far, Math.min(0, p.kick), [0.3, 0.3, 0.3, 0.3, 0.3]);

  const belly = LP(P(84, 66), P(114, 86), m);
  const hp = hand;
  const fp = nl.foot;
  const silhouette = [torso, head, arm, hp.palm, ...hp.fingers, hp.thumb, nl.path, fp.sole, ...fp.toes];

  const eye = add(headO, rot(mul(lerpPt(P(86, 6), P(90, 8), mh), headS), headRot));
  return {
    eye, hip: near.hip, hipR: near.r[0], shoulder: sh, shoulderR: ar[0],
    torso, head, headO, headRot, headS, mHead: mh, profile,
    arm, hand, leg: nl.path, foot: nl.foot,
    farLeg: fl.path, farFoot: fl.foot, torsoPts,
    belly, silhouette,
  };
};
