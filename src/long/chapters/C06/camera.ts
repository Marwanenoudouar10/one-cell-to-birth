// Scene3's camera (src/scenes/Scene3/motion.ts: camera + camTransform), retimed
// to C06's BEATS. Same model: a world point (fx, fy) sits at the sac centre on
// screen, scaled by `scale`, with a gentle hand-held drift; depth layers get
// parallax. Changes for the long film:
//   - it starts on C05's END camera (zoom 1.3 looking at 540,860, no drift),
//   - it aims a little below the heart so the sac rim stays above the captions
//     (less so at the first-beat zoom, so the sac top stays under the tracker),
//   - in on the tube while it fills ("a tube of heart cells") and for the first
//     beat (+ Scene3's thump); then back out to Scene3's own framing so the
//     rings cross the whole sac ("all by itself"); in again as it grows into
//     week 6 ("By week six, a tiny heart is beating"),
//   - the drift fades out at the END so C07 inherits a still camera.
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { BEATS as B, C05_END } from "./beats";
import { Pt } from "./geometry";

export const SAC = { x: 540, y: 860, r: 330 } as const;
export const BEAT_ZOOM = 1.6; // close on the tube: it is the subject of the first beat
export const WIDE_ZOOM = 1.22; // near Scene3's framing: the rings cross the whole sac, embryo still ~24% wide
export const END_ZOOM = 1.35; // END framing (C07 starts here)
// how far the aim moves from the sac centre toward the heart
const AIM_BEAT = 0.85; // tube near the centre of the frame
const AIM_WIDE = 0.55; // Scene3's value
const AIM = 0.7; // END
const LIFT = 40; // world px the aim sits below that point (keeps the sac rim off the captions)
const DROP = 25; // at the first-beat zoom the aim rises again (content moves down): the sac's
// villi fringe stays below the tracker band (y 290); its lower rim passes under the caption shade

export type Cam = { scale: number; fx: number; fy: number; dx: number; dy: number; rot: number };

// 0 at the hand-off frames (still camera, like C05's END and C07's START), 1 in between.
export const aliveAt = (f: number) =>
  tween(f, B.worldIn, B.curlEnd, [0, 1], EASE.inOut) * tween(f, B.legBuds + 6, B.pushEnd, [1, 0], EASE.inOut);

export const camera = (f: number, target: Pt): Cam => {
  const z0 = C05_END.zoom;
  const inBeat = tween(f, B.curlEnd - 16, B.firstBeat - 6, [0, BEAT_ZOOM - z0], EASE.inOut);
  const back = tween(f, B.pullBack, B.wideEnd, [0, WIDE_ZOOM - BEAT_ZOOM], EASE.inOut);
  const push = tween(f, B.growStart, B.pushEnd, [0, END_ZOOM - WIDE_ZOOM], EASE.inOut);
  const k = Math.max(0, f - B.firstBeat - 1) / 3;
  const kick = k * Math.exp(1 - k);
  const scale = z0 + inBeat + back + push + 0.03 * kick;
  const p =
    tween(f, B.curlEnd - 16, B.firstBeat - 6, [0, AIM_BEAT], EASE.inOut) +
    tween(f, B.pullBack, B.wideEnd, [0, AIM_WIDE - AIM_BEAT], EASE.inOut) +
    tween(f, B.growStart, B.pushEnd, [0, AIM - AIM_WIDE], EASE.inOut);
  const lift = tween(f, B.worldIn, B.curlEnd, [0, LIFT], EASE.inOut) - DROP * tween(scale, END_ZOOM, BEAT_ZOOM, [0, 1], EASE.inOut);
  const t = f * 0.01;
  const a = aliveAt(f);
  return {
    scale,
    fx: C05_END.look.x + (target.x - C05_END.look.x) * p,
    fy: C05_END.look.y + (target.y - C05_END.look.y) * p + lift,
    dx: noise2D("c06cx", t, 0) * 6 * a,
    dy: noise2D("c06cy", 0, t) * 6 * a,
    rot: noise2D("c06cr", t * 0.6, 3) * 0.5 * a,
  };
};

// SVG transform for a depth layer (depth 1 = sac plane, <1 far, >1 near).
export const camTransform = (c: Cam, depth = 1) => {
  const s = 1 + (c.scale - 1) * depth;
  const fx = SAC.x + (c.fx - SAC.x) * depth;
  const fy = SAC.y + (c.fy - SAC.y) * depth;
  return `translate(${SAC.x + c.dx * depth} ${SAC.y + c.dy * depth}) rotate(${c.rot * depth}) scale(${s}) translate(${-fx} ${-fy})`;
};
