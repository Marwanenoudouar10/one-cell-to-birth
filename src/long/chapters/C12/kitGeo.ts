// Read-only bridge to the fetus kit's geometry, so C12's macro layers draw in
// exactly the same rig / head-local spaces as <Fetus> (same week, pose, size).
import { buildFetus, outFrame } from "../../../shared/fetus";
import type { FetusPose } from "../../../shared/fetus";
import type { FetusGeom } from "../../../shared/fetus/rig";
import type { OutFrame } from "../../../shared/fetus/frame";

export type { FetusGeom };
export type OutFrameLike = OutFrame;

export const kitGeo = (week: number, pose: FetusPose, size: number) => {
  const geo = buildFetus(week, pose);
  const fr = outFrame(geo, size);
  // head-local -> rig (the kit's Face transform)
  const headXf = `translate(${geo.headO.x} ${geo.headO.y}) rotate(${geo.headRot}) scale(${geo.headS})`;
  return { geo, fr, headXf };
};
