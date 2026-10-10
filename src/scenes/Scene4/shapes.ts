import { Pt, P } from "./geom";

// Hand-authored control points for the fetus at two ages. The rig morphs
// between them (0 = week 12, 1 = week 20). Units: fetus-local px.
const pts = (a: number[][]): Pt[] => a.map(([x, y]) => P(x, y));

// Head outline, head-local (centre 0,0, face looking +x). Goes from the back
// of the neck, over the crown, down the profile (brow, nose, lips, chin).
export const HEAD12 = pts([
  [-70, 95], [-108, 50], [-125, -15], [-100, -85], [-35, -122], [40, -118], [100, -80],
  [124, -28], [128, 4], [124, 15], [133, 28], [125, 37], [127, 46], [122, 52], [125, 59],
  [115, 68], [118, 80], [100, 98], [68, 108], [30, 112],
]);
export const HEAD20 = pts([
  [-72, 98], [-112, 48], [-126, -20], [-98, -88], [-30, -120], [45, -112], [102, -70],
  [121, -22], [124, 6], [119, 17], [134, 32], [124, 42], [128, 51], [121, 57], [126, 64],
  [114, 73], [121, 87], [104, 103], [70, 110], [30, 112],
]);
// Index range of the face profile inside the head outline (forehead -> under chin).
export const PROFILE = [6, 18] as const;

// Torso outline, fetus-local: neck, curved back, rump, belly, chest.
export const TORSO12 = pts([
  [-40, -90], [-80, -62], [-104, -8], [-110, 52], [-102, 105], [-80, 148], [-35, 176],
  [20, 168], [62, 128], [82, 68], [80, 8], [58, -55], [20, -95],
]);
export const TORSO20 = pts([
  [-50, -130], [-100, -95], [-128, -20], [-132, 70], [-118, 150], [-92, 215], [-40, 252],
  [25, 240], [80, 180], [104, 95], [98, 10], [72, -70], [25, -128],
]);
// Torso outline indices running down the back (for the spine hint).
export const BACK = [0, 6] as const;

// Palm outline, hand-local (wrist at 0,0, fingers toward +x, thumb side -y).
export const PALM = pts([
  [-2, -11], [8, -15], [21, -16], [30, -13], [34, -6], [35, 2], [33, 10], [25, 15], [11, 13], [-1, 10],
]);
export const KNUCKLES = pts([[30, -10.5], [33.5, -3.5], [33.5, 3.8], [30.5, 10.5]]);
export const FINGER_LEN = [22, 25.5, 23.5, 18];
export const FINGER_R = [5.3, 5.5, 5.3, 4.7];
export const FINGER_OPEN = [-25, -8.5, 8, 23];
export const FINGER_CLOSED = [-7, -2.5, 2, 6];
export const THUMB_BASE = P(11, -12);

// Foot, seen from the sole (the near foot is turned so its sole faces us):
// foot-local, ankle/heel at 0,0, toes toward +x, big toe on the -y side.
// Narrow round heel, an arch on the big-toe (-y) side, a broad ball.
export const FOOT = pts([
  [-12, 0], [-8, 9], [4, 12], [20, 15], [34, 18], [45, 16], [50, 8], [51, -4], [47, -14], [36, -18],
  [24, -14], [12, -8], [0, -9], [-9, -7],
]);
export const TOES = pts([[55, -12.5], [58.5, -3], [57.5, 5.5], [54, 12.5], [48.5, 18]]);
export const TOE_R = [7.2, 5.6, 5.2, 4.8, 4.3];
// soft sole pads (heel, ball) for a readable baby-foot silhouette
export const PADS = [
  { c: P(4, 1), rx: 11, ry: 9 },
  { c: P(37, 0), rx: 9, ry: 13 },
];
