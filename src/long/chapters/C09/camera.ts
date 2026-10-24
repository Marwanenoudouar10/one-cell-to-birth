// Camera choreography (womb kit <Camera>: the world point (x, y) sits at the HERO centre
// 540, 860, scaled by zoom), keyed to BEATS. Aims at the hand, foot and face are the
// rig's anchors at fixed beat frames, so the camera never jitters with the pose.
//   0          C08's END exactly: zoom 2.55 at (494, 882) (under its focus pull)
//   "ten"      breathe back to the whole week-10 fetus: crown ~y 320, rump ~y 1250
//   organs     a slow push while the six glows tick on; level-up holds the whole body
//   pullBack   out to the sac (placenta upper right): Scene4's week-12 opening on "Week"
//   "twelve"   dive onto the hand (zoom 4: hand ~27% of the width, ring ~38%, on "fingers")
//   toFoot     tilt down to the foot after a 12-frame hold (partial follow 0.5)
//   toFace     pull back from the toes to the whole week-12 fetus (storyboard END:
//              "Scene4's week-12 fetus in the sac"): crown ~y 300, lowest point ~y 1290,
//              so the face beat has a big head (~440 px) and the legs stay above the captions
// Zoom interpolates in log space so pushes feel even.
import { Easing } from "remotion";
import { tween } from "../../../lib/ease";
import { BEATS as B } from "./beats";
import { Pt, add, anchorsAt, footCentre, handCentre, lerp, mix } from "./rig";

type Key = { f: number; z: number; p: Pt; dip?: number; soft?: boolean };

const inOut = Easing.bezier(0.65, 0, 0.35, 1);
// gentler S-curve for the short close-up tilts: peak speed ~1.7x average, not ~2.9x
const softInOut = Easing.bezier(0.42, 0, 0.58, 1);
const logMix = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));

// world aims, from the rig at the beat frames
const at = (f: number, pick: (k: ReturnType<typeof anchorsAt>) => Pt) => pick(anchorsAt(f));
const BODY = at(B.weekTen, ({ r }) => ({ x: r.at.x + 2, y: r.at.y + 28 }));
const ORGANS = at(B.lock, ({ r }) => ({ x: r.at.x - 4, y: r.at.y + 18 }));
// fingers / toes: one close framing on the front of the body, re-aimed 60% of the way
// toward each subject (Scene4's partial follow), so the tilt between them stays slow
const FOLLOW = 0.5;
const HAND_W = at(B.fingers + 4, ({ a, W }) => W(handCentre(a)));
const FOOT_W = at(B.toes + 4, ({ a, W }) => W(footCentre(a)));
const MID = mix(HAND_W, FOOT_W, 0.5);
// both framings sit 7 world px higher, so the foot ring (r ~210 px) ends above y 1290
const HAND = add(mix(MID, HAND_W, FOLLOW), { x: 0, y: 7 });
const FOOT = add(mix(MID, FOOT_W, FOLLOW), { x: 0, y: 7 });
export const Z_HAND = 4.0;
export const Z_FOOT = 4.1;
export const Z_END = 1.92;
// END: the whole body between the tracker band (y 290) and the caption band (y 1300):
// its box centre sits at screen (540, 795)
const END = at(B.face + 10, ({ a, W }) => {
  const b = a.bounds;
  const c = W({ x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 });
  return { x: c.x, y: c.y + (860 - 795) / Z_END };
});

const KEYS: Key[] = [
  { f: 0, z: 2.55, p: { x: 494, y: 882 } },
  { f: B.weekTen + 6, z: 2.22, p: BODY },
  { f: B.lock + 12, z: 2.34, p: ORGANS },
  { f: B.levelUp + 6, z: 2.34, p: ORGANS },
  { f: B.fetus + 6, z: 2.24, p: ORGANS },
  { f: B.wide + 2, z: 1.16, p: { x: 540, y: 846 } },
  { f: B.weekTwelve, z: 1.17, p: { x: 541, y: 848 } },
  { f: B.fingers - 1, z: Z_HAND, p: HAND, soft: true }, // gentler S: the head no longer whips off the top
  { f: B.toFoot, z: Z_HAND * 1.015, p: { x: HAND.x, y: HAND.y + 2 } },
  { f: B.toes, z: Z_FOOT, p: FOOT, soft: true, dip: 0.08 },
  { f: B.toFace, z: Z_FOOT * 1.012, p: { x: FOOT.x, y: FOOT.y - 1 } },
  { f: B.face + 3, z: Z_END, p: END, soft: true },
  // a 0.6% push through the hold: the body box stays inside y 297-1291
  { f: B.end, z: Z_END * 1.006, p: { x: END.x + 1, y: END.y + 1 } },
];

export type Cam = { zoom: number; x: number; y: number };

export const cameraAt = (f: number): Cam => {
  let i = 1;
  while (i < KEYS.length - 1 && f > KEYS[i].f) i++;
  const a = KEYS[i - 1];
  const b = KEYS[i];
  const t = (b.soft ? softInOut : inOut)(Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f))));
  // optional zoom dip mid-move (log space): lowers the screen speed of long glides
  const dip = b.dip ? Math.exp(-b.dip * Math.sin(Math.PI * t)) : 1;
  return { zoom: logMix(a.z, b.z, t) * dip, x: lerp(a.p.x, b.p.x, t), y: lerp(a.p.y, b.p.y, t) };
};

// handheld drift: C08 hands over 0.35; a touch more in the calm wide, less in close-ups
export const driftAt = (f: number) =>
  0.35 + tween(f, B.pullBack, B.wide, [0, 0.35]) - tween(f, B.weekTwelve, B.fingers, [0, 0.5]);

// the tracker band (y 100-290): the close-ups put the head under it. C08's curve
// (0 at zoom <= 2.3, 1 by 3.1), so frame 0 continues its 0.31
export const topShadeAt = (zoom: number) => Math.min(1, Math.max(0, (zoom - 2.3) / 0.8));

export const worldToScreenCam = (c: Cam, p: Pt): Pt => ({ x: 540 + (p.x - c.x) * c.zoom, y: 860 + (p.y - c.y) * c.zoom });
