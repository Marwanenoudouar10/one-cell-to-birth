import { capsule, circle, Pt, smoothClosed, smoothOpen } from "../geometry";

// Full-term baby, curled head-down, facing left, back curved on the right.
// All coordinates are screen pixels around the sac centre (540, 860).
export const HEAD = { x: 578, y: 1072, r: 150 };
const F: Pt = [-0.94, -0.34]; // face "forward" (chin tucked toward the chest)
const U: Pt = [-0.34, 0.94]; // toward the crown (pointing down at the cervix)

// head-relative point: a = forward, b = toward crown, in head radii
export const hp = (a: number, b: number): Pt => [
  HEAD.x + HEAD.r * (a * F[0] + b * U[0]),
  HEAD.y + HEAD.r * (a * F[1] + b * U[1]),
];

const at = (p: Pt, r: number) => circle(p[0], p[1], r);

export const TORSO = smoothClosed([
  [712, 990], [790, 918], [838, 812], [852, 692], [826, 590], [764, 522], [676, 490],
  [596, 498], [536, 540], [500, 616], [482, 716], [484, 816], [510, 892], [562, 940], [636, 968],
]);

const cheek = hp(0.44, -0.4);
const nose = hp(0.97, -0.27);
export const HEAD_SHAPES = [
  circle(HEAD.x, HEAD.y, HEAD.r),
  at(cheek, HEAD.r * 0.6),
  at(nose, HEAD.r * 0.12),
  at(hp(0.78, -0.62), HEAD.r * 0.2), // lips/chin
];

export const BODY = [TORSO, ...HEAD_SHAPES];

export const FAR_LEG = [
  capsule(700, 585, 474, 680, 88, 60),
  capsule(470, 676, 590, 540, 50, 36),
];

export const NEAR_THIGH = [capsule(656, 620, 404, 772, 100, 66)];

// shin folds back up along the sac wall; foot pressed against the wall
const ANKLE: [number, number] = [452, 574];
const TOE_END: [number, number] = [394, 516];
export const NEAR_SHIN = [
  capsule(388, 760, ANKLE[0], ANKLE[1], 58, 40),
  capsule(ANKLE[0], ANKLE[1], TOE_END[0], TOE_END[1], 40, 31),
  circle(476, 592, 33), // heel
];

const fd: Pt = [-0.72, -0.69]; // foot direction (ankle -> toes)
const fp: Pt = [0.69, -0.72]; // across the foot
export const TOES: [number, number, number][] = [
  [-1.25, 1.0, 13], [-0.5, 0.9, 11], [0.25, 0.8, 10], [0.95, 0.65, 9],
].map(([k, d, r]) => [TOE_END[0] + fd[0] * 22 * d + fp[0] * 24 * k, TOE_END[1] + fd[1] * 22 * d + fp[1] * 24 * k, r]);

// umbilical cord from the belly to the placenta on the upper-left wall
export const CORD: Pt[] = [[446, 806], [384, 812], [338, 760], [326, 690], [300, 628], [262, 596]];
export const PLACENTA = { x: 236, y: 592, rx: 118, ry: 46, rot: -48 };

export const NEAR_ARM = [
  capsule(660, 906, 552, 826, 55, 44),
  capsule(552, 826, 474, 902, 44, 34),
  circle(454, 914, 41),
];

// face + small details, drawn as strokes on top of the skin
export const EYE = smoothOpen([hp(0.46, 0.08), hp(0.6, -0.02), hp(0.74, 0.04)]);
export const LID = smoothOpen([hp(0.45, 0.12), hp(0.6, 0.15), hp(0.75, 0.09)]);
export const BROW = smoothOpen([hp(0.47, 0.3), hp(0.62, 0.33), hp(0.76, 0.27)]);
export const MOUTH = smoothOpen([hp(0.86, -0.5), hp(0.9, -0.56), hp(0.86, -0.63)]);
export const NOSTRIL = hp(0.98, -0.33);
export const EAR = hp(-0.14, -0.04);
export const CHEEK = cheek;
export const FIST_LINES = [
  smoothOpen([[424, 900], [436, 903], [448, 900]]),
  smoothOpen([[420, 920], [433, 923], [446, 920]]),
];
export const KNEE_HI: Pt = [392, 728];
