import { Body, buildBody } from "./body";
import { project } from "./centreline";
import { eyeLocal } from "./Face";
import { limbPalm } from "./Limb";
import { Pt, add, mul, ramp, rot, sub } from "./math";
import { fromHead } from "./rig";
import { mono, stageFor } from "./stage";

// Where things are, without rendering. All points are in the SAME space the
// <Embryo> draws in: px, relative to its placement (x, y, rotate, size).

export const DESIGN = 280; // design units that map to `size` px

export type Place = { x?: number; y?: number; rotate?: number };

// Noise-free body for a week (cached): used for centring and anchors.
const cache = new Map<string, Body>();
export const restBody = (week: number, rotate = 0): Body => {
  const key = `${week.toFixed(4)}:${rotate.toFixed(3)}`;
  let b = cache.get(key);
  if (!b) {
    b = buildBody(stageFor(week, rotate), 0, 0, "emb-rest");
    if (cache.size > 400) cache.clear();
    cache.set(key, b);
  }
  return b;
};

// Visual centre (bbox middle) in design units; the Embryo draws centred on it.
export const centreOf = (week: number, rotate = 0): Pt => {
  const { x0, x1, y0, y1 } = restBody(week, rotate).bounds;
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
};

// design-space point -> placed px
// (rotation is already folded into the geometry via stageFor)
export const placer = (week: number, size: number, place: Place = {}) => {
  const c = centreOf(week, place.rotate ?? 0);
  const k = size / DESIGN;
  return (p: Pt): Pt => add({ x: place.x ?? 0, y: place.y ?? 0 }, mul(sub(p, c), k));
};

export type EmbryoAnchors = {
  centre: Pt; // visual centre (= placement point)
  heart: Pt; // heart (pulse rings / glow origin)
  head: Pt; // head centre (brain)
  crown: Pt; // top of the head / cranial end of the disc
  eye: Pt;
  hand: Pt; // palm of the near-side hand (root of the arm bud before week 7)
  foot: Pt;
  yolkStalk: Pt; // where the yolk stalk leaves the belly (behind the body)
  tail: Pt; // tail tip / caudal end
  width: number; // bounding box, px
  height: number;
  presence: { heart: number; eye: number; hand: number; foot: number }; // 0..1 how visible each one is
};

export const embryoAnchors = (week: number, size = DESIGN, place: Place = {}): EmbryoAnchors => {
  const b = restBody(week, place.rotate ?? 0);
  const st = b.st;
  const P = placer(week, size, place);
  const v = (p: Pt) => P(project(p, 0, st));
  const paddle = ramp(st.week, 6, 7);
  const limb = (l: { root: Pt; dir: number }, palm: Pt) => v(add(l.root, rot(palm, l.dir)));
  const L = b.line;
  const k = size / DESIGN;
  const crown = v(add(b.rig.head.c, rot({ x: -10, y: -b.rig.headBlob.ry }, 0)));
  return {
    centre: P(centreOf(week, place.rotate ?? 0)),
    heart: v(b.rig.heart),
    head: v(b.rig.head.c),
    crown: st.head > 0.3 ? crown : v(L.c[0]),
    eye: v(fromHead(b.rig.head, eyeLocal(st))),
    hand: limb(b.rig.arm, limbPalm(st.arm, paddle)),
    foot: limb(b.rig.leg, limbPalm(st.leg, paddle)),
    yolkStalk: v(b.rig.stalk),
    tail: v(L.c[L.c.length - 1]),
    width: (b.bounds.x1 - b.bounds.x0) * k,
    height: (b.bounds.y1 - b.bounds.y0) * k,
    presence: { heart: st.heart, eye: st.eye, hand: st.arm.grow, foot: st.leg.grow },
  };
};

// Suggested yolk sac placement (same space as the anchors). Week 6 = exactly
// Scene3's yolk sac relative to its embryo; early on it is big and tucked
// behind the ventral side of the disc, later it drifts out on its stalk and
// shrinks relative to the growing body.
const Y_WK = [3, 4, 4.5, 5, 6, 7, 8, 9];
export type YolkPlace = { x: number; y: number; r: number; stalk: number };
// `stalk` = thickness to pass to <YolkStalk scale>: 0 at week 3 (the sac hugs the
// disc directly), a wide duct while the gut folds off, Scene3's cord from week 6.
export const yolkSuggest = (week: number, size = DESIGN, place: Place = {}): YolkPlace => {
  const c6 = centreOf(6);
  const s3 = { x: 273 - c6.x, y: 40 - c6.y }; // Scene3: yolk (806,902) vs embryo (492,856) at scale 1.15
  const dx = mono(week, Y_WK, [125, 128, 150, 214, s3.x, s3.x + 14, s3.x + 24, s3.x + 30]);
  const dy = mono(week, Y_WK, [-6, 10, 40, 54, s3.y, s3.y - 6, s3.y - 12, s3.y - 16]);
  const r = mono(week, Y_WK, [82, 68, 52, 42, 36.5, 32, 28, 26]);
  // ventral = below the flat disc, swinging round to the right as it sits up
  const off = rot({ x: dx, y: dy }, stageFor(week, place.rotate ?? 0).spin);
  const p = placer(week, size, place)(add(centreOf(week, place.rotate ?? 0), off));
  const stalk = mono(week, Y_WK, [0, 2.4, 1.6, 1.2, 1, 1, 1, 1]) * (week < 3.6 ? 0 : 1);
  return { ...p, r: r * (size / DESIGN), stalk: (stalk * size) / (DESIGN * 1.15) };
};
