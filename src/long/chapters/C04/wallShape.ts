import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { getLength } from "@remotion/paths";
import { CX, P_STICK, WALL, Y_BURIED } from "./timeline";
import { Pt, lerp, smin, smooth, smoothOpen } from "./geometry";

// Shapes of the endometrium (womb lining), in WORLD px: the surface sits at
// y = WALL under the landing spot and the flesh grows downward (cut-away view,
// adapted from the teaser's Scene2). The implanting ball is wrapped by a
// "blanket" of lining that climbs its sides and closes over its top.
export const X0 = -360;
export const X1 = 1440;
export const DEPTH = WALL + 1400;

// The wall curves up on both sides: the ball lands in a soft valley.
export const cradle = (x: number) => -150 * ((x - CX) / 640) ** 2;

export const baseY = (x: number, f: number) => {
  const calm = 1 - 0.85 * Math.exp(-(((x - CX) / 300) ** 2));
  const waves =
    13 * Math.sin(x / 140 + 0.7 + f * 0.012) + 8 * Math.sin(x / 61 + 2.2 - f * 0.017) + 14 * noise2D("c04-ts", x / 280, f * 0.006);
  return WALL + cradle(x) + waves * calm;
};

// x, y: ball centre; r: ball outer radius; tau: blanket thickness;
// cover: covered angle from the bottom pole (0 = none, PI = closed on top).
export type Ball = { x: number; y: number; r: number; tau: number; cover: number };

const blanketSdf = (b: Ball, x: number, y: number) => {
  const dx = x - b.x;
  const dy = y - b.y;
  const rm = b.r + b.tau / 2;
  const psi = Math.atan2(Math.abs(dx), dy); // 0 = bottom pole, PI = top
  if (psi <= b.cover) return Math.abs(Math.hypot(dx, dy) - rm) - b.tau / 2;
  // Rounded lip at the tip of the blanket.
  const tx = b.x + (dx < 0 ? -1 : 1) * rm * Math.sin(b.cover);
  const ty = b.y + rm * Math.cos(b.cover);
  return Math.hypot(x - tx, y - ty) - b.tau / 2;
};

// Topmost tissue y at x: the lining (base) smoothly united with the blanket.
export const surfaceAt = (x: number, f: number, b: Ball | null, base = baseY(x, f)) => {
  if (!b || b.cover <= 0.01 || Math.abs(x - b.x) > b.r + b.tau + 120) return base;
  const K = 84; // wide fillet: the lining slopes up around the ball
  const sdf = (y: number) => smin(base - y, blanketSdf(b, x, y), K);
  let y = Math.min(base, b.y - b.r - b.tau) - 40 - K / 4;
  let prev = y;
  for (let i = 0; i < 140 && y < base + 2; i++) {
    if (sdf(y) < 0) break;
    prev = y;
    y += 6;
  }
  let lo = prev;
  let hi = y;
  for (let k = 0; k < 7; k++) {
    const m = (lo + hi) / 2;
    if (sdf(m) < 0) hi = m;
    else lo = m;
  }
  return Math.min((lo + hi) / 2, base);
};

// The line joining the blanket's two lips (a soft sag until they meet on
// top). Below it the ball is inside the lining: the Veil tints it and the wall
// body behind it is filled up to this line (no empty pit behind the ball).
export const lipChord = (b: Ball) => {
  const rm = b.r + b.tau / 2;
  const tipX = rm * Math.sin(b.cover);
  const tipY = b.y + rm * Math.cos(b.cover);
  const closed = smooth((b.cover - (Math.PI - 0.32)) / 0.32);
  return { tipX, tipY, sag: tipX * 0.16 * (1 - closed), closed };
};
export const chordY = (b: Ball, x: number) => {
  const { tipX, tipY, sag } = lipChord(b);
  if (b.cover <= 0.01 || tipX < 1 || Math.abs(x - b.x) >= tipX) return Infinity;
  const t = (x - b.x + tipX) / (2 * tipX);
  return tipY + 4 * sag * t * (1 - t);
};

export const surfacePts = (f: number, b: Ball | null, step = 12, x0 = X0, x1 = X1): Pt[] => {
  const pts: Pt[] = [];
  for (let x = x0; x <= x1; x += step) pts.push([x, surfaceAt(x, f, b)]);
  return pts;
};

export const bodyPath = (pts: Pt[], depth = DEPTH) => `${smoothOpen(pts)}L${X1} ${depth}L${X0} ${depth}Z`;

// Generic soft hump (far and near folds).
export const humpPts = (xc: number, w: number, h: number, base: number, f: number, seed: number) => {
  const pts: Pt[] = [];
  for (let x = X0; x <= X1; x += 24) {
    const u = (x - xc) / w;
    pts.push([x, base - h * Math.exp(-u * u) + 10 * Math.sin(x / 90 + seed + f * 0.01)]);
  }
  return pts;
};

const f1 = (v: number) => v.toFixed(1);

// Spiral arteries rising toward the surface: [x deep, x top, top depth under WALL].
const VX: [number, number, number][] = [
  [40, 150, 70],
  [250, 372, 372],
  [880, 790, 350],
  [1010, 980, 60],
  [1270, 1230, 50],
];
export const VESSELS = VX.map(([xa, xb, top], i) => {
  const pts: Pt[] = [];
  for (let k = 0; k <= 28; k++) {
    const t = k / 28;
    const y = lerp(WALL + 820, WALL + cradle(xb) + top, t);
    const x = lerp(xa, xb, t) + 24 * Math.sin(t * 15 + i * 1.7) * (1 - 0.5 * t);
    pts.push([x, y]);
  }
  const d = smoothOpen(pts);
  return { d, len: getLength(d), pts, top: pts[pts.length - 1] };
});

// Capillary twigs at the top of each artery.
export const TWIGS = VESSELS.map((v, i) => {
  const [x, y] = v.top;
  const s = i % 2 ? 1 : -1;
  return [
    `M${f1(x)} ${f1(y)}Q${f1(x + 26 * s)} ${f1(y - 10)} ${f1(x + 44 * s)} ${f1(y - 30)}`,
    `M${f1(x)} ${f1(y)}Q${f1(x - 18 * s)} ${f1(y - 16)} ${f1(x - 24 * s)} ${f1(y - 40)}`,
  ];
});

// The vessel the message leaves by: from under the ball, away to the right.
const MV: Pt[] = [
  [520, WALL + 412],
  [600, WALL + 396],
  [720, WALL + 408],
  [880, WALL + 432],
  [1060, WALL + 440],
  [1240, WALL + 452],
  [1460, WALL + 462],
];
export const MAIN = (() => {
  const d = smoothOpen(MV);
  return { d, len: getLength(d), entry: MV[1] };
})();

// Root-like threads of the outer cells: a few tapered, branching roots from
// the side that faces deeper into the wall, each reaching a vessel (index
// into VESSELS, or -1 = the vessel the message leaves by). Asymmetric on
// purpose: never an even fan of "legs".
export const ROOTS: { a: number; to: Pt; vessel: number; w: number }[] = [
  { a: 124, to: VESSELS[1].top, vessel: 1, w: 9 },
  { a: 88, to: MV[1], vessel: -1, w: 11 },
  { a: 52, to: VESSELS[2].top, vessel: 2, w: 8 },
  { a: 152, to: [P_STICK[0] - 250, Y_BURIED + 120], vessel: -2, w: 5 },
  { a: 22, to: [P_STICK[0] + 240, Y_BURIED + 110], vessel: -2, w: 4.5 },
];

// Soft internal volumes so the wall reads as thick, layered flesh.
export const LOBES = Array.from({ length: 7 }, (_, i) => {
  const x = X0 + 120 + (i / 6) * (X1 - X0 - 240) + (random(`c04lb-x${i}`) - 0.5) * 120;
  return { x, y: WALL + cradle(x) + 170 + random(`c04lb-y${i}`) * 240, rx: 200 + random(`c04lb-r${i}`) * 120, ry: 90 + random(`c04lb-q${i}`) * 50 };
});

// Stroma: scattered soft cells inside the wall.
export const STROMA = Array.from({ length: 80 }, (_, i) => {
  const x = X0 + 80 + random(`c04st-x${i}`) * (X1 - X0 - 160);
  const y = WALL + cradle(x) + 70 + random(`c04st-y${i}`) ** 1.3 * 860;
  return {
    x,
    y,
    rx: 7 + random(`c04st-r${i}`) * 13,
    ry: 5 + random(`c04st-q${i}`) * 7,
    rot: (random(`c04st-a${i}`) - 0.5) * 50,
    light: random(`c04st-l${i}`) > 0.72,
  };
});

// Uterine glands: tubes opening on the surface.
export const GLAND_X = [20, 236, 870, 1060, 1290];
export const glandPath = (x: number, f: number, i: number) => {
  const pts: Pt[] = [];
  const s = baseY(x, f);
  const L = 130 + 40 * (i % 2);
  for (let k = 0; k <= 10; k++) {
    const t = k / 10;
    pts.push([x + 16 * Math.sin(t * 4 + i) * t, s + 8 + t * L]);
  }
  return smoothOpen(pts);
};
