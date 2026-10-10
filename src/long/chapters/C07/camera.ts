// C07's camera (womb kit <Camera>, drift 0: C06 hands over a still camera and the
// wall must look perfectly still). Same model as C06/Scene3: the world point (x, y)
// sits at the HERO centre, scaled by zoom.
//   START  C06 END: zoom 1.35, aiming 70% of the way to the week-6 heart, 40 px low
//   reframe on the whole embryo for the moves, then LOCKED while it moves
//   "months": ease back to a wide shot (the sac small in the dark, still womb), locked
//   after "it": a slow push-in begins toward the embryo (C08 lands it)
import { Easing } from "remotion";
import { embryoAnchors } from "../../../shared/embryo";
import { EASE, tween } from "../../../lib/ease";
import { BEATS as B, C06_END } from "./beats";
import { lerp } from "./world/geometry";

const E = C06_END.embryo;
const H6 = embryoAnchors(E.week, E.size, { x: E.x, y: E.y }).heart;
const START = { zoom: C06_END.zoom, x: 540 + (H6.x - 540) * C06_END.aim, y: 860 + (H6.y - 860) * C06_END.aim + C06_END.lift };
// whole-embryo framing for the moves (sac rim stays above the caption band: y <= 1290)
const CLOSE = { zoom: 1.44, x: 514, y: 888 };
// wide: the sac (r 330) small inside the womb, a touch above the frame centre
const WIDE = { zoom: 0.62, x: 540, y: 884 };
// where the push-in heads (the embryo's centre)
const PUSH = { x: 486, y: 846 };
export const PUSH_LEN = 60; // frames for u = 0 -> 1 (C08 continues the same curve)

const logLerp = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));

export const pushU = (f: number) => Math.max(0, (f - B.pushIn) / PUSH_LEN);

export const cameraAt = (f: number) => {
  const frame = tween(f, B.fadeEnd, B.firstMove - 8, [0, 1], EASE.inOut);
  const back = tween(f, B.pullBack, B.wide, [0, 1], EASE.inOut);
  const u = pushU(f);
  const push = Easing.in(Easing.quad)(Math.min(1, u)) + Math.max(0, u - 1) * 2; // C1 beyond u = 1
  const close = logLerp(START.zoom, CLOSE.zoom, frame);
  const zoom = logLerp(close, WIDE.zoom, back) * (1 + 0.32 * push);
  const cx = lerp(START.x, CLOSE.x, frame);
  const cy = lerp(START.y, CLOSE.y, frame);
  const k = Math.min(1, 0.55 * push);
  return {
    zoom,
    x: lerp(lerp(cx, WIDE.x, back), PUSH.x, k),
    y: lerp(lerp(cy, WIDE.y, back), PUSH.y, k),
  };
};
