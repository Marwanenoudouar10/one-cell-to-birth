// Camera choreography of the womb shot (womb kit <Camera>: the world point (x, y) sits
// at the HERO centre 540, 860, scaled by zoom), keyed to BEATS.
//   -7..15   C09's last camera segment, copied (its key at C09 278 -> 300): zoom 1.920 ->
//            1.9315, aim (481.96, 896.67) -> +1 px. Frame 0 = C09 frame 285 exactly.
//   X-ray    whole body held between the tracker and caption bands (body box y ~297-1289)
//   "Week"   glide to the face: zoom 3.2 on the mouth + hand (head ~680 px wide, the
//            mouth + fist region ~40% of the frame width: rule 11)
//   suck     a slow push that also follows the face as it grows (12 -> 17 wk moves it up)
//   push     timeline.ts multiplies in the dive toward one fingertip (EASE.in, x5.2)
// Zoom interpolates in log space so pushes feel even.
import { Easing } from "remotion";
import { BEATS as B } from "../beats";
import { Pt, lerp } from "../geom";

type Key = { f: number; z: number; p: Pt; soft?: boolean };

const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const softInOut = Easing.bezier(0.42, 0, 0.58, 1);
const logMix = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));

// C09's END framing (copied numbers, see the chapter pack)
const END09: Pt = { x: 481.9592, y: 896.6723 };
export const Z_END09 = 1.92;
export const Z_FACE = 3.2;
// mouth + fist slightly right of centre, crown ~y 330, eye ~y 560
const FACE_IN: Pt = { x: 573, y: 774 };
const FACE_OUT: Pt = { x: 571, y: 756 };

const KEYS: Key[] = [
  { f: -7, z: Z_END09, p: END09, soft: true },
  { f: B.fadeEnd, z: Z_END09 * 1.006, p: { x: END09.x + 1, y: END09.y + 1 } },
  { f: B.toFace, z: Z_END09 * 1.008, p: { x: END09.x + 1.5, y: END09.y + 0.5 } },
  { f: B.faceIn, z: Z_FACE, p: FACE_IN },
  { f: B.pushIn, z: Z_FACE * 1.05, p: FACE_OUT, soft: true },
];

export type Cam = { zoom: number; x: number; y: number };

export const cameraAt = (f: number): Cam => {
  let i = 1;
  while (i < KEYS.length - 1 && f > KEYS[i].f) i++;
  const a = KEYS[i - 1];
  const b = KEYS[i];
  const t = (b.soft ? softInOut : inOut)(Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f))));
  return { zoom: logMix(a.z, b.z, t), x: lerp(a.p.x, b.p.x, t), y: lerp(a.p.y, b.p.y, t) };
};

export const worldToScreenCam = (c: Cam, p: Pt): Pt => ({ x: 540 + (p.x - c.x) * c.zoom, y: 860 + (p.y - c.y) * c.zoom });
