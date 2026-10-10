// START handoff from C07 (enters by fade). C07's END contract as numbers and formulas,
// copied from src/long/chapters/C07/beats.ts "END contract for C08" (+ its end.ts, which
// recomputes them from C07's live functions; C08 must not import C07). Re-sync = edit the
// C07 table below. Our frame 0 = C07's frame C07_AT.
// fade() keeps C07 opaque underneath while we fade in over our frames 0-14, and C07
// fades its translucent world (halo, specks, sac, backdrop) 1 -> 0 under us: so for
// those frames we draw C07's END world at FULL strength, on C07's own clocks.
import { Easing } from "remotion";
import { yolkSuggest } from "../../../shared/embryo";

// ---- C07's own beat frames (C07-local), from its beats.ts
const C07 = { duration: 246, exit: 231, fadeEnd: 15, firstMove: 85, pullBack: 148, wide: 182, pushIn: 212 } as const;
export const C07_AT = C07.exit; // C07 frame that is our frame 0
const C06_OFFSET = 240; // C07 runs C06's noise clocks as f + 240
const C06_BEAT0 = C06_OFFSET - 93; // C07's beat clock at its frame 0

// ---- camera: kit <Camera>, drift 0. WIDE shot, then a slow quad-in push toward PUSH.
// f231: zoom 0.6399, aim (537.02, 881.90); f245: 0.68, (531.02, 877.68)
const WIDE = { zoom: 0.62, x: 540, y: 884 };
const PUSH = { x: 486, y: 846 };
const PUSH_LEN = 60;
export const c07Camera = (f: number) => {
  const u = Math.max(0, (f + C07_AT - C07.pushIn) / PUSH_LEN);
  const push = Easing.in(Easing.quad)(Math.min(1, u)) + Math.max(0, u - 1) * 2;
  const k = Math.min(1, 0.55 * push);
  return { zoom: WIDE.zoom * (1 + 0.32 * push), x: WIDE.x + (PUSH.x - WIDE.x) * k, y: WIDE.y + (PUSH.y - WIDE.y) * k };
};

// ---- embryo (C07's BendEmbryo at rest = the kit's own embryo, its parts)
export const EMB0 = {
  week: 7.0, // C07 kitWeek(231) = 6.85 + 0.15, headWeek back to 7.0
  size: 350, // C07 SIZE_END
  x: 472.45,
  y: 835.3, // float 0 at the END
  wobbleSeed: "emb-c05", // body wobble noise seed, alive 1
  wobbleAt: C06_OFFSET + C07_AT, // wobble clock = our frame + this
  glowAdd: 0.2, // C07 feeds heartGlow = glow + 0.2
} as const;

// ---- heart: C07's warped beat clock (110/min at its frame 0, rate x(1 + 0.14 f/246))
const RATE = 0.14 / C07.duration;
export const c07BeatClock = (f: number) => {
  const g = f + C07_AT;
  return C06_BEAT0 + g + (RATE * g * g) / 2;
};
export const c07BeatRate = (f: number) => 1 + RATE * (f + C07_AT); // clock speed (x110/min): ~1.13 at our 0

// ---- world clocks
// sac: C07 slowClock(f, pullBack - 20, wide, 0.35) + 240 -> past `wide` it runs at 0.35/frame
const SAC_A = C07.pullBack - 20;
const SAC_L = C07.wide - SAC_A;
export const sacClock0 = C06_OFFSET + SAC_A + (SAC_L * 1.35) / 2 + (C07_AT - C07.wide) * 0.35; // 421.6
export const SAC_SPEED = 0.35;
export const SAC_WOB = 0.5; // C07 sacWob at the END
export const fluidClock0 = C06_OFFSET + C07_AT; // specks drift on f + 240 (C07-local)
export const HALO = 0.45; // C07 HALO_END
// the womb wall (kit <WombBackdrop>), frozen dead still since before C07's first move
export const WALL_FROZEN = C06_OFFSET + C07.fadeEnd + (C07.firstMove - 10 - C07.fadeEnd) / 2;
export const WALL = { warmth: 0.04, depth: 0.75, r: 410, cx: 540, cy: 960, aspect: 1.12, pear: 0.3, folds: 0.5, seed: "s3" } as const;
export const TOP_SHADE = 0.5; // C07 CaptionShade top at the END

// ---- yolk sac: stays where C06 left it, a touch smaller (C07 rig.ts yolkAt, float 0)
const Y6 = { x: 806.51, y: 902.21, r: 41.97 };
export const yolkAt = (week: number, size: number) => {
  const y0 = yolkSuggest(week, size, { x: EMB0.x, y: EMB0.y });
  return { x: Y6.x, y: Y6.y, r: Y6.r * (0.97 + 0.03 * (y0.r / Y6.r)), stalk: y0.stalk };
};
