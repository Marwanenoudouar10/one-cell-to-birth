import { lerp, lerpArr, ramp, table } from "./math";

// Everything that changes with the week lives here: one pure function of the
// week (3..8.99) that returns the scalars the geometry + renderers read.
// Interpolation is monotone cubic, so a continuous morph never overshoots.

// Monotone (Fritsch-Carlson) cubic through the knots: smooth, no overshoot.
export const mono = (x: number, xs: number[], ys: number[]) => {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let i = 0;
  while (x > xs[i + 1]) i++;
  const d = (k: number) => (ys[k + 1] - ys[k]) / (xs[k + 1] - xs[k]);
  const m = (k: number) => {
    if (k === 0) return d(0);
    if (k === n - 1) return d(n - 2);
    const a = d(k - 1);
    const b = d(k);
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  };
  const h = xs[i + 1] - xs[i];
  const t = (x - xs[i]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m(i) + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m(i + 1)
  );
};

const WK = [3, 3.5, 4, 4.5, 5, 6, 7, 8, 9];
const at = (w: number, v: number[]) => mono(w, WK, v);

// Body knots along s (s<0 = cranial plate that becomes the head; 0..1 = Scene3 tube).
export const S_KNOTS = [-0.3, -0.15, 0, 0.15, 0.3, 0.52, 0.75, 0.86, 0.94, 1];
const W5 = [30, 40, 46, 44, 40, 35, 26, 17, 10.5, 5];
const W6 = [34, 46, 54, 51, 47, 40, 28, 18, 11, 5.5]; // Scene3 exactly (s >= 0)
const W7 = [36, 48, 57, 55, 51, 45, 33, 22, 14, 8];
const W8 = [38, 50, 58, 57, 54, 49, 39, 30, 23, 17];
const W9 = [40, 52, 59, 58, 56, 51, 42, 34, 27, 22];

export type Stage = {
  week: number;
  curl: number; // 0 straight disc .. 1 Scene3 C
  tilt: number; // view rotation about the screen-vertical axis (deg): 62 = looking at the back, 0 = side
  lenScale: number;
  sweep: number; // C sweep (deg) and start angle of the back
  th0: number;
  tailCut: number; // 0..1 tail regression (shortens + blunts the tail)
  fold: number; // 0 flat disc cross-section .. 1 round tube
  expo: number; // cross-section superellipse exponent (3 = slab, 2 = round)
  germ: number; // 1 = three germ-layer colours, 0 = skin
  spin: number; // in-screen rotation (deg) applied after the view tilt: 90 = disc lying flat, head right
  tube: number[]; // round-tube half-width at S_KNOTS
  discB: number; // flat disc: max half-breadth, pear-ness (wider cranially), half-thickness
  discPear: number;
  discA: number;
  streak: number; // primitive streak visibility
  plate: number; // neural plate visibility
  foldRise: number; // neural folds raised
  somites: number; // number of somite pairs (0..26)
  somiteVis: number;
  head: number; // head scale (Scene3 = 1)
  headLift: number; // deg, negative = face turns up
  vesicles: number; // brain vesicles seen through the skin
  heart: number; // heart visibility
  bulge: number; // cardiac prominence scale
  liver: number;
  core: number;
  eye: number; // eye spot visibility
  eyeDark: number; // 0 Scene3 ring .. 1 pigmented eye
  lids: number; // eyelids forming
  face: number; // nose + lips
  ear: number;
  arm: Limb;
  leg: Limb;
};

export type Limb = {
  grow: number; // 0..1 bud emergence (scale)
  len: number; // root -> tip length
  width: number; // half width of the stalk
  rot: number; // root direction (deg, Scene3 frame)
  bend: number; // elbow / knee (deg)
  plate: number; // hand/foot plate radius
  turn: number; // plate direction relative to the forearm/shin (deg); feet turn forward
  digits: number; // 0..1 digital rays + notches
  web: number; // 1 webbed .. 0 free fingers
};

export const stageAt = (week: number): Stage => {
  const w = Math.min(9, Math.max(3, week));
  const fold = ramp(w, 3.7, 4.75);
  const tubeW = w <= 6 ? lerpArr(W5, W6, ramp(w, 5, 6) ** 0.9) : w <= 7 ? lerpArr(W6, W7, w - 6) : w <= 8 ? lerpArr(W7, W8, w - 7) : lerpArr(W8, W9, w - 8);
  const disc = ramp(w, 3, 3.6);
  return {
    week: w,
    curl: at(w, [0, 0, 0.2, 0.68, 0.94, 1, 1, 1, 1]),
    tilt: at(w, [42, 42, 38, 18, 4, 0, 0, 0, 0]),
    spin: at(w, [90, 90, 72, 24, 0, 0, 0, 0, 0]),
    lenScale: at(w, [0.72, 0.76, 0.82, 0.9, 0.96, 1, 1.03, 1.04, 1.04]),
    sweep: at(w, [196, 196, 196, 196, 194, 186, 180, 166, 154]),
    th0: at(w, [-118, -118, -118, -118, -118, -120, -119, -114, -110]),
    tailCut: ramp(w, 6.8, 9),
    fold,
    expo: lerp(10, 2, ramp(w, 3.7, 4.5)),
    germ: 1 - ramp(w, 3.8, 4.6),
    tube: tubeW,
    discB: lerp(96, 82, disc),
    discPear: lerp(0.12, 0.3, disc),
    discA: 22,
    streak: 1 - ramp(w, 3.45, 3.9),
    plate: ramp(w, 3.2, 3.55) * (1 - ramp(w, 4.6, 5.05)),
    foldRise: ramp(w, 3.55, 4.1),
    somites: at(w, [0, 0, 5, 16, 24, 26, 26, 26, 26]),
    somiteVis: at(w, [1, 1, 1, 1, 1, 1, 0.75, 0.32, 0.12]),
    head: at(w, [0, 0, 0, 0.55, 0.86, 1, 1.12, 1.26, 1.32]),
    headLift: at(w, [0, 0, 0, 0, 2, 0, -5, -13, -18]),
    vesicles: at(w, [0, 0, 0.1, 0.35, 0.5, 0.55, 0.36, 0.16, 0.08]),
    heart: ramp(w, 4.25, 4.7) * at(w, [1, 1, 1, 1, 1, 1, 0.86, 0.6, 0.5]),
    bulge: at(w, [0, 0, 0, 0.7, 1.08, 1, 0.86, 0.66, 0.58]),
    liver: at(w, [0, 0, 0, 0.25, 0.72, 1, 1.15, 1.25, 1.25]),
    core: at(w, [0, 0, 0, 0.45, 0.88, 1, 1.04, 1.08, 1.1]),
    eye: ramp(w, 4.85, 5.8),
    eyeDark: ramp(w, 6.2, 7.6),
    lids: ramp(w, 7.5, 8.6),
    face: ramp(w, 7.3, 8.5),
    ear: ramp(w, 7.4, 8.5),
    arm: {
      grow: ramp(w, 4.95, 5.85),
      len: at(w, [54, 54, 54, 54, 54, 54, 70, 92, 100]),
      width: at(w, [15, 15, 15, 15, 15, 15, 11.5, 10.5, 10]),
      rot: at(w, [42, 42, 42, 42, 42, 42, 52, 66, 66]),
      bend: at(w, [0, 0, 0, 0, 0, 0, -12, -95, -105]),
      plate: at(w, [0, 0, 0, 0, 0, 0, 20, 18, 17]),
      turn: at(w, [0, 0, 0, 0, 0, 0, 0, -10, -15]),
      digits: ramp(w, 7.15, 8.1),
      web: 1 - ramp(w, 8.1, 9) * 0.75,
    },
    leg: {
      grow: ramp(w, 5.2, 5.95),
      len: at(w, [42, 42, 42, 42, 42, 42, 54, 76, 84]),
      width: at(w, [12, 12, 12, 12, 12, 12, 11, 10.5, 10]),
      rot: at(w, [18, 18, 18, 18, 18, 18, 10, -12, -16]),
      bend: at(w, [0, 0, 0, 0, 0, 0, 10, 80, 88]),
      plate: at(w, [0, 0, 0, 0, 0, 0, 15, 14, 14]),
      turn: at(w, [0, 0, 0, 0, 0, 0, -10, -70, -75]),
      digits: ramp(w, 7.5, 8.5),
      web: 1 - ramp(w, 8.4, 9) * 0.7,
    },
  };
};

// Default neural-tube closure for a week (used when <Embryo zip> is omitted).
export const defaultZip = (week: number) => ramp(week, 3.9, 4.75);

// Cross-section half-thickness a (dorsal-ventral) and half-breadth b (lateral)
// at s, noise-free: flat pear-shaped disc blended into the round tube by `fold`.
export const sectionAt = (st: Stage, s: number) => {
  const x = Math.max(-1, Math.min(1, ((s + 0.3) / 1.3) * 2 - 1));
  const env = Math.pow(Math.max(0, 1 - x * x), 0.42);
  const bD = st.discB * env * (1 - st.discPear * x);
  const aD = st.discA * Math.pow(env, 0.45) * (1 - 0.15 * x);
  const t = table(s, S_KNOTS, st.tube);
  return { a: lerp(aD, t, st.fold), b: lerp(bD, t, st.fold) };
};

// Stage with an extra in-screen rotation folded into `spin`, so a rotated embryo
// keeps its top-left light (the rotation is applied to the geometry, not the group).
export const stageFor = (week: number, rotate = 0): Stage => {
  const st = stageAt(week);
  return rotate ? { ...st, spin: st.spin + rotate } : st;
};
