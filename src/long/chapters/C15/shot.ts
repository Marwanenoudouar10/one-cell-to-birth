// C15 shot setup: the late-womb world (matched to C14's END so the crossfade
// is one continuous shot), the baby's placement, and the two voices as wave
// trains. Pure data; no React. Timing helpers that need the baby's pose
// (when an arc reaches the ear / face) live in motion.ts.
import { C } from "../../../theme/colors";
import { LONG_START } from "../../chapters";
import { WOMB_LOOKS } from "../../../shared/womb";
import type { Pt } from "../../../shared/womb";
import { BEATS as B } from "./beats";

// ---- handoff ----------------------------------------------------------------
// The womb kit (camera drift, sac wobble, specks, cord sway, idle pose noise)
// runs on C14's local clock with C14's seeds, so during the 15-frame fade both
// chapters draw the same world at the same instant: no ghosting, one shot.
export const KIT_CLOCK = LONG_START.C15 - LONG_START.C14;
export const kit = (f: number) => f + KIT_CLOCK;
export const SEEDS = {
  cam: "c14-cam",
  backdrop: "c14-bd",
  sac: "c14-sac",
  shafts: "c14-sh",
  far: "c14-far",
  near: "c14-near",
  lens: "c14-lens",
  cord: "c14-cord",
} as const;
// C14's END pose and cord (the idle noise lives in motion.ts, same seeds).
export const C14_END = {
  arm: { rest: 0.75, handToFace: 0.25 },
  cord: { slack: 0.45, side: 1 as const, twist: 1, pulse: 0.6, bpm: 140, sway: 0.6 },
} as const;

// ---- world (late look, sac framed like Scene5: r ~400 at 540, 860) ----------
export const LOOK = WOMB_LOOKS.late;
export const SAC = { ...LOOK.sac, cx: 540, cy: 860, r: 405 };
export const BACK = { ...LOOK.backdrop, cx: 540, cy: 860, r: 414 };

// The baby: head-down, facing right (mirror + headDown = Scene5's orientation).
// Starts exactly as C14 left it (650 px at 540, 850), then fills out the sac
// (37 -> 39 wk: it reads ever more cramped) and nestles a touch lower-left,
// toward the full-term baby C16 opens on.
export const BABY = {
  x: 540,
  y: 850,
  size: 650,
  sizeEnd: 770,
  nestle: { x: -12, y: 8, rot: 6 }, // reached with the deeper settle on "hers"
  weekStart: 36.4,
  weekEnd: 39.3,
} as const;

// ---- voices -------------------------------------------------------------------
// A train of tapered arcs from a source just outside the frame (same look as
// the kit's <SoundWaves>). Arc k sits at radius (f - start) * speed - k * spacing.
// Sources sit close to the frame edge so the arcs keep a visible curvature
// (they read as rings of sound, not as the late look's light shafts).
export type Train = {
  key: string; // also the SVG id stem ("c15-<key>-...")
  from: Pt;
  dir: number; // degrees, direction of travel
  spread: number; // half-angle of each arc
  count: number;
  spacing: number; // px between arcs
  speed: number; // px per frame
  length: number; // px an arc travels before it is gone
  width: number; // core thickness px
  colors: string[]; // crisp colours outside the sac, cycled per arc
  muffled: string[]; // soft core colours inside the sac
  inAlpha: number; // core opacity inside the sac (muffled)
  wash: number; // opacity of the faint pass laid over the baby
  loud: number; // overall opacity
  target: "ear" | "face"; // the head point the first arc reaches at `reach`
  reach: number; // frame (local) the first arc reaches the target
};

// Mother's voice: from her side (left, inside her body), warm gold and rose,
// wide, full and unhurried. The two passes share everything but timing.
const MUM = {
  from: { x: -90, y: 560 },
  dir: 38,
  spread: 34,
  count: 7,
  spacing: 88,
  speed: 22,
  length: 1150,
  width: 17,
  colors: [C.gold, C.rose],
  muffled: [C.gold, C.peach],
  inAlpha: 0.62,
  wash: 0.85,
  loud: 1,
  target: "ear" as const,
};
export const MUM1: Train = { ...MUM, key: "mum1", reach: B.warmReach };
export const MUM2: Train = { ...MUM, key: "mum2", reach: B.warmReach2, count: 6 };

// A stranger's voice: from the other side (lower right, the outside world),
// cooler cell-cyan, fewer and thinner arcs with a tighter, quicker cadence.
export const STRANGER: Train = {
  key: "str",
  from: { x: 1150, y: 1130 },
  dir: 206,
  spread: 28,
  count: 4,
  spacing: 58,
  speed: 20,
  length: 820,
  width: 12,
  colors: [C.cellCyan, C.cell],
  muffled: [C.cellCyan, C.cell],
  inAlpha: 0.72,
  wash: 0.5,
  loud: 0.95,
  target: "face",
  reach: B.coolReach,
};

export const TRAINS = [MUM1, STRANGER, MUM2] as const;
