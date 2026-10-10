import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { getLength } from "@remotion/paths";
import { CX } from "./timeline";
import { Pt, lerp } from "./geometry";

// Shapes of the endometrium, in tissue-local coords: x = screen x,
// y = 0 at the surface under the landing spot, growing downward.
export const X0 = -300;
export const X1 = 1380;
export const DEPTH = 1700;

// The wall curves up on both sides: the blastocyst lands in a soft valley.
export const cradle = (x: number) => -150 * ((x - CX) / 640) ** 2;

export type Wrap = { t: number; R: number; bx: number };

export const surfaceY = (x: number, f: number, w: Wrap) => {
  const calm = 1 - 0.85 * Math.exp(-(((x - CX) / 260) ** 2));
  const waves =
    13 * Math.sin(x / 140 + 0.7 + f * 0.012) +
    8 * Math.sin(x / 61 + 2.2 - f * 0.017) +
    14 * noise2D("s2-ts", x / 280, f * 0.006);
  const rel = (x - w.bx) / w.R;
  const lip = -w.t * w.R * 0.46 * Math.exp(-(((Math.abs(rel) - 1.04) / 0.46) ** 2));
  const dent = w.t * w.R * 0.12 * Math.max(0, 1 - rel * rel) ** 2;
  return cradle(x) + waves * calm + lip + dent;
};

export const surfacePts = (f: number, w: Wrap, step = 14): Pt[] => {
  const pts: Pt[] = [];
  for (let x = X0; x <= X1; x += step) pts.push([x, surfaceY(x, f, w)]);
  return pts;
};

const f1 = (v: number) => v.toFixed(1);

// Smooth open curve through points (quadratic midpoints).
export const smoothOpen = (pts: Pt[]) => {
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(mx)} ${f1(my)}`;
  }
  const l = pts[pts.length - 1];
  return `${d}L${f1(l[0])} ${f1(l[1])}`;
};

export const bodyPath = (pts: Pt[], depth = DEPTH) =>
  `${smoothOpen(pts)}L${X1} ${depth}L${X0} ${depth}Z`;

// Generic soft hump (for the far and near folds).
export const humpPts = (xc: number, w: number, h: number, base: number, f: number, seed: number) => {
  const pts: Pt[] = [];
  for (let x = X0; x <= X1; x += 24) {
    const u = (x - xc) / w;
    const y = base - h * Math.exp(-u * u) + 10 * Math.sin(x / 90 + seed + f * 0.01);
    pts.push([x, y]);
  }
  return pts;
};

// Spiral arteries rising toward the surface (static shapes, glints travel along).
const VX: [number, number][] = [
  [120, 200],
  [380, 455],
  [720, 625],
  [960, 890],
  [1200, 1140],
];
export const VESSELS = VX.map(([xa, xb], i) => {
  const pts: Pt[] = [];
  for (let k = 0; k <= 28; k++) {
    const t = k / 28;
    const y = lerp(330, cradle(xb) + 56, t);
    const x = lerp(xa, xb, t) + 24 * Math.sin(t * 15 + i * 1.7) * (1 - 0.5 * t);
    pts.push([x, y]);
  }
  const d = smoothOpen(pts);
  return { d, len: getLength(d), near: Math.abs(xb - CX) < 140, top: pts[pts.length - 1] };
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

// Soft internal volumes so the wall reads as thick, layered flesh.
export const LOBES = Array.from({ length: 7 }, (_, i) => {
  const x = X0 + 120 + (i / 6) * (X1 - X0 - 240) + (random(`lb-x${i}`) - 0.5) * 120;
  return { x, y: cradle(x) + 150 + random(`lb-y${i}`) * 200, rx: 200 + random(`lb-r${i}`) * 120, ry: 90 + random(`lb-q${i}`) * 50 };
});

// Stroma: scattered soft cells inside the wall.
export const STROMA = Array.from({ length: 70 }, (_, i) => {
  const x = X0 + 80 + random(`st-x${i}`) * (X1 - X0 - 160);
  const y = cradle(x) + 70 + random(`st-y${i}`) ** 1.3 * 760;
  return {
    x,
    y,
    rx: 7 + random(`st-r${i}`) * 13,
    ry: 5 + random(`st-q${i}`) * 7,
    rot: (random(`st-a${i}`) - 0.5) * 50,
    light: random(`st-l${i}`) > 0.72,
  };
});

// Uterine glands: tubes opening on the surface.
export const GLAND_X = [40, 255, 820, 1035, 1260];
export const glandPath = (x: number, f: number, w: Wrap, i: number) => {
  const pts: Pt[] = [];
  const s = surfaceY(x, f, w);
  const L = 120 + 40 * (i % 2);
  for (let k = 0; k <= 10; k++) {
    const t = k / 10;
    pts.push([x + 16 * Math.sin(t * 4 + i) * t, s + 8 + t * L]);
  }
  return smoothOpen(pts);
};
