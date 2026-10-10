// The fetus for C12: placement in the womb world, week (from the tracker),
// pose per frame (idle life, startle, random face twitches, lids) and the
// world-space anchors the camera and effects lock onto.
import { noise2D } from "@remotion/noise";
import { FetusPose, fetusAnchors } from "../../../shared/fetus";
import { weekAtLocal } from "../../lib/weeks";
import { BEATS } from "./beats";

export const FX = 540; // fetus origin, world px
export const FY = 900;
export const SIZE = 560;

export type P2 = { x: number; y: number };
export const toWorld = (p: P2): P2 => ({ x: FX + p.x, y: FY + p.y });

// kit week: follows the tracker (21 -> 27, easing on toward 28 at the end)
export const kitWeek = (f: number) => Math.max(21, Math.min(28, weekAtLocal("C12", f)));

const spike = (f: number, at: number, decay: number) => (f < at ? 0 : Math.exp(-(f - at) / decay));
// smooth 0..1..0 bump of `len` frames starting at `at`
const bump = (f: number, at: number, len: number) => {
  if (f <= at || f >= at + len) return 0;
  return Math.sin((Math.PI * (f - at)) / len) ** 2;
};

// startle: quick jolt (head lifts, fingers splay), then settles
export const startleAmt = (f: number) => {
  const up = Math.min(1, Math.max(0, (f - BEATS.startle + 2) / 2));
  return up * spike(f, BEATS.startle, 5);
};

// pose WITHOUT the startle (the camera follows this one, so the jolt reads)
export const basePose = (f: number): FetusPose => {
  const t = f / 30;
  return {
    curl: 0.5,
    headTilt: 1.2 * noise2D("c12-tilt", t * 0.35, 0),
    armPose: "rest",
    armSway: -14 + 3 * noise2D("c12-arm", t * 0.4, 2),
    handOpen: 0.45 + 0.1 * noise2D("c12-hand", t * 0.5, 4),
  };
};

export const poseAt = (f: number, eyeOpen = 0): FetusPose => {
  const b = basePose(f);
  const st = startleAmt(f);
  // random face movements: a lip-corner twitch (not a smile: brief, small)
  const lip = 0.45 * bump(f, BEATS.lipTwitch, 7) - 0.25 * bump(f, BEATS.lipTwitch + 7, 6);
  return {
    ...b,
    hiccup: 0.55 * st,
    headTilt: (b.headTilt ?? 0) - 2.5 * st,
    handOpen: Math.min(1, (b.handOpen ?? 0.4) + 0.55 * st),
    armSway: (b.armSway ?? 0) - 7 * st,
    expression: lip,
    eyeOpen,
  };
};

// world-space anchors of the camera pose (no startle)
export const camAnchors = (f: number) => {
  const a = fetusAnchors(kitWeek(f), basePose(f), SIZE);
  return { eye: toWorld(a.eye), ear: toWorld(a.ear), head: toWorld(a.headCenter), headR: a.headRadius, a };
};
