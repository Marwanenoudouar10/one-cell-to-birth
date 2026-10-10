// Rig units -> output pixels. The output origin (0,0) is the centre of the
// body's bounding box in the reference pose of that week, so pose changes
// (kick, curl, thumb suck) never move or rescale the body; `size` is the
// reference height in px. headDown / rotate / mirror turn the body about that
// origin. Light is kept in screen space (upper-left) whatever the turn.
import { P, Pt, rot } from "./geom";
import { FetusGeom, bbox, buildFetus } from "./rig";
import { REFERENCE_POSE, ResolvedPose } from "./pose";

const refCache = new Map<number, ReturnType<typeof bbox>>();

// Reference bounding box (rig units) of the default pose at a week.
export const refBox = (week: number) => {
  const k = Math.round(week * 50);
  let b = refCache.get(k);
  if (!b) {
    b = bbox(buildFetus(k / 50, REFERENCE_POSE));
    refCache.set(k, b);
  }
  return b;
};

export type OutFrame = {
  s: number; // px per rig unit
  rot: number; // degrees
  mx: 1 | -1; // mirror
  c: Pt; // rig point that maps to the output origin
  css: string; // SVG transform for rig-space drawing
  toOut: (p: Pt) => Pt; // rig point -> output px
  vecToRig: (v: Pt) => Pt; // screen-space direction -> rig-space direction (same length in rig units)
  toRig: (p: Pt) => Pt; // output px -> rig point
};

// Total body turn in degrees for a pose (head-down is a forward roll).
export const bodyTurn = (p: ResolvedPose) => p.rotate + 180 * p.headDown * (p.mirror ? -1 : 1);

export const outFrame = (geo: FetusGeom, size: number): OutFrame => {
  const ref = refBox(geo.g.week);
  const s = size / ref.h;
  const r = bodyTurn(geo.p);
  const mx: 1 | -1 = geo.p.mirror ? -1 : 1;
  const c = ref.c;
  const toOut = (p: Pt) => rot(P((p.x - c.x) * s * mx, (p.y - c.y) * s), r);
  const vecToRig = (v: Pt) => {
    const u = rot(v, -r);
    return P(u.x * mx, u.y);
  };
  const toRig = (p: Pt) => {
    const u = rot(p, -r);
    return P((u.x / s) * mx + c.x, u.y / s + c.y);
  };
  const css = `rotate(${r.toFixed(3)}) scale(${(mx * s).toFixed(5)} ${s.toFixed(5)}) translate(${(-c.x).toFixed(2)} ${(-c.y).toFixed(2)})`;
  return { s, rot: r, mx, c, css, toOut, vecToRig, toRig };
};
