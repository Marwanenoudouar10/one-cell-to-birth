import { C } from "../../../theme/colors";

// Egg-plane world units (Scene1's). The camera zoom at the END is 1.5, so the
// zygote core lands at radius 150 px and the zona ring at ~175 px.
export const R = 100; // egg core (oocyte) radius
export const ZONA = R * 1.17; // outer edge of the zona pellucida
export const HEAD = (2 * R) / 20; // sperm head length: egg diameter ~ 20 heads

// Where the winning sperm meets the zona (angle in screen space, y down).
export const CONTACT_ANGLE = (118 * Math.PI) / 180;
export const CDIR = { x: Math.cos(CONTACT_ANGLE), y: Math.sin(CONTACT_ANGLE) };

// Zona reaction ring speed, world units per frame.
export const RING_V = 13;

// Swarm depth layers: far = tiny, dim, blurred; mid = the egg plane; near = big.
export type LayerId = "far" | "mid" | "near";
export const LAYER = {
  far: { p: 0.55, size: HEAD * 0.5, thick: 2.2, alpha: 0.58, glow: 0.35 },
  mid: { p: 1, size: HEAD, thick: 1.6, alpha: 0.92, glow: 0.65 },
  near: { p: 1.7, size: HEAD * 2.1, thick: 1.1, alpha: 1, glow: 0.5 },
} as const;

// alpha 0..1 -> two hex digits
export const hex = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");

// Mix two #rrggbb colours -> #rrggbb (so an alpha suffix can be appended;
// interpolateColors returns rgba(), which cannot take one).
export const mixHex = (a: string, b: string, t: number) => {
  const k = Math.max(0, Math.min(1, t));
  const ch = (s: string, i: number) => parseInt(s.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `#${[0, 1, 2].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * k).toString(16).padStart(2, "0")).join("")}`;
};

// Art fades to a whisper through the caption band (y 1300-1560): CSS mask
// (only the alpha of the mask colour matters).
const BG0 = C.bg0;
export const CAPTION_MASK = `linear-gradient(180deg, ${BG0} 0px, ${BG0} 1150px, ${BG0}5c 1290px, ${BG0}5c 1570px, ${BG0}b3 1720px)`;
export const captionMask = { WebkitMaskImage: CAPTION_MASK, maskImage: CAPTION_MASK } as const;
