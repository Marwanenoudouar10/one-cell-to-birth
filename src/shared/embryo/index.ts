// Shared parametric embryo, gestational weeks 3 -> 8.99 (one continuous `week`).
// Matches Scene3's week-6 embryo exactly at week = 6.
//
//   import { Embryo, embryoAnchors, YolkSac, YolkStalk, sacEdge, yolkSuggest,
//            heartbeatPulse, heartbeatGlow } from "../../shared/embryo";
//
// LOOK PER WEEK
//   3     flat trilaminar disc lying flat (head right), seen from above-front:
//         ectoderm (cool) / mesoderm (rose) / endoderm (gold) bands on its rim,
//         primitive streak + node; yolk sac hugs it from below
//   3.5   slipper-shaped disc, keyhole neural plate
//   4     neural folds + groove, first somite pairs; disc starts to fold and sit up.
//         `zip` 0..1 closes the tube from the neck outward (both neuropores last)
//   4.5   curling into a C, head fold, heart bulge appears
//   5-6   C-shaped embryo: heart bulge, eye spot, limb buds (6 = Scene3)
//   7     arm/leg paddles with hand/foot plates, pigmented eye
//   8     webbed fingers/toes, nose/lips/ear forming, eyelids forming, tail regressing
//   8.99  end of the embryonic period
//
// COORDINATES
//   <Embryo> returns an SVG <g>: put it inside your own <svg>. It is drawn centred
//   on its visual centre at (x, y), `size` px ~ figure height (default 280; Scene3's
//   embryo ~ size 322). Every stage is drawn at a similar visual size; scale `size`
//   yourself if you want it to grow. Lighting is fixed top-left in screen space;
//   `rotate` turns the geometry about the visual centre and the light stays put.
//   embryoAnchors(week, size, { x, y, rotate }) and yolkSuggest(...) return points
//   in that same px space (pass the same placement), so they line up exactly.
//
// LAYERING
//   draw  <YolkStalk/>  then  <YolkSac/>  then  <Embryo/>  (the stalk starts behind the belly).
//   Several embryos/sacs in one <svg>: give each a different `id`.

export { Embryo } from "./Embryo";
export type { EmbryoProps } from "./Embryo";
export { embryoAnchors, yolkSuggest, centreOf, DESIGN } from "./anchors";
export type { EmbryoAnchors, Place, YolkPlace } from "./anchors";
export { YolkSac, YolkStalk, yolkStalkPath, sacEdge } from "./YolkSac";
export type { StalkOpts } from "./YolkSac";
export { heartbeatPulse, heartbeatGlow, firstBeat, beatPeriod } from "./heartbeat";
export type { BeatOpts } from "./heartbeat";
export { stageAt, stageFor, defaultZip } from "./stage";
export type { Stage } from "./stage";
