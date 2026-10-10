import { HERO } from "../../theme/layout";
import { P, Pt, add, lerpPt, mul, toFrame } from "./geom";
import { Body } from "./rig";
import { TL } from "./timeline";

// How much of the way the camera travels toward the focus part (hand, foot,
// face). Close to 1 so the part being talked about sits near frame centre.
const FOLLOW = 0.86;

// Screen camera for one frame: what it looks at, and world -> screen mapping.
export const camera = (tl: TL, b: Body) => {
  const W = (p: Pt) => toFrame(tl.fetus, p);
  const handW = W(b.hand.center);
  const footW = W(b.foot.center);
  const faceW = W(lerpPt(b.headO, b.profile[4], 0.55));
  const target = add(add(mul(handW, tl.wHand), mul(footW, tl.wFoot)), mul(faceW, tl.wFace));
  // compose, not just centre: the foot sits a little low (body above it), the
  // face a little high (so the folded legs stay out of the caption zone)
  const biasY = 55 * tl.wFoot - 80 * tl.wFace;
  const focus = add(mul(target, FOLLOW), P(0, -biasY / tl.zoom));
  const toScreen = (p: Pt) => ({ x: HERO.cx + (p.x - focus.x) * tl.zoom, y: HERO.cy + (p.y - focus.y) * tl.zoom });
  const spot = tl.wSum > 0.001 ? toScreen(mul(target, 1 / tl.wSum)) : { x: HERO.cx, y: HERO.cy };
  return { W, focus, target, toScreen, spot };
};
