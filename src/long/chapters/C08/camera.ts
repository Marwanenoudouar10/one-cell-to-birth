// Camera choreography (womb kit <Camera>: the world point (x, y) sits at the HERO
// centre 540, 860, scaled by zoom), keyed to BEATS:
//   0-15        C07's own slow push-in, EXACTLY (handoff.ts c07Camera), so the fade can't double
//   ..handShot  one continuous dive out of C07's curve (C1) into a hand close-up
//   "and".."tail"  glide down: hand high, tail low, both in one frame; the ring travels
//   "Both"      ease back a touch for the dissolve (hand + tail together)
//   "right".."cue"  push in on the free fingers
//   release     breathe back to the whole embryo (free fingers, no tail) as the focus softens
// Zoom interpolates in log space so pushes feel even. In the close-ups the head is cropped
// at the top; the tracker band gets a multiply shade tied to this curve (topShadeAt).
// Framing limits: the lowest skin stays at y <= ~1285 (captions); the eye stays at y >= ~300.
// World points (pose probe): kit 7.5 ring-on-hand centre (524, 917), tail mid (554, 1008),
// eye (565, 794), bottom y 1025; kit 8.99 hand (499, 919), eye (590, 796), bottom y 1039.
import { Easing } from "remotion";
import { tween } from "../../../lib/ease";
import { BEATS as B } from "./beats";
import { c07Camera } from "./handoff";

type Cam = { zoom: number; x: number; y: number };
type Key = { f: number; z: number; x: number; y: number };

const inOut = Easing.bezier(0.65, 0, 0.35, 1);
// the dive: smoothstep (lowest peak speed for a C1 start and a soft landing, ~5% zoom/frame)
const land = (t: number) => t * t * (3 - 2 * t);

// the hand close-up: ring (r ~49 world) ~330 px across, eye ~y 380, body bottom ~y 1170
const HAND = { z: 3.45, x: 522, y: 936 };

const KEYS: Key[] = [
  { f: B.handShot, ...HAND },
  { f: B.toTail, z: 3.52, x: 524, y: 937 }, // a slow lean while the ring sits on the hand
  { f: B.ringAtTail + 4, z: 3.35, x: 546, y: 958 }, // glide down: hand ~y 720, tail ~y 1020, eye ~y 310
  { f: B.frameBoth, z: 3.35, x: 546, y: 958 },
  { f: B.dissolve + 8, z: 3.15, x: 530, y: 956 }, // a touch wider: the body uncurls under us
  { f: B.toHand, z: 3.1, x: 518, y: 952 }, // kit 8.99 in: free hand ~y 760
  { f: B.flex + 2, z: 3.85, x: 512, y: 934 }, // on the free fingers: hand ~y 800, feet ~y 1280
  { f: B.release, z: 3.9, x: 511, y: 933 },
  { f: B.end, z: 2.55, x: 494, y: 882 }, // the whole embryo, crown ~y 300, no tail
];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const logMix = (a: number, b: number, t: number) => Math.exp(mix(Math.log(a), Math.log(b), t));

export const cameraAt = (f: number): Cam => {
  if (f <= B.fadeEnd) return c07Camera(f);
  if (f < B.handShot) {
    // blend from C07's continuing curve to HAND: the weight starts flat, so the camera's
    // speed is continuous at fadeEnd (C1)
    const c = c07Camera(f);
    const t = land((f - B.fadeEnd) / (B.handShot - B.fadeEnd));
    return { zoom: logMix(c.zoom, HAND.z, t), x: mix(c.x, HAND.x, t), y: mix(c.y, HAND.y, t) };
  }
  let i = 1;
  while (i < KEYS.length - 1 && f > KEYS[i].f) i++;
  const a = KEYS[i - 1];
  const b = KEYS[i];
  const t = inOut(Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f))));
  return { zoom: logMix(a.z, b.z, t), x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
};

// handheld drift: none through the fade (C07 hands over a dead-still camera), then a breath
// (kept small: in the close-ups a few px of drift is a lot of world)
export const driftAt = (f: number) => tween(f, B.fadeEnd, B.handShot + 20, [0, 0.35]);

// the tracker band (y 100-290): in the close-ups the head fills it. 0 at zoom <= 2.3, 1 by 3.1
export const topShadeAt = (zoom: number) => Math.min(1, Math.max(0, (zoom - 2.3) / 0.8));

// screen y of a world y under the camera (sac plane)
export const screenY = (c: Cam, y: number) => 860 + (y - c.y) * c.zoom;
