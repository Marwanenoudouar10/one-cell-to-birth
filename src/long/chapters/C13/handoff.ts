// END handoff to C14 (fade): C14's frame 0 is our frame C14_AT. These mirror
// C14's own START (src/long/chapters/C14 baby.ts / motion.ts / index.tsx, as
// built) so the 15-frame crossfade reads as one shot: same world placement,
// same pose formulas (same noise seeds, on C14's clock), same camera drift.
// If C14 changes its START, update only this file.
import { Easing } from "remotion";
import { noise2D } from "@remotion/noise";
import type { FetusPose } from "../../../shared/fetus";
import { WOMB_LOOKS } from "../../../shared/womb";
import { LONG_TRANSITION, chapterFrames } from "../../chapters";
import { weekAtLocal } from "../../lib/weeks";

export const C14_AT = chapterFrames("C13") - LONG_TRANSITION; // our frame = C14 frame 0

const L = WOMB_LOOKS.late;
export const BABY = { x: 540, y: 850, size: 650 } as const;
export const SAC = { ...L.sac, cx: 540, cy: 860, r: 405 };
export const BACK = { ...L.backdrop, cx: 540, cy: 860, r: 414 };
export const SEEDS = { cam: "c14-cam", bd: "c14-bd", sac: "c14-sac", sh: "c14-sh", far: "c14-far", near: "c14-near", lens: "c14-lens", cord: "c14-cord" } as const;
export const CORD = { slack: 0.45, side: 1 as const, pulse: 0.6, sway: 0.6 };
export const BLOOM = 0.1;

// C14's turn: leaves its frame 0 at headDown 0.6 with speed, settles at 1.
const TURN_EASE = Easing.bezier(0.3, 0.45, 0.3, 1);
const C14_TURN_END = 48; // C14 BEATS.turnEnd (1.6 s)
export const c14HeadDown = (fl: number) => 0.6 + 0.4 * TURN_EASE(Math.max(0, Math.min(1, fl / C14_TURN_END)));
// its speed (headDown per second) as it leaves frame 0, for our approach curve
export const C14_TURN_SPEED = ((0.4 * 0.45) / 0.3 / C14_TURN_END) * 30;

// C14's pose at its local frame fl (breathing is 0 until well after the fade)
export const c14Pose = (fl: number): FetusPose => {
  const t = fl * 0.02;
  return {
    mirror: true,
    rotate: 1.2 * noise2D("c14-rot", t * 0.5, 0),
    curl: 0.62 + 0.03 * noise2D("c14-curl", t * 0.6, 1),
    headTilt: 4 + 2 * noise2D("c14-tilt", t * 0.7, 2),
    armSway: 4 * noise2D("c14-arm", t, 3),
    handOpen: 0.35 + 0.1 * noise2D("c14-hand", t, 4),
    legKick: -0.05 + 0.04 * noise2D("c14-leg", t * 0.8, 5),
  };
};
export const C14_ARM = { rest: 0.75, handToFace: 0.25 } as const;
export const C14_TOES = 0.25;

// C14's smoothed kit week at its local frame fl
export const c14Week = (fl: number) => {
  let sum = 0;
  let n = 0;
  for (let k = -24; k <= 24; k += 6) {
    sum += weekAtLocal("C14", Math.max(0, fl + k));
    n++;
  }
  return Math.max(31.6, Math.min(36.4, sum / n));
};

// The womb kit Camera's hand-held drift, evaluated on C14's clock (we pass
// drift=0 and add this ourselves so both chapters wobble identically).
export const c14Drift = (fl: number) => {
  const t = fl * 0.01;
  return {
    dx: noise2D(`${SEEDS.cam}x`, t, 0) * 6,
    dy: noise2D(`${SEEDS.cam}y`, 0, t) * 6,
    rot: noise2D(`${SEEDS.cam}r`, t * 0.6, 3) * 0.5,
  };
};
