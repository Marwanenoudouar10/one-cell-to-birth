// The embryo's full state at a frame (week, size, placement, pose, posed anchors, yolk):
// one function, so the motion arcs can look a few frames back with the same rig.
import { yolkSuggest } from "../../../shared/embryo";
import { C06_END } from "./beats";
import { bendAt, embryoSize, floatAt, kitWeek, poseAt } from "./motion";
import { posedAnchors } from "./pose";

const E = C06_END.embryo;

export const rigAt = (f: number) => {
  const week = kitWeek(f);
  const size = embryoSize(f);
  const fl = floatAt(f);
  const place = { x: E.x + fl.dx, y: E.y + fl.dy, rotate: fl.rot };
  const pose = poseAt(f);
  const a = posedAnchors(week, size, place, pose);
  return { week, size, place, pose, a, fl };
};

export type Rig = ReturnType<typeof rigAt>;

// The yolk sac stays where C06 left it (the kit's suggestion drifts it out past the
// sac rim by week 7), shrinking a touch; it bobs with the float and is tugged by its
// stalk a beat behind each bend.
export const yolkAt = (f: number, r: Rig) => {
  const y0 = yolkSuggest(r.week, r.size, r.place);
  const Y = C06_END.yolk;
  const tug = bendAt(f - 7);
  return {
    x: Y.x + 0.6 * r.fl.dx - 7 * tug,
    y: Y.y + 0.8 * r.fl.dy + 6 * tug,
    r: Y.r * (0.97 + 0.03 * (y0.r / Y.r)),
    stalk: y0.stalk,
  };
};
