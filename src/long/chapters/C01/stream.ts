import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { B } from "./beats";
import { scroll, warp } from "./camera";
import { LayerId } from "./constants";
import { Vec, bez, clamp, lerp } from "./math";
import { SpermPose } from "./Sperm";

// The travelling swarm. Every sperm bursts in from below, then keeps pace with
// the climbing camera (it hovers on screen while the corridor streams past).
// Its fate is the gate where it drops out:
//   mesh    tangles (stuck, struggling), bounces (recoils, turns) or fades
//   womb    loses its way: veers off sideways into the dark and fades
//   gate    runs into the throat's shoulders and is left behind
//   exit    (near layer) swims out of frame past the lens
//   survive steers to the throat's gap and gets through (see survivors.ts)
// A sperm that drops out stops keeping pace, so the corridor carries it down.
export type Fate = "mesh" | "womb" | "gate" | "exit" | "survive";
export type How = "tangle" | "bounce" | "fade";

export type StreamSpec = {
  key: string;
  layer: LayerId;
  p: number;
  size: number;
  thick: number;
  omega: number;
  phi: number;
  amp: number;
  p0: Vec; // entry, below the frame (layer coordinates)
  p1: Vec;
  slot: Vec; // where it rides along, relative to the camera
  t0: number;
  tArr: number;
  drift: number; // slow gain (-) or loss (+) of place, layer units per frame
  wander: number;
  fate: Fate;
  how: How;
  fFail: number;
  side: number;
  spin: number;
  gx: number | null; // survivors: x of their line through the throat
  fPass: number; // survivors: frame the throat's gate line passes them
};

export const alivePos = (s: StreamSpec, f: number): Vec => {
  const u = clamp((f - s.t0) / (s.tArr - s.t0));
  const e = 1 - Math.pow(1 - u, 2.4); // burst in, soft landing
  const b = bez(s.p0, s.p1, s.slot, e);
  const t = f * 0.021;
  const w = s.wander * (0.35 + 0.65 * u);
  let x = b.x + noise2D(`${s.key}x`, t, 0) * w;
  const y = b.y + s.drift * Math.max(0, f - s.tArr) + noise2D(`${s.key}y`, 0, t * 0.8) * w * 1.3;
  if (s.gx !== null) {
    const k = tween(f, s.fPass - 34, s.fPass - 4, [0, 1], EASE.inOut);
    x = lerp(x, s.gx + noise2D(`${s.key}g`, t * 1.5, 4) * 8, k);
  }
  return { x, y };
};

// Heading from the WORLD velocity: layer motion minus the corridor's scroll,
// with a small upstream bias so a near-still sperm still points up the tube.
export const heading = (pos: (f: number) => Vec, f: number, p: number) => {
  const a = pos(f - 1);
  const b = pos(f);
  const vy = b.y - a.y - p * (scroll(f) - scroll(f - 1)) - 2.5;
  return Math.atan2(vy, b.x - a.x);
};

const n = (s: StreamSpec, k: string, t: number) => noise2D(`${s.key}${k}`, t, 0);

export const streamPose = (s: StreamSpec, f: number): SpermPose | null => {
  const T = warp(f);
  const P = (g: number) => alivePos(s, g);
  const base = (pos: Vec, ang: number, amp: number, op: number, ph = 0): SpermPose => ({
    x: pos.x,
    y: pos.y,
    ang: (ang * 180) / Math.PI,
    size: s.size,
    phase: s.omega * T + s.phi + ph,
    amp: s.amp * amp,
    op,
    thick: s.thick,
  });
  // nobody but the survivors makes it into the tube
  const late = 1 - tween(f, B.rest + 2, B.rest + 18, [0, 1], EASE.inOut);
  if (late <= 0.01) return null;
  if (f < s.fFail) return base(P(f), heading(P, f, s.p) + n(s, "a", T * 0.035) * 0.12, 1, late);

  const d = f - s.fFail;
  const P0 = P(s.fFail);
  const A0 = heading(P, s.fFail, s.p);
  const dir = { x: Math.cos(A0), y: Math.sin(A0) };
  const v0 = s.p * (scroll(s.fFail) - scroll(s.fFail - 1));
  // world-attached from the moment it fails, with a little forward creep
  const att = s.p * (scroll(f) - scroll(s.fFail));
  const creep = (tau: number) => v0 * tau * (1 - Math.exp(-d / tau));
  const at = (fwd: number, dx = 0) => ({ x: P0.x + dir.x * fwd + dx, y: P0.y + att + dir.y * fwd });
  const kind = s.fate === "mesh" ? s.how : s.fate;

  if (kind === "tangle") {
    const struggle = 1 - tween(d, 0, 36);
    const pos = at(creep(3) + n(s, "j", d * 0.22) * 7 * struggle);
    const op = 1 - tween(d, 16, 46, [0, 1], EASE.inOut);
    return base(pos, A0 + n(s, "t", d * 0.08) * 0.55, 1 - 0.55 * tween(d, 0, 30), op * late, d * 0.25);
  }
  if (kind === "bounce") {
    const pos = at(creep(2) - 74 * (1 - Math.exp(-d / 8)));
    const op = 1 - tween(d, 10, 36, [0, 1], EASE.inOut);
    return base(pos, A0 + s.spin * tween(d, 0, 16, [0, 1], EASE.out), 1 - 0.3 * tween(d, 0, 20), op * late);
  }
  if (kind === "fade") {
    const op = 1 - tween(d, 0, 26, [0, 1], EASE.inOut);
    return base(at(creep(8)), A0 + n(s, "t", d * 0.05) * 0.2, 1 - 0.4 * tween(d, 0, 26), op * late);
  }
  if (kind === "womb") {
    // still swimming, just the wrong way: it keeps most of the pace while it
    // peels off sideways into the dark, so the viewer sees it veer and fade
    const k = 1 - Math.exp(-d / 26);
    const pos = { x: P0.x + dir.x * creep(10) + s.side * 430 * k, y: P0.y + 0.3 * att + dir.y * creep(10) - 40 * k };
    const op = 1 - tween(d, 14, 52, [0, 1], EASE.inOut);
    return base(pos, A0 + s.side * 1.05 * tween(d, 0, 28, [0, 1], EASE.inOut), 1 - 0.45 * tween(d, 0, 40), op * late);
  }
  // gate: butting against the throat's shoulder, carried down with it
  const butt = n(s, "b", d * 0.2) * 7 * (1 - tween(d, 0, 30));
  const op = 1 - tween(d, 10, 38, [0, 1], EASE.inOut);
  return base(at(creep(2) + butt), A0 + n(s, "t", d * 0.07) * 0.3, 1 - 0.5 * tween(d, 0, 30), op * late);
};
