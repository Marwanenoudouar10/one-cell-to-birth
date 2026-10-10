import { Easing } from "remotion";
import { HERO } from "../../../theme/layout";
import { EASE, tween } from "../../../lib/ease";
import { LONG_TRANSITION, chapterFrames } from "../../chapters";
import { BEATS as B } from "./beats";
import { Pt, bez, deg, lerp } from "./geometry";
import { at03, pitch3, yaw3 } from "./c03";

// Every motion curve of C04, derived from BEATS (never hard-coded frames).
// World px: with the camera at rest (s 1, looking at 540,860) world = screen.
export { B };
export const DUR = chapterFrames("C04");
export const CX = HERO.cx;
export const CY = HERO.cy;

// START handoff (C03 END): the morula inside the same-size zona at (540, 860),
// zona outer r 175.5 (Scene1/Scene2's shell), cells filling it to r ~150.
export const R0 = 150;
export const ZR = R0 * 1.17;

// --- morula -> hollow ball -------------------------------------------------
// The cells flow to their hollow-ball slots between "Now" and "hollow"
// (stagger survives: the last ring cell lands on B.hollow).
export const CAV = { start: B.cavity, dur: B.hollow - B.cavity - 6, stagger: 6 };
export const cavityOpen = (f: number) => tween(f, CAV.start - 1, B.hollow, [0, 1], EASE.inOut);
// 0 = gold morula cells, 1 = rose-plum outer shell + bright gold knot.
export const tint = (f: number) => tween(f, B.cavity + 2, B.knot + 2, [0, 1], EASE.inOut);
// Slow 3D tumble of the packed morula, so it reads as a ball: C03's own
// tumble, continued on C03's clock (seamless through the fade).
export const yawAt = (f: number) => yaw3(at03(f));
export const pitchAt = (f: number) => pitch3(at03(f));

// Trophectoderm ring: swells against the zona before the hatch.
export const TE_B = 7;
export const ringRadius = (f: number) =>
  146 + 12 * tween(f, B.stretch - 8, B.squeeze, [0, 1], EASE.inOut) + 2 * tween(f, B.free, B.stick) + 1.4 * Math.sin(f * 0.16);
export const ballR = (f: number) => ringRadius(f) + TE_B;

// --- hatching --------------------------------------------------------------
export const EXIT = deg(70); // the opening faces down, a little to the right
export const thin = (f: number) => tween(f, B.stretch, B.opening + 3, [0, 1], EASE.inOut);
export const gapHalf = (f: number) => 21 * tween(f, B.opening, B.squeeze + 8, [0, 1], EASE.out); // degrees
// Hole half-width (px): the shell gives a little as the ball forces through.
export const holeHalf = (f: number) => 40 + 30 * tween(f, B.squeeze, B.squeeze + 9, [0, 1], EASE.out);
export const HOLE_R = 174; // radius of the shell where the opening is
// Distance from the zona centre to the ball centre once it has popped free
// (the squeeze itself is a warp of the ball drawn at the zona centre: warp.ts).
export const D_FREE = HOLE_R + ballR(B.free) + 3;
// The shell left behind: crumples and fades.
export const crumple = (f: number) => tween(f, B.free - 2, B.free + 18, [0, 1], EASE.out);
export const shellFade = (f: number) => 1 - tween(f, B.free + 4, B.stick - 2, [0, 1], EASE.in);

// After the neck snaps the ball squashes along the exit axis and springs back
// with an overshoot (1 = round; continuous with the round lobe at B.free).
export const axialStretch = (f: number) => {
  if (f < B.free) return 1;
  const t = f - B.free;
  return 1 - 0.13 * Math.exp(-t / 6) * Math.sin(t * 0.6);
};

// --- descent, roll, stick, sink ---------------------------------------------
export const WALL = CY + 620; // world y of the womb-wall surface under the landing spot
const P_FREE: Pt = [CX + Math.cos(EXIT) * D_FREE, CY + Math.sin(EXIT) * D_FREE];
export const P_STICK: Pt = [546, WALL - 159];
export const Y_BURIED = WALL + 141;
const DIR: Pt = [Math.cos(EXIT), Math.sin(EXIT)];
const DESC = Easing.bezier(0.3, 0.6, 0.4, 1);
export const sinkT = (f: number) => tween(f, B.sink, B.closed + 6, [0, 1], EASE.inOut);

export const ballPos = (f: number): Pt => {
  if (f < B.free) return [CX, CY];
  if (f < B.stick) {
    const u = DESC((f - B.free) / (B.stick - B.free));
    return bez(P_FREE, [P_FREE[0] + DIR[0] * 46, P_FREE[1] + DIR[1] * 46], [P_STICK[0] + 84, P_STICK[1] - 4], P_STICK, u);
  }
  return [P_STICK[0], lerp(P_STICK[1], Y_BURIED, sinkT(f)) + 2 * Math.sin((f - B.stick) * 0.09)];
};

// Layout rotation of the hollow ball (radians). It starts with the gold knot
// on the left and rolls counter-clockwise so the knot meets the wall.
export const ROLL0 = deg(70);
export const rollAt = (f: number) => ROLL0 * (1 - tween(f, B.free - 4, B.stick + 3, [0, 1], EASE.inOut));

export const contact = (f: number) => tween(f, B.stick - 3, B.stick + 12, [0, 1], EASE.out);
// Blanket of lining that climbs the ball: thickness and covered angle
// (radians from the bottom pole; PI = closed over the top).
export const blanketTau = (f: number) => 14 + 16 * tween(f, B.stick, B.closed + 8, [0, 1], EASE.inOut);
export const coverAt = (f: number, by: number, rOut: number) => {
  if (f < B.stick - 2) return 0;
  const nat = Math.acos(Math.max(-1, Math.min(1, (WALL - by) / rOut)));
  const lead = lerp(0.55, Math.PI, tween(f, B.sink - 3, B.closed, [0, 1], Easing.bezier(0.4, 0, 0.5, 1)));
  return Math.min(Math.PI, Math.max(nat, lead));
};

// --- camera ------------------------------------------------------------------
const CRANE = Easing.bezier(0.45, 0, 0.3, 1);
// Where the camera looks once the ball is buried (world y), before the close-up.
export const CAM_REST = 1620;
export const camera = (f: number) => {
  // Push in on the hollow ball (~35% of the frame), ease back a little to
  // drop it onto the wall, push in as it burrows (the ball stays the subject:
  // ~37% wide while it sends the message), then a slow close-up (~45%).
  const s =
    1 +
    0.13 * tween(f, LONG_TRANSITION - 5, B.stretch + 6, [0, 1], EASE.inOut) -
    0.15 * tween(f, B.squeeze - 4, B.stick + 6, [0, 1], EASE.inOut) +
    0.21 * tween(f, B.stick + 2, B.message + 8, [0, 1], EASE.inOut) +
    0.04 * tween(f, B.message + 8, B.closeup, [0, 1], EASE.inOut) +
    0.22 * tween(f, B.closeup, DUR + 8, [0, 1], Easing.bezier(0.42, 0, 0.4, 1));
  const y =
    CY +
    (1300 - CY) * tween(f, B.squeeze - 4, B.stick + 4, [0, 1], CRANE) +
    (CAM_REST - 1300) * tween(f, B.sink, B.closed + 14, [0, 1], EASE.inOut) +
    (Y_BURIED - 8 - CAM_REST) * tween(f, B.closeup - 4, DUR, [0, 1], EASE.inOut);
  const x = CX + 30 * tween(f, B.squeeze, B.free + 6, [0, 1], EASE.inOut) * (1 - tween(f, B.free + 6, B.stick + 8, [0, 1], EASE.inOut));
  return { x, y, s };
};

// Wall reveal: fades in out of focus under the falling ball, then racks sharp.
export const reveal = (f: number) => tween(f, B.opening - 8, B.stick - 6, [0, 1], EASE.inOut);
export const wallBlur = (f: number) => 9 * (1 - tween(f, B.squeeze - 2, B.stick - 2, [0, 1], EASE.out));
export const roots = (f: number) => tween(f, B.roots, B.roots + 34, [0, 1], EASE.out);
export const warmEnd = (f: number) => tween(f, B.closeup - 8, DUR, [0, 1], EASE.inOut);
// Focus pull into C05: the outgoing chapter stays opaque under the incoming
// one, so C04 itself fades out (late, ease-in) over its last 15 frames and
// nothing pops off when the overlap ends.
export const exitOp = (f: number) => 1 - tween(f, DUR - LONG_TRANSITION, DUR - 1, [0, 1], EASE.in);
