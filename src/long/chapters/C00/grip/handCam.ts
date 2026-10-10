// Camera of the opening grip shot: a slow push toward the gold speck in the
// palm (already moving on frame 0), a breath of anticipation after "began?",
// then the plunge into the speck. All screen px; times from BEATS.
import { Easing } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../../lib/ease";
import { T } from "../timeline";

// Same placement as Scene5 / C16, so it is the same shot as the film's end.
export const GRIP = { x: 572, y: 742, rot: -18, scale: 1.18 };

// The speck rests on the heel of the palm, just under the grown-up's finger.
export const SPECK_G: [number, number] = [8, 112];

export const gripToScreen = (gx: number, gy: number): [number, number] => {
  const a = (GRIP.rot * Math.PI) / 180;
  return [
    GRIP.x + GRIP.scale * (gx * Math.cos(a) - gy * Math.sin(a)),
    GRIP.y + GRIP.scale * (gx * Math.sin(a) + gy * Math.cos(a)),
  ];
};

export const S0 = gripToScreen(SPECK_G[0], SPECK_G[1]);
// where the speck ends up before the plunge: the cell's spot in the next shot
export const TARGET: [number, number] = [540, 860];

// 0..1 progress of the plunge
export const diveAt = (f: number) => tween(f, T.dive, T.through, [0, 1], Easing.bezier(0.5, 0, 0.9, 0.55));

export const handCamAt = (f: number) => {
  // slow push, already under way at frame 0 (its key sits before the film starts)
  const push = tween(f, -30, T.began + 8, [1.0, 1.2], Easing.bezier(0.3, 0.05, 0.45, 1));
  // anticipation: the camera eases back a hair before the plunge
  const breath = tween(f, T.began + 8, T.dive, [0, 1], EASE.inOut);
  const u = diveAt(f);
  const s = (push - 0.018 * breath) * Math.pow(9, u);
  const pan = tween(f, -30, T.dive, [0, 1], EASE.inOut);
  const tx = pan * (TARGET[0] - S0[0]);
  const ty = pan * (TARGET[1] - S0[1]);
  // the hand's own gentle drift (as in Scene5), in screen px before the push
  const dx = noise2D("c00-gx", f * 0.006, 0) * 6;
  const dy = noise2D("c00-gy", 0, f * 0.006) * 6;
  // the speck on screen: transform-origin S0, translate (tx, ty), scale s
  const speck: [number, number] = [S0[0] + tx + s * dx, S0[1] + ty + s * dy];
  return { s, tx, ty, u, dx, dy, speck };
};
