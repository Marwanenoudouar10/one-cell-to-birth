// Every motion curve of C02, derived from BEATS (never from raw frame numbers).
import { Easing, spring } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { FPS } from "../../../theme/layout";
import { LONG_TRANSITION, chapterFrames } from "../../chapters";
import { BEATS as B, DUR } from "./beats";

export const CX = 540;
export const CY = 860;
export const R0 = 150; // zygote core radius (C01 END / Scene2 START)
export const ZR = R0 * 1.17; // zona outer radius (175.5)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
export const rad = (deg: number) => (deg * Math.PI) / 180;
export type P2 = { x: number; y: number };
export const polar = (r: number, deg: number): P2 => ({ x: Math.cos(rad(deg)) * r, y: Math.sin(rad(deg)) * r });

// Breath: Scene1's 2 % / 56-frame cycle, phase-locked to C01's last frames
// (C01 frame k + its fade start = our frame k).
const PHASE = chapterFrames("C01") - LONG_TRANSITION;
export const breathAt = (f: number) => 1 + 0.02 * Math.sin(((f + PHASE) / 56) * Math.PI * 2);

// Exit: Remotion's fade keeps this chapter opaque under C03 while C03 fades
// in on top, and both draw the same translucent zona / glow / specks / caption
// shade. Those fade out here (linear, like C03's fade-in) so nothing doubles
// up and pops off at the cut. Opaque layers (cell body, pronuclei) stay.
export const exitOp = (f: number) => 1 - tween(f, DUR - LONG_TRANSITION, DUR, [0, 1], (t) => t);

// Handoff: C01's white-hot zygote (Scene1 END) dissolves into Scene2's calm,
// sculpted cell so the pronuclei can be seen through the cytoplasm.
export const matchOp = (f: number) => 1 - tween(f, B.handoff - 1, B.handoff + 32, [0, 1], EASE.inOut);
export const glowOn = (f: number) => tween(f, B.handoff, B.handoff + 40, [0, 1], EASE.inOut);

// Camera: dead still on frame 0 (C01 END), a slow push toward the cell on the
// first sentence, easing back to give the dot row room, still again at END.
export const camAt = (f: number) => {
  const z =
    1 +
    0.04 * tween(f, 0, B.pushPeak, [0, 1], EASE.inOut) -
    0.04 * tween(f, B.pushPeak, B.endHold, [0, 1], EASE.inOut);
  const env = tween(f, 6, 40, [0, 1], EASE.inOut) * (1 - tween(f, B.dotsFade - 10, B.endHold, [0, 1], EASE.inOut));
  const t = f * 0.011;
  return { z, dx: noise2D("c02-cx", t, 0) * 4 * env, dy: noise2D("c02-cy", 0, t) * 4 * env };
};
// Plane at depth p (1 = zygote plane; <1 far, >1 near) around the hero centre.
export const camXf = (f: number, p = 1) => {
  const c = camAt(f);
  const z = Math.pow(c.z, p);
  return `translate(${(CX + c.dx * p).toFixed(2)} ${(CY + c.dy * p).toFixed(2)}) scale(${z.toFixed(5)}) translate(${-CX} ${-CY})`;
};

// Elongation (4.9 -> 5.5 s): the cell stretches along x inside the rigid zona.
export const ELONG = 0.06; // C03 starts from exactly this (its EL0)
export const elongAt = (f: number) => tween(f, B.elongate, B.endHold, [0, 1], EASE.inOut);
export const cellRadii = (f: number) => {
  const k = 1 + ELONG * elongAt(f);
  return { rx: R0 * k, ry: R0 / k };
};

// Pronuclei. Gold forms near the sperm's entry point (lower left, where C01's
// winner slipped in), peach near the polar-body side (upper right). They grow
// as they drift in on gently bowed paths and come to rest side by side.
export const PR = 31; // settled radius (Scene2's pronuclei are 30)
const TOUCH = PR * 1.04; // half-distance at first touch
const REST = PR * 0.9; // half-distance when pressed together (flat shared wall)
const AXIS0 = -52; // pair axis (deg), gold at the lower-left end
const AXIS1 = -70; // turns a little as the cell elongates (perpendicular-ish to the stretch)
const MID: P2 = { x: 0, y: 6 };
const START = [polar(112, 132), polar(110, -50)]; // [gold, peach]
const BOW = [22, 20]; // sideways swing of each path (px), both swirling clockwise

// Even drift with a late landing: they are still visibly apart a moment
// before "two", then close the last gap and press together on the word.
const travelAt = (f: number) => tween(f, B.pronIn, B.pronMeet, [0, 1], Easing.bezier(0.35, 0, 0.7, 1));
const contactAt = (f: number) =>
  spring({ frame: f - (B.pronMeet - 3), fps: FPS, config: { damping: 11, stiffness: 120, mass: 0.7 } });

export type Pron = { x: number; y: number; r: number; op: number; axis: number; half: number };

export const pronuclei = (f: number): Pron[] => {
  const t = travelAt(f);
  const c = contactAt(f);
  const e = elongAt(f);
  const idle = tween(f, B.pronMeet, B.pronMeet + 30);
  const n = f * 0.012;
  const axis = lerp(AXIS0, AXIS1, e) + noise2D("c02-pax", n, 0) * 4 * idle;
  const half = lerp(TOUCH, REST, c);
  const mid = { x: MID.x + noise2D("c02-pmx", n, 3) * 2.5 * idle, y: MID.y + noise2D("c02-pmy", 3, n) * 2.5 * idle };
  const op = tween(f, B.pronIn, B.pronIn + 26, [0, 1], EASE.inOut);
  const r = lerp(PR * 0.42, PR, smooth(t * 1.25)) * (1 + 0.012 * Math.sin(f * 0.11));
  return [0, 1].map((i) => {
    const sgn = i === 0 ? -1 : 1;
    const end = { x: mid.x + sgn * polar(half, axis).x, y: mid.y + sgn * polar(half, axis).y };
    const s0 = START[i];
    const dx = end.x - s0.x;
    const dy = end.y - s0.y;
    const L = Math.hypot(dx, dy) || 1;
    const bow = Math.sin(Math.PI * t) * BOW[i];
    // little wobble while they travel (cytoplasm streaming)
    const w = Math.sin(Math.PI * t) * 3;
    return {
      x: lerp(s0.x, end.x, t) + (-dy / L) * bow + noise2D(`c02-pw${i}`, n * 2, 0) * w,
      y: lerp(s0.y, end.y, t) + (dx / L) * bow + noise2D(`c02-pw${i}`, 0, n * 2) * w,
      r,
      op,
      axis,
      half,
    };
  });
};

// 1 = crisp, phone-readable pronuclei; eases to 0 (C03's softer look) while the
// cell stretches, so the END frame matches C03's START exactly.
export const crispAt = (f: number) => 1 - tween(f, B.elongate, B.endHold, [0, 1], EASE.inOut);

// Contact glint where the pronuclei first press together.
export const meetGlow = (f: number) =>
  tween(f, B.pronMeet - 4, B.pronMeet + 2) * (1 - tween(f, B.pronMeet + 2, B.pronMeet + 30, [0, 1], EASE.out));

// Where the spark from dot 14 meets the zona (deg, SVG convention: lower right,
// inside the zona's warm tint arc).
export const ENTRY_DEG = 45;

// The zygote lights up when the spark from dot 14 reaches it (halo swell +
// one soft ring rolling outward + a glint running both ways round the zona).
export const echoAt = (f: number) =>
  tween(f, B.cellLit - 2, B.cellLit + 2) * (1 - tween(f, B.cellLit + 2, B.cellLit + 30, [0, 1], EASE.out));
export const echoRing = (f: number) => tween(f, B.cellLit, B.cellLit + 22, [0, 1], EASE.out);
export const zonaGlint = (f: number) => tween(f, B.cellLit - 1, B.cellLit + 20, [0, 1], EASE.out);

// Focus hand-off: while the day count runs the zygote steps back a little so
// the dot row is the one bright idea; the spark from dot 14 lights it up again.
export const countDim = (f: number) =>
  tween(f, B.dotsDraw, B.dotsDone, [0, 1], EASE.inOut) *
  (1 - tween(f, B.cellLit - 5, B.cellLit + 7, [0, 1], EASE.inOut)); // brightens as the spark closes in (no 1-frame jolt)
