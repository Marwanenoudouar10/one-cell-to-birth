// Ghost glyph artwork, each in a 200 x 200 box centred on (0, 0). No text.
//   fill  solid body, filled with the layer's soft gradient
//   tube  solid body drawn as a thick round stroke (vessels, coils)
//   line  light detail (highlight / fold), `deep` = darker groove
import type { GhostKind } from "./beats";

export type Part = { d: string; kind: "fill" | "tube" | "line" | "deep"; w?: number; o?: number };
export type Glyph = { rot: number; scale: number; parts: Part[] };

const circ = (cx: number, cy: number, r: number, ry = r) =>
  `M${cx - r},${cy} a${r},${ry} 0 1,0 ${2 * r},0 a${r},${ry} 0 1,0 ${-2 * r},0 Z`;

// Fingerprint ridges: open elliptical loops around a slightly low core, each with
// its own gap, tilt and squash (never uniform rings), plus the arches below.
const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number) => {
  const p = (a: number) => `${(cx + rx * Math.cos(a)).toFixed(1)},${(cy + ry * Math.sin(a)).toFixed(1)}`;
  const n = 18;
  let d = `M${p(a0)}`;
  for (let i = 1; i <= n; i++) d += ` L${p(a0 + ((a1 - a0) * i) / n)}`;
  return d;
};
const RING = [
  { r: 10, g: 2.2, s: 1.36 },
  { r: 21, g: 4.1, s: 1.3 },
  { r: 32, g: 0.9, s: 1.26 },
  { r: 43, g: 3.0, s: 1.22 },
  { r: 53, g: 5.2, s: 1.18 },
];
const WHORL: Part[] = [
  ...RING.map((q, i) => ({
    kind: "deep" as const,
    w: 5.5,
    o: 0.5,
    d: arc(i * 1.2 - 2, 8 - i * 1.5, q.r, q.r * q.s, q.g + 0.55, q.g + 2 * Math.PI - 0.55),
  })),
  { kind: "deep", w: 5.5, o: 0.45, d: "M-54,70 C-30,54 30,52 56,68" },
  { kind: "deep", w: 5, o: 0.4, d: "M-50,88 C-24,76 24,76 52,88" },
];

export const GLYPHS: Record<GhostKind, Glyph> = {
  brain: {
    rot: 0,
    scale: 1,
    parts: [
      { kind: "fill", d: "M-80,6 C-86,-34 -58,-72 -16,-78 C24,-84 66,-66 80,-32 C92,-4 82,26 60,36 C42,44 22,40 6,46 C-12,52 -36,50 -52,42 C-70,34 -78,24 -80,6 Z" },
      { kind: "fill", d: "M-66,48 C-66,34 -50,28 -36,30 C-20,32 -8,40 -10,52 C-12,64 -28,70 -42,68 C-56,66 -66,60 -66,48 Z" },
      { kind: "fill", d: "M0,40 C2,58 6,72 10,88 L26,86 C22,70 20,56 22,38 Z" },
      { kind: "line", w: 5, o: 0.55, d: "M-60,-30 C-44,-48 -22,-46 -10,-60" },
      { kind: "line", w: 5, o: 0.55, d: "M4,-64 C22,-60 34,-64 50,-50" },
      { kind: "line", w: 5, o: 0.5, d: "M-66,-2 C-50,-16 -34,-6 -18,-20 C-4,-32 14,-24 24,-36" },
      { kind: "line", w: 5, o: 0.5, d: "M40,-26 C54,-24 62,-10 70,-4" },
      { kind: "deep", w: 5, o: 0.45, d: "M-14,16 C6,4 30,10 54,18" },
      { kind: "line", w: 4, o: 0.45, d: "M-50,22 C-36,12 -24,24 -10,20" },
      { kind: "deep", w: 3.5, o: 0.4, d: "M-60,50 C-48,44 -30,44 -16,50" },
      { kind: "deep", w: 3.5, o: 0.35, d: "M-56,60 C-44,56 -30,56 -20,60" },
    ],
  },
  // a fingertip (round tip, straight sides, the first joint's crease) with its whorl
  // of ridges: skin (and C10's fingerprints). Never a closed oval: that reads as an eye.
  skin: {
    rot: -16,
    scale: 0.96,
    parts: [
      { kind: "fill", d: "M-64,112 C-66,70 -66,30 -66,-14 C-66,-66 -36,-100 2,-100 C40,-100 68,-66 68,-14 C68,30 68,70 66,112 C30,104 -30,104 -64,112 Z" },
      ...WHORL,
      { kind: "deep", w: 6, o: 0.5, d: "M-64,100 C-30,92 30,92 66,100" },
      { kind: "line", w: 5, o: 0.5, d: "M-46,-70 C-32,-86 -14,-92 6,-92" },
    ],
  },
  heart: {
    rot: -14,
    scale: 0.96,
    parts: [
      { kind: "tube", w: 20, d: "M-2,-36 C-6,-66 10,-86 32,-84 C50,-82 58,-66 56,-48" },
      { kind: "tube", w: 7, d: "M14,-82 L12,-98 M28,-86 L30,-100 M42,-80 L48,-94" },
      { kind: "tube", w: 15, d: "M-34,-26 L-38,-78" },
      { kind: "fill", d: "M-46,-20 C-62,0 -58,34 -36,58 C-20,76 -2,88 10,90 C18,88 30,70 44,50 C60,26 66,0 56,-20 C46,-38 20,-44 0,-40 C-20,-38 -36,-34 -46,-20 Z" },
      { kind: "tube", w: 16, d: "M20,-34 C24,-52 14,-66 -6,-72" },
      { kind: "deep", w: 4, o: 0.45, d: "M-44,-4 C-16,6 14,4 54,-10" },
      { kind: "line", w: 4, o: 0.5, d: "M10,-14 C2,16 4,50 10,84" },
      { kind: "line", w: 5, o: 0.5, d: "M-40,4 C-44,22 -36,40 -24,54" },
    ],
  },
  // a long bone: knobbly ends of different sizes (head + trochanter, two condyles)
  bone: {
    rot: -32,
    scale: 1.02,
    parts: [
      { kind: "fill", d: "M-56,-12 C-20,-8 20,-8 58,-12 L62,12 C20,8 -20,8 -58,12 Z" },
      { kind: "fill", d: circ(80, -16, 19) + circ(62, 11, 13) + circ(-70, -14, 17) + circ(-74, 14, 19, 18) },
      { kind: "deep", w: 4, o: 0.4, d: "M-88,0 C-80,2 -72,1 -64,-1" },
      { kind: "deep", w: 3.5, o: 0.35, d: "M66,-2 C70,-6 72,-10 70,-16" },
      { kind: "line", w: 4, o: 0.55, d: "M-46,-6 C-14,-3 18,-3 50,-6" },
      { kind: "line", w: 3.5, o: 0.5, d: "M70,-28 C76,-34 86,-34 92,-28 M-80,-24 C-74,-30 -64,-30 -58,-26" },
    ],
  },
  lungs: {
    rot: 0,
    scale: 1,
    parts: [
      { kind: "fill", d: "M-9,-94 L9,-94 L9,-42 L-9,-42 Z" },
      { kind: "tube", w: 12, d: "M0,-46 C-8,-32 -22,-26 -34,-22 M0,-46 C8,-32 22,-26 34,-22" },
      { kind: "fill", d: "M-16,-28 C-44,-38 -76,-8 -80,30 C-84,64 -66,88 -42,86 C-24,84 -12,72 -10,52 C-8,22 -6,-8 -16,-28 Z" },
      { kind: "fill", d: "M16,-28 C44,-38 76,-8 80,30 C84,64 66,88 42,86 C30,85 22,78 24,64 C26,54 16,50 14,40 C12,22 8,-8 16,-28 Z" },
      { kind: "line", w: 3.5, o: 0.55, d: "M-30,-20 C-42,-4 -48,16 -52,38 M-44,2 C-56,10 -62,20 -66,32 M-49,26 C-40,38 -36,52 -34,64" },
      { kind: "line", w: 3.5, o: 0.55, d: "M30,-20 C42,-4 48,16 52,38 M44,2 C56,10 62,20 66,32 M49,26 C40,38 36,52 34,64" },
      { kind: "deep", w: 3, o: 0.35, d: "M-9,-82 L9,-82 M-9,-70 L9,-70 M-9,-58 L9,-58" },
    ],
  },
  // stomach on top, the large intestine framing the coiled small intestine
  gut: {
    rot: 0,
    scale: 1,
    parts: [
      { kind: "tube", w: 11, d: "M22,-98 C22,-88 18,-82 12,-76" },
      { kind: "fill", d: "M14,-80 C30,-82 44,-72 44,-58 C44,-44 30,-38 14,-42 C2,-45 -10,-52 -24,-50 C-40,-48 -48,-60 -42,-70 C-36,-80 -18,-78 -6,-78 C2,-78 8,-79 14,-80 Z" },
      { kind: "tube", w: 18, d: "M-54,88 C-62,62 -66,22 -60,-6 C-56,-24 -42,-30 -22,-30 L26,-30 C48,-30 62,-22 64,-2 C67,26 64,62 56,86" },
      { kind: "tube", w: 12, d: "M30,-12 C10,-20 -22,-18 -32,-6 C-40,8 -14,12 -4,6 C8,0 30,-2 34,12 C38,26 16,30 2,26 C-12,22 -38,24 -36,40 C-34,56 -8,52 4,46 C18,40 38,42 36,58 C34,72 8,74 -12,68" },
      { kind: "deep", w: 3.5, o: 0.4, d: "M-70,60 L-52,57 M-74,24 L-56,24 M-68,-12 L-52,-6 M-34,-40 L-32,-22 M8,-40 L8,-22 M54,-26 L46,-12 M72,18 L56,18 M70,56 L54,54" },
      { kind: "line", w: 3.5, o: 0.55, d: "M-58,62 C-62,34 -64,6 -56,-14 M-30,-25 L20,-25 M24,-8 C6,-15 -18,-14 -26,-5 M28,16 C22,25 10,26 0,22" },
      { kind: "line", w: 3.5, o: 0.5, d: "M-30,-66 C-20,-72 -2,-72 12,-74" },
    ],
  },
};
