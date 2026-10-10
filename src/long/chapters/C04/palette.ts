import { C } from "../../../theme/colors";

// Palette colours only. mix(a, b, t) is palette colour b laid over palette
// colour a at alpha t, flattened so it can live in a gradient stop.
const parse = (c: string): number[] =>
  c.startsWith("#")
    ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
    : (c.match(/\d+/g) ?? ["0", "0", "0"]).slice(0, 3).map(Number);

export const mix = (a: string, b: string, t: number) => {
  const A = parse(a);
  const Bv = parse(b);
  const k = Math.max(0, Math.min(1, t));
  const c = A.map((v, i) => Math.round(v + (Bv[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

type Stops = [string, string, string, string, string]; // highlight, core, body, shade, edge

// The morula's warm gold cells (Scene2's morula look at warmth 0).
const GOLD: Stops = [
  C.text,
  mix(C.gold, C.text, 0.55),
  C.gold,
  mix(C.gold, C.skinShade, 0.62),
  mix(mix(C.gold, C.skinShade, 0.62), C.wombDeep, 0.25),
];
// Outer shell: thin, rose-plum.
const SHELL: Stops = [
  mix(C.text, C.peach, 0.45),
  mix(C.peach, C.rose, 0.55),
  mix(C.rose, C.womb, 0.45),
  mix(C.womb, C.wombDeep, 0.45),
  mix(C.wombDeep, C.bg2, 0.35),
];
// Inner knot: bright gold.
const KNOT: Stops = [
  C.text,
  mix(C.gold, C.text, 0.6),
  mix(C.gold, C.text, 0.12),
  mix(C.gold, C.peach, 0.55),
  mix(C.peach, C.skinShade, 0.6),
];

const OFFS = [0, 0.3, 0.6, 0.86, 1];

const smooth01 = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
};

// Cell body stops for a cell of a given kind, tint progress and depth
// darkening. At tint 0 this is exactly C03's morula (including its warm
// amber highlight on deep cells, which never sinks to a dusty grey).
export const cellStops = (ring: boolean, tint: number, dark: number): [number, string][] => {
  const target = ring ? SHELL : KNOT;
  const deep = mix(C.skinShade, C.wombDeep, 0.55);
  const d = (c: string) => mix(c, deep, dark);
  const warmHi = mix(mix(GOLD[0], mix(C.gold, C.skinShade, 0.45), 0.85), deep, dark * 0.55);
  const goldHi = mix(d(GOLD[0]), warmHi, smooth01((dark - 0.12) / 0.2));
  return OFFS.map((o, i) => [o, mix(i === 0 ? goldHi : d(GOLD[i]), d(target[i]), tint)]);
};
