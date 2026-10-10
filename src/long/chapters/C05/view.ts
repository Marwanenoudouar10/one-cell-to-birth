// Everything that moves in C05, derived from BEATS (never from raw frames).
// The hand-drawn disc is a pseudo-3D slab seen from elevation `phi`
// (90 = straight down, 0 = edge-on). Three key states are blended:
//   A  dorsal 3/4 view (start), S  side cut (layers stacked), K  matches the
//   embryo kit's week-3.3 disc at C06's start placement (size 300 at 540,860).
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { yolkSuggest } from "../../../shared/embryo";
import { BEATS as B, DURATION, END_ZOOM, HANDOFF } from "./beats";

export type Pt = { x: number; y: number };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const smooth = (t: number) => {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
};

export const KIT_SIZE = 300; // C06 starts on the kit embryo at size 300
export const PLACE = { x: 540, y: 860 }; // ... centred in the hero box
export const KIT_FROM = 3.3; // kit week at the swap (streak still showing, plate faint)
export const KIT_TO = 4.0; // END: neural folds + groove, zip 0

// H = amnion bubble height; R, dz = yolk-sac sphere radius and its centre's depth
// below the disc's bottom face (negative: above it, so only a bowl shows).
type Key = { phi: number; A: number; B: number; T: number; cy: number; H: number; R: number; dz: number };
const KA: Key = { phi: 31, A: 226, B: 176, T: 64, cy: 820, H: 262, R: 236, dz: 104 };
// side cut: the slab's round ends stay inside the frame, so it reads as a cut disc
// (not stripes running off-screen); the yolk sac meets its underside near the rim
const KS: Key = { phi: 4, A: 500, B: 200, T: 224, cy: 850, H: 330, R: 470, dz: -125 };
const KK: Key = { phi: 30, A: 146, B: 132, T: 22, cy: 860, H: 150, R: 84, dz: 176 };

const mixKey = (a: Key, b: Key, t: number): Key => {
  const o = { ...a };
  for (const k of Object.keys(a) as (keyof Key)[]) o[k] = lerp(a[k], b[k], t);
  return o;
};

// 0..1 progress of the tilt down to the side cut, and of the tilt back up.
export const tiltAt = (f: number) => tween(f, B.tiltStart, B.tiltEnd, [0, 1], EASE.inOut);
export const backAt = (f: number) => tween(f, B.release, B.swap + 4, [0, 1], EASE.inOut);

// Motion blur while the view swoops down to the side cut and back out (hides the swap).
export const swoopBlurAt = (f: number) => 3 * Math.sin(Math.PI * tiltAt(f)) + 5.5 * Math.sin(Math.PI * backAt(f));

// Mesoderm spread from the streak (0 none .. 1 everywhere).
export const mesoAt = (f: number) => tween(f, B.mesoIn - 4, B.pourEnd + 4, [0, 1], EASE.inOut);

// Gentle float of the whole diagram; dies away so the END is exactly placed.
export const floatAt = (f: number) => {
  const t = f * 0.011;
  const calm = 1 - tween(f, B.release, B.settle - 6, [0, 1], EASE.inOut);
  return { dx: noise2D("c05fx", t, 0) * 5 * calm, dy: noise2D("c05fy", 0, t) * 6 * calm };
};

export type View = Key & {
  cx: number;
  side: number; // 0 dorsal look .. 1 side cut (cells, slab ends)
  meso: number;
};

export const viewAt = (f: number): View => {
  const tilt = tiltAt(f);
  const back = backAt(f);
  const k = mixKey(mixKey(KA, KS, tilt), KK, back);
  const fl = floatAt(f);
  return { ...k, cx: PLACE.x + fl.dx, cy: k.cy + fl.dy, side: tilt * (1 - back), meso: mesoAt(f) };
};

// Kit week after the swap; kit / hand-drawn disc visibility.
export const kitWeekAt = (f: number) => tween(f, B.stretchStart, B.settle, [KIT_FROM, KIT_TO], EASE.inOut);
export const kitInAt = (f: number) => tween(f, B.swap - 4, B.swap + 3, [0, 1], EASE.inOut);
export const discOutAt = (f: number) => tween(f, B.swap + 2, B.swap + 7, [1, 0]);

// The kit embryo's wobble clock runs on C06's clock so the fade hand-off matches.
export const kitClock = (f: number) => f - HANDOFF;

// Yolk sac: tucked under the hand-drawn disc, then exactly where the kit wants it.
export const yolkAt = (f: number, v: View) => {
  const kw = kitWeekAt(f);
  const kit = yolkSuggest(kw, KIT_SIZE, PLACE);
  const c = Math.cos((v.phi * Math.PI) / 180);
  const own = { x: v.cx, y: v.cy + (v.T / 2 + v.dz) * c, r: v.R };
  const swapT = tween(f, B.swap - 8, B.swap, [0, 1], EASE.inOut);
  // where the sphere meets the disc's bottom face (it is cut away above it)
  const rc = Math.sqrt(Math.max(0, v.R * v.R - v.dz * v.dz)) * (1 - swapT);
  const cut = { x: v.cx, y: v.cy + (v.T / 2) * c - 2, rx: rc, ry: rc * Math.sin((v.phi * Math.PI) / 180) };
  return { x: lerp(own.x, kit.x, swapT), y: lerp(own.y, kit.y, swapT), r: lerp(own.r, kit.r, swapT), stalk: kit.stalk, kw, cut, swapT };
};

// Germ-layer glow (layer 0 endo, 1 meso, 2 ecto) and the dimming of the others.
// The endoderm keeps glowing on the kit (its rim + the yolk sac it lines) and
// fades with the other outgoing lights over the hand-off.
const on = (f: number, at: number) => tween(f, at - 3, at + 9, [0, 1], EASE.inOut);
const off = (f: number, at: number) => tween(f, at - 2, at + 10, [1, 0], EASE.inOut);
export const endFade = (f: number) => tween(f, HANDOFF, DURATION - 1, [1, 0]);
export const glowAt = (f: number): [number, number, number] => [
  on(f, B.endoGlow) * endFade(f),
  on(f, B.mesoGlow) * off(f, B.endoGlow),
  on(f, B.ectoGlow) * off(f, B.mesoGlow),
];
// the "which layer is speaking" dimming only lives in the side cut
export const glowPhaseAt = (f: number) => on(f, B.ectoGlow) * off(f, B.release + 4);

// Camera: a slow push onto the disc's face for the streak, eased back so the
// side cut fits, a creep through the three lines, then the push onto the kit
// embryo for the END framing (END_ZOOM, drift 0) that C06 starts from.
export const cameraAt = (f: number) => {
  const pre = 1 + tween(f, 0, B.tiltStart, [0, 0.1], EASE.inOut) - tween(f, B.tiltStart, B.tiltEnd + 6, [0, 0.1], EASE.inOut);
  const creep = tween(f, B.tiltEnd, B.release, [0, 0.035], EASE.inOut);
  const back = tween(f, B.release, B.settle, [0, 1], EASE.inOut);
  return { zoom: lerp(pre + creep, END_ZOOM, back), drift: 1 - back };
};

// Womb world: warm at first (out of C04's rose close-up), then C06's start look.
export const worldAt = (f: number) => ({
  warmth: tween(f, 0, B.tiltEnd, [0.38, 0.12], EASE.inOut),
  folds: tween(f, B.release, B.settle, [0.05, 0.18], EASE.inOut),
  opacity: tween(f, 0, B.tiltEnd, [0.72, 0.55], EASE.inOut) - tween(f, B.release, B.settle, [0, 0.2], EASE.inOut),
  specks: 1 - tween(f, B.release, B.settle, [0, 1], EASE.inOut),
});
