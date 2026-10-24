// Camera path for C12. Three moves, all eased, never linear:
//   1. medium shot of the head, slow push (0 -> glideStart)
//   2. glide into an extreme close-up of the closed eye (glideStart -> glideEnd):
//      zoom interpolates in log space (steady "flying in" feel) while the eye's
//      SCREEN position travels to its close-up spot, so the eye is never lost
//   3. a slow creep on the eye to the end
// The backdrop gets its own, much gentler zoom (far planes barely zoom).
import { interpolate } from "remotion";
import { EASE } from "../../../lib/ease";
import { BEATS } from "./beats";
import { P2, camAnchors } from "./rig";

export const ANCHOR: P2 = { x: 540, y: 860 };
const Z0 = 2.85; // medium shot at frame 0
const Z1 = 3.35; // end of the slow push (the ear and the startle read bigger)
const ZE = 18; // extreme close-up at glideEnd
const ZEND = 20.5; // creep by the end
export const EYE_ECU: P2 = { x: 392, y: 800 }; // where the eye sits on screen in the close-up

export type Shot = { zoom: number; x: number; y: number; rot: number; anchor: P2; backZoom: number; ecu: number };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const sine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t); // gentler middle than EASE.inOut

// medium-shot look-at point (world) at push progress t
const medLook = (head: P2, t: number): P2 => ({ x: head.x + 12 - 4 * t, y: head.y + 52 - 10 * t });

export const shotAt = (f: number): Shot => {
  const { eye, head } = camAnchors(f);
  const tPush = EASE.inOut(clamp01(f / BEATS.glideStart));
  let zoom: number;
  let look: P2;
  if (f <= BEATS.glideStart) {
    zoom = Z0 + (Z1 - Z0) * tPush;
    look = medLook(head, tPush);
  } else {
    const m = medLook(head, 1);
    const eyeS0 = { x: ANCHOR.x + (eye.x - m.x) * Z1, y: ANCHOR.y + (eye.y - m.y) * Z1 };
    const g = clamp01((f - BEATS.glideStart) / (BEATS.glideEnd - BEATS.glideStart));
    const tz = sine(g);
    const tp = EASE.inOut(clamp01(g * 1.12)); // eye reaches its spot a touch before the zoom lands
    const creep = interpolate(f, [BEATS.glideEnd, BEATS.end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE.out,
    });
    zoom = Math.exp(Math.log(Z1) + (Math.log(ZE) - Math.log(Z1)) * tz) * (1 + (ZEND / ZE - 1) * creep);
    const es = {
      x: eyeS0.x + (EYE_ECU.x - eyeS0.x) * tp + 10 * creep,
      y: eyeS0.y + (EYE_ECU.y - eyeS0.y) * tp + 6 * creep,
    };
    look = { x: eye.x - (es.x - ANCHOR.x) / zoom, y: eye.y - (es.y - ANCHOR.y) / zoom };
  }
  const ecu = clamp01((Math.log(zoom) - Math.log(4)) / (Math.log(9) - Math.log(4)));
  return {
    zoom,
    x: look.x,
    y: look.y,
    rot: -2.2 * EASE.inOut(ecu), // level the eye a touch in the close-up
    anchor: ANCHOR,
    backZoom: Math.pow(zoom, 0.5),
    ecu,
  };
};

// world point -> screen px for a shot (sac plane, ignoring the small hand-held drift)
export const toScreen = (s: Shot, p: P2): P2 => ({ x: s.anchor.x + (p.x - s.x) * s.zoom, y: s.anchor.y + (p.y - s.y) * s.zoom });
