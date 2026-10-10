import { capsule, lerp, Pt, smoothClosed } from "../geometry";

// Local "grip space": the adult finger lies along the x axis (y = 0), tip
// pointing to -x. The whole group is rotated/placed by HandWorld.
// Proportions are real: newborn finger ~0.4x the width of an adult finger
// (the adult hand itself lives in adultShapes.ts).
export const TIP_REST = -330;

// Baby palm + chubby wrist (sits BEHIND the adult finger).
export const PALM = smoothClosed([
  [-128, -118], [-60, -136], [12, -138], [80, -128], [120, -84], [126, 20], [100, 118],
  [56, 178], [0, 208], [-60, 210], [-118, 178], [-150, 100], [-150, -30],
]);
export const WRIST = capsule(-36, 200, -150, 300, 96, 100);
// fleshy thumb base (thenar pad) the thumb grows out of
export const THENAR = capsule(-96, 190, -176, 84, 74, 44);
export const WRIST_CREASE: Pt[] = [[-196, 236], [-146, 272], [-110, 326]];
export const PALM_LINES: Pt[][] = [
  [[-110, -40], [-40, -14], [40, -18], [104, -44]],
  [[-104, 40], [-30, 64], [60, 70]],
];

// Soft knitted sleeve the forearm disappears into (keeps the caption band dark).
export const SLEEVE_AXIS = { ax: -196, ay: 334, bx: -980, by: 560 };
export const SLEEVE = capsule(SLEEVE_AXIS.ax, SLEEVE_AXIS.ay, SLEEVE_AXIS.bx, SLEEVE_AXIS.by, 150, 180);
export const CUFF = { x: -186, y: 330, rx: 56, ry: 156, rot: 152 };

export type FingerSpec = { bx: number; by: number; r: number; L: number; tiltOpen: number; tiltClosed: number };

// newborn fingers are ~0.7x the palm's length (short and chubby, not stubs)
export const FINGERS: FingerSpec[] = [
  { bx: -88, by: -124, r: 28, L: 148, tiltOpen: -16, tiltClosed: -9 }, // index
  { bx: -32, by: -131, r: 29, L: 166, tiltOpen: -4, tiltClosed: -5 }, // middle
  { bx: 24, by: -128, r: 27, L: 156, tiltOpen: 9, tiltClosed: -1 }, // ring
  { bx: 74, by: -118, r: 23, L: 122, tiltOpen: 21, tiltClosed: 5 }, // pinky
];

// Projected finger as it curls toward the camera and over the adult finger.
// c = 0 relaxed open (pointing up), 1 = wrapped (tip on the front face).
export const fingerPose = (f: FingerSpec, c: number) => {
  const k = Math.min(1, c);
  const th = ((0.18 + 0.82 * c) * 146 * Math.PI) / 180;
  const tilt = (lerp(f.tiltOpen, f.tiltClosed, k) * Math.PI) / 180;
  const by = f.by + k * 6;
  const tx = f.bx + f.L * Math.sin(tilt);
  const ty = by - f.L * Math.cos(tilt) * Math.cos(th);
  const rt = f.r * lerp(0.84, 0.9, k);
  const dir = Math.atan2(ty - by, tx - f.bx);
  return { base: [f.bx, by] as Pt, tip: [tx, ty] as Pt, r: f.r, rt, dir, d: capsule(f.bx, by, tx, ty, f.r, rt) };
};

export const THUMB = { base: [-178, 80] as Pt, r: 40, rt: 27, open: [-240, 8] as Pt, closed: [-72, 6] as Pt };

export const thumbPose = (c: number) => {
  const k = Math.min(1.05, c);
  const lift = Math.sin(Math.min(1, k) * Math.PI) * 40;
  const tip: Pt = [lerp(THUMB.open[0], THUMB.closed[0], k), lerp(THUMB.open[1], THUMB.closed[1], k) - lift];
  const dir = Math.atan2(tip[1] - THUMB.base[1], tip[0] - THUMB.base[0]);
  return { tip, dir, d: capsule(THUMB.base[0], THUMB.base[1], tip[0], tip[1], THUMB.r, THUMB.rt) };
};
