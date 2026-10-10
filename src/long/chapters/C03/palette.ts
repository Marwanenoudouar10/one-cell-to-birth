import { C } from "../../../theme/colors";

// Palette colours only. mix(a, b, t) is exactly palette colour b laid over
// palette colour a at alpha t, flattened so it can live in a gradient stop.
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

// Cell body stops (highlight -> core -> body -> edge) for a given warmth
// (0 = gold-white zygote, 1 = rose-lit blastocyst) and depth darkening.
const smooth01 = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
};

export const cellStops = (warm: number, dark: number): [number, string][] => {
  const hi = mix(C.text, C.peach, 0.2 * warm);
  const core = mix(mix(C.gold, C.text, 0.55), C.peach, 0.45 * warm);
  const body = mix(C.gold, C.peach, 0.7 * warm);
  const shade = mix(mix(C.gold, C.skinShade, 0.62), mix(C.rose, C.womb, 0.35), 0.6 * warm);
  // Depth darkens toward a warm shadow (never toward the plum background,
  // which turned gold cells a muddy olive).
  const deep = mix(C.skinShade, C.wombDeep, 0.55);
  const d = (c: string) => mix(c, deep, dark);
  // Cells deep in the cluster: their highlight sinks toward a warm amber,
  // not toward plum (white + plum read as dusty grey). Exactly unchanged at
  // the zygote's own depth (0.115), so C02's handoff still matches.
  const warmHi = mix(mix(hi, mix(C.gold, C.skinShade, 0.45), 0.85), deep, dark * 0.55);
  const hiD = mix(d(hi), warmHi, smooth01((dark - 0.12) / 0.2));
  return [
    [0, hiD],
    [0.3, d(core)],
    [0.6, d(body)],
    [0.86, d(shade)],
    [1, d(mix(shade, C.wombDeep, 0.25))],
  ];
};
