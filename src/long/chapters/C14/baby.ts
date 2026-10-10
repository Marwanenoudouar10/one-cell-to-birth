// Where the baby is and how it is posed at a frame (pure). One source of
// truth for the fetus layer, the cord, the head glow, the swirls, the rhythm
// line and the lung inset, so everything stays glued to the body.
import { noise2D } from "@remotion/noise";
import { FetusAnchors, FetusPose, buildFetus, fetusAnchors, outFrame } from "../../../shared/fetus";
import { breatheAt, fetusWeekAt, handAwayAt, headDownAt, settleRotAt } from "./motion";

export const BABY = { x: 540, y: 850, size: 650 } as const;

export type Pt = { x: number; y: number };

export type BabyState = {
  week: number;
  pose: FetusPose;
  a: FetusAnchors; // local px (origin = BABY.x/y)
  w: (p: Pt) => Pt; // local -> world px
  geo: ReturnType<typeof buildFetus>; // rig geometry (for the chest mask)
  fr: ReturnType<typeof outFrame>; // rig -> local px
  chest: (p: Pt) => Pt; // normalised lung-tree frame -> local px
  chestPx: number; // px per normalised lung unit
};

export const babyAt = (f: number): BabyState => {
  const week = fetusWeekAt(f);
  const t = f * 0.02;
  const pose: FetusPose = {
    mirror: true, // with headDown 1 this ends like Scene5: head down, facing right
    headDown: headDownAt(f),
    rotate: settleRotAt(f) + 1.2 * noise2D("c14-rot", t * 0.5, 0),
    curl: 0.62 + 0.03 * noise2D("c14-curl", t * 0.6, 1),
    headTilt: 4 + 2 * noise2D("c14-tilt", t * 0.7, 2),
    armPose: { rest: 0.75, handToFace: 0.25 },
    armSway: 4 * noise2D("c14-arm", t, 3) - 15 * handAwayAt(f), // hand drifts off the lips while it breathes
    handOpen: 0.35 + 0.1 * noise2D("c14-hand", t, 4),
    legKick: -0.05 + 0.04 * noise2D("c14-leg", t * 0.8, 5),
    toesCurl: 0.25,
    breathe: breatheAt(f),
  };
  const a = fetusAnchors(week, pose, BABY.size);
  const geo = buildFetus(week, pose);
  const fr = outFrame(geo, BABY.size);
  // lung frame in rig space: root low in the neck, growing toward the
  // diaphragm along the spine; x runs from the back (-) to the belly (+)
  const sp = geo.sp;
  const r0 = sp.pos(-0.02, 0.05);
  const r1 = sp.pos(0.46, -0.05);
  const H = Math.hypot(r1.x - r0.x, r1.y - r0.y);
  const up = { x: (r1.x - r0.x) / H, y: (r1.y - r0.y) / H };
  const across = sp.pos(0.22, 1);
  const back = sp.pos(0.22, -1);
  const al = Math.hypot(across.x - back.x, across.y - back.y);
  const side = { x: (across.x - back.x) / al, y: (across.y - back.y) / al };
  const chest = (p: Pt) => fr.toOut({ x: r0.x + up.x * -p.y * H + side.x * p.x * H, y: r0.y + up.y * -p.y * H + side.y * p.x * H });
  return { week, pose, a, w: (p) => ({ x: BABY.x + p.x, y: BABY.y + p.y }), geo, fr, chest, chestPx: H * fr.s };
};
