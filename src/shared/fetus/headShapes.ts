// Head outlines, head-local (centre of the cranium at 0,0, face looking +x,
// ~234 units tall before scaling). Same 20-point topology at every key so
// they blend: back of neck, over the crown, down the profile (brow, nose,
// lips, chin) and under the jaw. Weeks 12 and 20 match the teaser's Scene4.
import { P, Pt } from "./geom";

const pts = (a: number[][]): Pt[] => a.map(([x, y]) => P(x, y));

export const HEAD_WEEKS = [9, 12, 20, 30, 40] as const;

// 9 wk: huge round cranium, flat face, tiny jaw, barely a nose
const HEAD9 = pts([
  [-72, 92], [-114, 44], [-130, -22], [-104, -92], [-38, -126], [38, -122], [98, -86],
  [119, -36], [122, -4], [120, 10], [126, 22], [120, 31], [121, 39], [117, 45], [118, 51],
  [109, 59], [107, 68], [92, 84], [62, 96], [26, 102],
]);
const HEAD12 = pts([
  [-70, 95], [-108, 50], [-125, -15], [-100, -85], [-35, -122], [40, -118], [100, -80],
  [124, -28], [128, 4], [124, 15], [133, 28], [125, 37], [127, 46], [122, 52], [125, 59],
  [115, 68], [118, 80], [100, 98], [68, 108], [30, 112],
]);
const HEAD20 = pts([
  [-72, 98], [-112, 48], [-126, -20], [-98, -88], [-30, -120], [45, -112], [102, -70],
  [121, -22], [124, 6], [119, 17], [134, 32], [124, 42], [128, 51], [121, 57], [126, 64],
  [114, 73], [121, 87], [104, 103], [70, 110], [30, 112],
]);
// 30 wk: fuller cheeks and chin, defined lips
const HEAD30 = pts([
  [-73, 100], [-113, 49], [-126, -20], [-98, -89], [-29, -121], [46, -112], [101, -71],
  [119, -24], [122, 5], [118, 17], [133, 31], [123, 41], [128, 51], [121, 58], [127, 64],
  [115, 74], [121, 88], [106, 106], [72, 114], [31, 115],
]);
// 40 wk: chubby newborn: round cheeks, button nose, full lips, soft double chin
const HEAD40 = pts([
  [-74, 102], [-114, 50], [-126, -20], [-97, -90], [-27, -121], [48, -111], [101, -71],
  [117, -25], [119, 4], [116, 16], [130, 30], [121, 40], [128, 50], [121, 58], [128, 65],
  [116, 76], [123, 90], [108, 110], [74, 120], [32, 118],
]);

export const HEAD_KEYS = [HEAD9, HEAD12, HEAD20, HEAD30, HEAD40];

// Index range of the face profile inside the outline (forehead -> under chin).
export const PROFILE = [6, 18] as const;

// Head-local landmarks (they move a little with age; blended by `headLm`).
export type HeadLandmarks = {
  eye: Pt; ear: Pt; nose: Pt /* nostril */; mouth: Pt; mouthBack: Pt; chin: Pt; cheek: Pt; crown: Pt; neck: Pt; brow: Pt;
};
const LM = (eye: number[], ear: number[], nose: number[], mouth: number[], chin: number[], cheek: number[]): HeadLandmarks => ({
  eye: P(eye[0], eye[1]),
  ear: P(ear[0], ear[1]),
  nose: P(nose[0], nose[1]),
  mouth: P(mouth[0], mouth[1]),
  mouthBack: P(mouth[0] - 13, mouth[1] + 1),
  chin: P(chin[0], chin[1]),
  cheek: P(cheek[0], cheek[1]),
  crown: P(-20, -124),
  neck: P(-8, 96),
  brow: P(eye[0] + 6, eye[1] - 24),
});
export const LANDMARK_KEYS: HeadLandmarks[] = [
  LM([84, 2], [-2, 58], [119, 28], [117, 45], [104, 72], [80, 38]),
  LM([86, 6], [-6, 50], [125, 33], [122, 52], [114, 82], [84, 40]),
  LM([90, 8], [-14, 30], [125, 37], [124, 57], [118, 90], [88, 44]),
  LM([90, 8], [-15, 28], [124, 36], [124, 58], [118, 92], [86, 48]),
  LM([90, 8], [-16, 26], [122, 35], [124, 58], [119, 94], [84, 52]),
];

// Scalp vessels (head-local polylines) for the translucent early weeks.
export const SCALP_VESSELS: Pt[][] = [
  pts([[30, 20], [16, -22], [10, -60], [-6, -96]]),
  pts([[16, -22], [-18, -40], [-52, -48]]),
  pts([[10, -60], [34, -84], [56, -98]]),
  pts([[-18, -40], [-38, -74], [-46, -100]]),
  pts([[-6, 30], [-40, 8], [-76, 0], [-100, -14]]),
  pts([[-40, 8], [-62, 36], [-84, 50]]),
];

// Hair wisps on the crown (head-local, open curves), for 30 wk+: soft
// strokes swirling out of a whorl at the back of the crown.
const WHORL = P(-44, -74);
export const HAIR: Pt[][] = Array.from({ length: 15 }, (_, k) => {
  const a = -200 + k * (215 / 14);
  const r = 58 + 14 * Math.sin(k * 1.9);
  const at = (deg: number, d: number) => P(WHORL.x + Math.cos((deg * Math.PI) / 180) * d, WHORL.y + Math.sin((deg * Math.PI) / 180) * d);
  return [at(a, 10), at(a + 14, r * 0.55), at(a + 24, r)];
});
