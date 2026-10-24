// The fetus as a pure function of the chapter frame: kit week, size, pose and where it
// floats. Frame 0 continues C09's END exactly: the same pose formulas, noise seeds and
// float, evaluated on C09's clock (g = f + 285), so the fade is a true match cut.
// Then: grows 12 -> 17 wk, the hand drifts up and the thumb meets the lips ("thumb"),
// small rhythmic sucks, and on "Week seventeen" the thumb slides out and the fingers fan
// open for the push into one fingertip.
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../../lib/ease";
import { FetusAnchors, FetusPose, fetusAnchors } from "../../../../shared/fetus";
import { BEATS as B, C09_CLOCK } from "../beats";
import { Pt, add, clamp, lerp } from "../geom";

const io = EASE.inOut;
export const nz = (seed: string, f: number, speed = 0.012) => noise2D(seed, f * speed, 0);

// C09 END numbers (copied, not imported): size 515 at world ~(487.8, 864.2)
export const SIZE0 = 515;
const AT1: Pt = { x: 486, y: 866 };

// kit week: holds 12 under the fade, then grows smoothly to 17 by the macro shot
export const weekAt = (f: number) => tween(f, B.fadeEnd, B.macroIn, [12, 17], io);
// world size: holds through the whole-body X-ray (feet stay above the captions), grows on the face
export const sizeAt = (f: number) => tween(f, B.toFace, B.macroIn, [SIZE0, 545], io);

export type Rig = { week: number; size: number; pose: FetusPose; at: Pt; suck: number; contact: number; rel: number };

export const rigAt = (f: number): Rig => {
  const g = f + C09_CLOCK; // C09's clock for every noise term

  // ---- thumb: drift up after "fifteen", lips on "sucks", sucks, out before "Week"
  const up = tween(f, B.handUp, B.thumbIn, [0, 1], io);
  const rel = tween(f, B.release, B.release + 14, [0, 1], io);
  const suckW = up * (1 - rel);
  // rhythmic sucking (~2.3 per second), phased so a suck peaks on "thumb"; a soft
  // envelope so the first pulse eases in
  const env = tween(f, B.thumbIn - 2, B.thumbIn + 6, [0, 1], io) * (1 - tween(f, B.release - 4, B.release + 4, [0, 1], io));
  const suck = env * (0.5 + 0.5 * Math.cos(((f - B.thumbWord) / 13) * Math.PI * 2));
  // contact: the warm touch at the lips (rises as the thumb arrives, fades on release)
  const contact = tween(f, B.thumbIn - 4, B.thumbIn + 2, [0, 1], io) * (1 - rel);

  // C09 END: handOpen 0.72 + noise; fist while sucking (kit); fans fully open on release
  const handOpen = lerp(0.72 + 0.04 * nz("c09ho", g, 0.05), 0.97, rel);

  const pose: FetusPose = {
    curl: 0.55,
    // C09: -7 + 1.4 noise (chin lifted into the light); a small chin dip per suck
    headTilt: 1.4 * nz("c09ht", g) - 7 + 2.2 * suck - 1.5 * suckW,
    armPose: { rest: 1 - suckW, thumbSuck: suckW },
    // C09: 2.2 noise; while sucking the hand rides the jaw; released, it floats forward
    armSway: 2.2 * nz("c09as", g) * (1 - 0.6 * suckW) + 3 * suck - 8 * rel,
    handOpen: clamp(handOpen),
    toesCurl: [0, 1, 2, 3, 4].map((i) => 0.15 + 0.12 * nz(`c09t${i}`, g, 0.04)),
    legKick: 0.03 * nz("c09lk", g, 0.02),
  };

  // floats exactly like C09's END (calm 0.4)
  const at: Pt = {
    x: AT1.x + 0.4 * 5 * nz("c09fx", g, 0.008),
    y: AT1.y + 0.4 * (6 * nz("c09fy", g, 0.008) + 3 * Math.sin(g * 0.07)) - 5,
  };
  return { week: weekAt(f), size: sizeAt(f), pose, at, suck, contact, rel };
};

// anchors of the rig at frame f, plus a world mapper
export const anchorsAt = (f: number): { r: Rig; a: FetusAnchors; W: (p: Pt) => Pt } => {
  const r = rigAt(f);
  const a = fetusAnchors(r.week, r.pose, r.size);
  return { r, a, W: (p: Pt) => add(r.at, p) };
};
