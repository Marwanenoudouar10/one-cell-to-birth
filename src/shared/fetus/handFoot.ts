// Hands and feet (shapes from the teaser's Scene4, extended with webbed
// paddles at 9 wk and chubbier digits late). Built in rig units.
import { P, Pt, add, capsule, dir, lerp, mul, place, rot, smooth } from "./geom";

const pts = (a: number[][]): Pt[] => a.map(([x, y]) => P(x, y));

// Palm outline, hand-local (wrist at 0,0, fingers toward +x, thumb side -y).
const PALM = pts([
  [-2, -11], [8, -15], [21, -16], [30, -13], [34, -6], [35, 2], [33, 10], [25, 15], [11, 13], [-1, 10],
]);
const KNUCKLES = pts([[30, -10.5], [33.5, -3.5], [33.5, 3.8], [30.5, 10.5]]);
const FINGER_LEN = [22, 25.5, 23.5, 18];
const FINGER_R = [5.3, 5.5, 5.3, 4.7];
const FINGER_OPEN = [-25, -8.5, 8, 23];
const FINGER_CLOSED = [-7, -2.5, 2, 6];
const THUMB_BASE = P(11, -12);

// Foot seen from the sole: ankle/heel at 0,0, toes toward +x, big toe at -y.
const FOOT = pts([
  [-12, 0], [-8, 9], [4, 12], [20, 15], [34, 18], [45, 16], [50, 8], [51, -4], [47, -14], [36, -18],
  [24, -14], [12, -8], [0, -9], [-9, -7],
]);
const TOES = pts([[55, -12.5], [58.5, -3], [57.5, 5.5], [54, 12.5], [48.5, 18]]);
const TOE_R = [7.2, 5.6, 5.2, 4.8, 4.3];
const PADS = [
  { c: P(4, 1), rx: 11, ry: 9 },
  { c: P(37, 0), rx: 9, ry: 13 },
];

export type Hand = {
  palm: string; fingers: string[]; thumb: string; web: string | null;
  center: Pt; tips: Pt[]; thumbTip: Pt; wrist: Pt; angle: number; s: number;
  knuckles: Pt[]; // finger bases (for knuckle creases / wrinkles)
};
export type Foot = {
  sole: string; toes: string[]; web: string | null; center: Pt; toePts: Pt[]; tip: Pt; reach: Pt[];
  heel: Pt; ankle: Pt; angle: number; s: number;
  pads: { c: Pt; rx: number; ry: number; rot: number }[];
};

const FIST_CURL = [62, 76, 90, 104]; // degrees each finger folds into a fist

const thumbAim = (deg: number, s: number, spread: number, sep: number, fist: number) => {
  const fan = lerp(0.35, 1, sep);
  const tb = rot(mul(THUMB_BASE, s), deg);
  const ta = deg + lerp(lerp(-30, -64, spread) * fan, -20, fist);
  const tl = lerp(lerp(14, 19, spread), 21, fist) * lerp(0.7, 1, sep);
  return { tb, tip: add(tb, mul(dir(ta), tl * s)) };
};

// spread: 0 closed .. 1 open fan. sep: 0 webbed paddle .. 1 separate.
// fist: 0..1 folds the fingers in and points the thumb out (thumb sucking).
export const buildHand = (wrist: Pt, deg: number, s: number, spread: number, sep: number, fat: number, fist = 0): Hand => {
  const palmPts = place(PALM.map((q) => P(q.x * (1 - 0.06 * (1 - sep)), q.y * (1 + 0.06 * fat))), wrist, deg, s);
  const fingers: string[] = [];
  const tips: Pt[] = [];
  const bases: Pt[] = [];
  const fan = lerp(0.35, 1, sep);
  KNUCKLES.forEach((k, i) => {
    const a = lerp(FINGER_CLOSED[i], FINGER_OPEN[i], spread) * fan + fist * FIST_CURL[i];
    const l = FINGER_LEN[i] * lerp(0.52, 1, spread) * lerp(0.62, 1, sep) * lerp(1, 0.62, fist);
    const r = FINGER_R[i] * (1 + 0.24 * fat) * lerp(1.12, 1, sep);
    const base = add(wrist, rot(mul(k, s), deg));
    const tip = add(base, mul(dir(deg + a), l * s));
    bases.push(base);
    tips.push(tip);
    fingers.push(capsule(base, r * s, tip, r * 0.86 * s));
  });
  const aim = thumbAim(deg, s, spread, sep, fist);
  const tb = add(wrist, aim.tb);
  const thumbTip = add(wrist, aim.tip);
  const thumb = capsule(tb, 5.6 * (1 + 0.2 * fat) * s, thumbTip, 4.6 * (1 + 0.2 * fat) * s);
  // webbing between the digital rays (fades out by ~10.5 wk)
  const web =
    sep < 0.98
      ? smooth([
          add(wrist, rot(mul(P(18, -15), s), deg)),
          ...tips.map((t, i) => add(bases[i], mul(add(t, mul(bases[i], -1)), 0.72))),
          add(wrist, rot(mul(P(18, 14), s), deg)),
        ])
      : null;
  const center = add(wrist, rot(mul(P(20, 0), s), deg));
  return { palm: smooth(palmPts), fingers, thumb, web, center, tips: [...tips, thumbTip], thumbTip, wrist, angle: deg, s, knuckles: bases };
};

// Thumb tip offset from the wrist for a given hand angle (used to aim a
// thumb at the mouth before the hand is built).
export const thumbTipOffset = (deg: number, s: number, spread: number, sep: number, fist = 0) =>
  thumbAim(deg, s, spread, sep, fist).tip;

// curls: per-toe -1 stretched .. 1 curled.
export const buildFoot = (ankle: Pt, deg: number, s: number, curls: number[], sep: number, fat: number): Foot => {
  const sole = smooth(place(FOOT.map((q) => P(q.x, q.y * (1 + 0.08 * fat))), ankle, deg, s));
  const toePts: Pt[] = [];
  const toes = TOES.map((t, i) => {
    const c = curls[i] ?? 0;
    // seen from the sole, a curling toe tucks back toward the ball and shrinks
    const local = add(P(lerp(t.x - 6, t.x, sep), t.y * lerp(0.8, 1, sep)), P(-c * 4.5, t.y * -0.06 * c));
    const p = add(ankle, rot(mul(local, s), deg));
    toePts.push(p);
    const r = TOE_R[i] * s * (1 - 0.1 * c) * (1 + 0.12 * fat);
    return capsule(p, r, p, r);
  });
  const web =
    sep < 0.98
      ? smooth([...place(pts([[40, -16], [50, -12], [53, 0], [50, 13], [42, 18]]), ankle, deg, s)])
      : null;
  const center = add(ankle, rot(mul(P(28, 1), s), deg));
  const reach = [P(-8, 11), P(10, 15), P(30, 18), P(44, 17), P(50, 8)].map((q) => add(ankle, rot(mul(q, s), deg)));
  const pads = PADS.map((q) => ({ c: add(ankle, rot(mul(q.c, s), deg)), rx: q.rx * s, ry: q.ry * s, rot: deg }));
  const heel = add(ankle, rot(mul(P(-6, 1), s), deg));
  return { sole, toes, web, center, toePts, tip: toePts[1], reach: [...reach, ...toePts], heel, ankle, angle: deg, s, pads };
};
