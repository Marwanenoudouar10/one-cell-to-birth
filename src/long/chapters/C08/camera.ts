// Camera choreography (womb kit <Camera>: the world point (x, y) sits at the HERO
// centre 540, 860, scaled by zoom), keyed to BEATS:
//   0-15   C07's own slow push-in, EXACTLY (handoff.ts c07Camera), so the fade can't double
//   ..pushEnd   the push accelerates out of C07's curve (C1) onto the big side view
//   "and"  glide down to the rump so the tail sits clear above the captions
//   frameBoth   ease back to frame hand + tail for the dissolve
//   "right"     lean in on the free fingers; END holds (C09 focus-pulls in)
// Zoom interpolates in log space so pushes feel even. Framing numbers come from the
// pose probe: kit 7.5 bbox (316,646)-(629,1025), hand (512,919), tail tip (572,1031);
// kit 8.99 bbox (295,632)-(650,1039), hand (499,919).
import { Easing } from "remotion";
import { tween } from "../../../lib/ease";
import { BEATS as B } from "./beats";
import { c07Camera } from "./handoff";

type Cam = { zoom: number; x: number; y: number };
type Key = { f: number; z: number; x: number; y: number };

const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const land = Easing.bezier(0.45, 0, 0.25, 1); // the push-in: a swoop with a long soft landing

// The framing limits (rule 8 + 6): the crown stays at y >= ~295 (tracker band) and the
// lowest skin (tail ring, feet) at y <= ~1290 (captions), so the whole embryo is in frame
// at every beat and the zoom tops out at ~2.5 (kit 7.5) / ~2.4 (kit 8.99).
// the big side view: crown ~y 368, tail tip ~y 1261
const BIG = { z: 2.32, x: 474, y: 858 };

const KEYS: Key[] = [
  { f: B.pushEnd, ...BIG },
  { f: B.toTail, z: 2.36, x: 478, y: 862 }, // a slow lean while the ring sits on the hand
  { f: B.ringAtTail + 6, z: 2.5, x: 500, y: 872 }, // toward the tail: ring ~y 1232, crown ~y 295
  { f: B.frameBoth, z: 2.5, x: 500, y: 872 },
  { f: B.dissolve + 6, z: 2.32, x: 474, y: 862 }, // hand + tail both in frame for the dissolve
  { f: B.toHand, z: 2.33, x: 476, y: 864 }, // kit 8.99: crown ~y 331, feet ~y 1267
  { f: B.flex + 6, z: 2.38, x: 488, y: 866 }, // lean on the free fingers, crown ~y 303
  { f: B.end, z: 2.36, x: 484, y: 865 },
];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const cameraAt = (f: number): Cam => {
  if (f <= B.fadeEnd) return c07Camera(f);
  if (f < B.pushEnd) {
    // blend from C07's continuing curve to BIG: the weight starts flat, so the camera's
    // speed is continuous at fadeEnd (C1)
    const c = c07Camera(f);
    const t = land((f - B.fadeEnd) / (B.pushEnd - B.fadeEnd));
    return { zoom: Math.exp(mix(Math.log(c.zoom), Math.log(BIG.z), t)), x: mix(c.x, BIG.x, t), y: mix(c.y, BIG.y, t) };
  }
  let i = 1;
  while (i < KEYS.length - 1 && f > KEYS[i].f) i++;
  const a = KEYS[i - 1];
  const b = KEYS[i];
  const t = inOut(Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f))));
  return { zoom: Math.exp(mix(Math.log(a.z), Math.log(b.z), t)), x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
};

// handheld drift: none through the fade (C07 hands over a dead-still camera), then a breath
export const driftAt = (f: number) => tween(f, B.fadeEnd, B.pushEnd + 20, [0, 0.45]);

// screen y of a world y under the camera (sac plane)
export const screenY = (c: Cam, y: number) => 860 + (y - c.y) * c.zoom;
