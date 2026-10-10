// Palette helpers (copied from the teaser's Scene2 so the cell lighting is
// identical to the one C03 continues from). Palette C colours only.
import { C } from "../../../theme/colors";

const parse = (c: string): number[] =>
  c.startsWith("#")
    ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
    : (c.match(/\d+/g) ?? ["0", "0", "0"]).slice(0, 3).map(Number);

// Palette colour b laid over palette colour a at alpha t, flattened.
export const mix = (a: string, b: string, t: number) => {
  const A = parse(a);
  const Bv = parse(b);
  const k = Math.max(0, Math.min(1, t));
  const c = A.map((v, i) => Math.round(v + (Bv[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

// alpha 0..1 -> two hex digits (for `${C.gold}${hex(a)}` CSS colours)
export const hex = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");

// Scene2's cell body stops (highlight -> core -> body -> edge), warmth 0
// (gold-white zygote) with its depth darkening `dark`.
export const cellStops = (dark: number): [number, string][] => {
  const hi = C.text;
  const core = mix(C.gold, C.text, 0.55);
  const body = C.gold;
  const shade = mix(C.gold, C.skinShade, 0.62);
  const deep = mix(C.skinShade, C.wombDeep, 0.55);
  const d = (c: string) => mix(c, deep, dark);
  return [
    [0, d(hi)],
    [0.3, d(core)],
    [0.6, d(body)],
    [0.86, d(shade)],
    [1, d(mix(shade, C.wombDeep, 0.25))],
  ];
};

// Scene2's root cell sits slightly back in its tumbling cluster: dark = 0.115.
export const ROOT_DARK = (1 - 0.794) * 0.56;
