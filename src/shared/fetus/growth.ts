// How the fetus changes with gestational week (9..40): proportions, limb
// lengths, skin and fine details. Pure functions of `week`, all continuous.
//
// Rig units: the body is authored so the curled height is ~630 units at
// every week (the <Fetus size> prop then scales it to pixels). So stroke
// widths and blurs look the same at every age and every size.
import { curve, curve01, linear, smoothstep } from "./curve";

export const MIN_WEEK = 9;
export const MAX_WEEK = 40;
export const RIG_HEIGHT = 600;

type Keys = readonly (readonly [number, number])[];
const K = (vals: number[]): Keys => [9, 12, 16, 20, 24, 28, 32, 36, 40].map((w, i) => [w, vals[i]] as const);

// head height / spine length. Gives head ~1/2 of crown-rump at 9-12 wk,
// ~1/3 of crown-heel at 20 wk, ~1/4 at birth (matches the teaser's Scene4
// at 12 and 20 wk).
const HEAD_Q = K([1.12, 0.92, 0.76, 0.64, 0.6, 0.585, 0.585, 0.595, 0.61]);
// torso half-width / spine length (lean at 22-26 wk, plump from 32)
const WIDTH = K([0.32, 0.34, 0.325, 0.31, 0.295, 0.3, 0.31, 0.32, 0.33]);
const BELLY = K([0, 0, 0, 0, 0, 0.012, 0.03, 0.045, 0.055]);
const ARM_U = K([0.26, 0.33, 0.34, 0.34, 0.34, 0.345, 0.35, 0.355, 0.36]);
const ARM_F = K([0.24, 0.31, 0.32, 0.315, 0.315, 0.32, 0.325, 0.33, 0.335]);
const ARM_R = K([0.074, 0.088, 0.086, 0.082, 0.079, 0.092, 0.11, 0.124, 0.135]);
const LEG_T = K([0.3, 0.4, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48]);
const LEG_S = K([0.23, 0.33, 0.36, 0.37, 0.38, 0.39, 0.4, 0.41, 0.42]);
const LEG_R = K([0.1, 0.122, 0.122, 0.12, 0.115, 0.125, 0.142, 0.158, 0.17]);
const HAND = K([0.0034, 0.0045, 0.0044, 0.0042, 0.0042, 0.0043, 0.0044, 0.0045, 0.0046]);
const FOOT = K([0.0034, 0.0046, 0.0044, 0.0042, 0.0042, 0.0043, 0.0044, 0.0045, 0.0046]);
// extra spine curl (degrees): embryo-like C at 9 wk, cramped at term
const CURL_BIAS = K([26, 10, 2, 0, 0, 0, 2, 6, 10]);
// thighs pulled higher toward the chest as space runs out (degrees)
const CRAMP = K([0, 0, 0, 0, 0, 2, 6, 11, 16]);

// skin + details (0..1)
const TRANSLUCENT = K([1, 0.92, 0.76, 0.6, 0.44, 0.3, 0.17, 0.09, 0.05]);
const VESSELS = K([1, 0.85, 0.58, 0.34, 0.14, 0.03, 0, 0, 0]);
const PINK = K([0.1, 0.08, 0.07, 0.06, 0.09, 0.06, 0.03, 0.02, 0.02]);
const FAT = K([0, 0, 0, 0, 0, 0.22, 0.58, 0.84, 1]);
const EYE_DARK = K([1, 0.72, 0.36, 0.14, 0, 0, 0, 0, 0]);
const WRINKLE: Keys = [[9, 0], [18, 0], [21, 0.45], [23.5, 1], [25.5, 0.85], [28, 0.2], [30, 0], [40, 0]];
const LANUGO: Keys = [[9, 0], [14.5, 0], [17, 0.45], [21, 0.9], [25, 1], [29, 0.7], [32, 0.2], [34, 0], [40, 0]];
const VERNIX: Keys = [[9, 0], [19, 0], [22, 0.25], [26, 0.6], [30, 0.9], [33, 1], [36, 0.6], [38.5, 0.18], [40, 0.12]];

// crown-rump length in cm (Robinson & Fleming / Hadlock style averages), for
// chapters that want true relative scale: size = k * crlCm(week).
const CRL: Keys = [
  [8, 1.6], [9, 2.3], [10, 3.1], [11, 4.1], [12, 5.4], [14, 8.7], [16, 11.6], [18, 14.2], [20, 16.4],
  [24, 21], [28, 25], [32, 28.9], [36, 32.2], [40, 36.2],
];
export const crlCm = (week: number) => linear(week, CRL);

export type Growth = {
  week: number;
  headH: number; // head height, rig units
  L: number; // spine length (neck -> rump), rig units
  wf: number; // torso half-width / L
  belly: number;
  armU: number; armF: number; armR: number; // x L
  legT: number; legS: number; legR: number; // x L
  handS: number; footS: number; // hand/foot shape scale
  curlBias: number; // degrees
  cramp: number; // degrees the thighs are pulled up (late weeks)
  translucency: number; vessels: number; pink: number; fat: number; eyeDark: number;
  wrinkle: number; lanugo: number; vernix: number;
  fingerSep: number; // 0 webbed paddle (9 wk) .. 1 separate digits (10.5 wk+)
  lidOpenable: number; // 0 fused lids .. 1 eyes may open (26-27 wk+)
  hair: number; // scalp hair hint (30 wk+)
  earRise: number; // 0 low-set ear (9 wk) .. 1 final position
};

export const growth = (weekIn: number): Growth => {
  const week = Math.max(MIN_WEEK, Math.min(MAX_WEEK, weekIn));
  const q = curve(week, HEAD_Q);
  const L = RIG_HEIGHT / (0.85 * q + 1.15);
  const headH = q * L;
  return {
    week,
    headH,
    L,
    wf: curve(week, WIDTH),
    belly: Math.max(0, curve(week, BELLY)),
    armU: curve(week, ARM_U), armF: curve(week, ARM_F), armR: curve(week, ARM_R),
    legT: curve(week, LEG_T), legS: curve(week, LEG_S), legR: curve(week, LEG_R),
    handS: curve(week, HAND) * L, footS: curve(week, FOOT) * L,
    curlBias: curve(week, CURL_BIAS),
    cramp: curve(week, CRAMP),
    translucency: curve01(week, TRANSLUCENT),
    vessels: curve01(week, VESSELS),
    pink: curve01(week, PINK),
    fat: curve01(week, FAT),
    eyeDark: curve01(week, EYE_DARK),
    wrinkle: curve01(week, WRINKLE),
    lanugo: curve01(week, LANUGO),
    vernix: curve01(week, VERNIX),
    fingerSep: smoothstep(9.2, 10.6, week),
    lidOpenable: smoothstep(25.5, 27, week),
    hair: smoothstep(29.5, 37, week),
    earRise: smoothstep(9, 22, week),
  };
};
