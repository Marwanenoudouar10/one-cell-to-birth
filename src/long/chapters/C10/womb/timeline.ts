// Every animated number of the womb shot (0 .. ~6.1 s), as a pure function of the
// chapter-local frame. The fetus lives in rig.ts, the camera keys in camera.ts, the story
// moments in beats.ts.
import { EASE, heartbeat, tween } from "../../../../lib/ease";
import { BEATS as B, C09_CLOCK } from "../beats";
import { Pt, lerp, lerpPt, sub } from "../geom";
import { cameraAt, worldToScreenCam } from "./camera";
import { anchorsAt } from "./rig";

const io = EASE.inOut;

// the fingertip the camera dives into: the middle finger of the opened hand (it fans
// highest and furthest forward, clear of the face)
export const TIP = 1;

export const wombTimeline = (f: number) => {
  const g = f + C09_CLOCK;
  const { r, a, W } = anchorsAt(f);

  // ---- X-ray (silent): eases in after the fade, gone as the camera reaches the face
  const xray = tween(f, B.xrayOn, B.xrayOn + 14, [0, 1], io) * (1 - tween(f, B.toFace - 4, B.toFace + 16, [0, 1], io));
  const oss = tween(f, B.ossify, B.ossifyDone, [0, 1], io);
  const scan = tween(f, B.xrayOn, B.xrayOn + 26, [0, 1], io); // a light band sweeps crown -> toes

  // ---- camera: keys, then the dive toward one fingertip (EASE.in: slow start, fast end)
  const base = cameraAt(f);
  const tipW = W(a.fingertips[TIP]);
  // aim: the tip is centred by the hand-off; zoom: log-space, accelerating (x6 by
  // macroIn + 8, ~x2.7 at macroIn: the tip is ~150 px wide when the macro pad takes over)
  const aimT = tween(f, B.pushIn, B.macroIn + 2, [0, 1], io);
  const zT = Math.min(1, Math.max(0, (f - B.pushIn) / (B.macroIn + 8 - B.pushIn)));
  const look = lerpPt(base, tipW, aimT);
  const zoom = base.zoom * Math.pow(6, Math.pow(zT, 1.6));
  const cam = { zoom, x: look.x, y: look.y };
  const blur = tween(f, B.macroIn - 4, B.macroIn + 13, [0, 12], EASE.in);
  const opacity = 1 - tween(f, B.macroIn + 3, B.macroIn + 18, [0, 1], io); // gentle: the macro world is darker

  // fingertip on screen (camera drift ignored: a few px), for the zoom-through
  const toS = (p: Pt) => worldToScreenCam(cam, p);
  const tipS = toS(tipW);
  const dirTip = sub(a.fingertips[TIP], a.hand);
  const tipAngle = (Math.atan2(dirTip.y, dirTip.x) * 180) / Math.PI;
  const tipWidth = 0.16 * a.headRadius * zoom;

  // ---- spotlight (screen-space multiply): C09's face spotlight fading out under the fade
  // (its curve on its own clock), then back on the mouth + hand for the thumb
  const carry = 1 - tween(g, 281, 299, [0, 1], io);
  const onSuck = tween(f, B.faceIn - 6, B.thumbIn - 4, [0, 0.85], io) * (1 - tween(f, B.pushIn, B.macroIn, [0, 1], io));
  const face = W(lerpPt(a.eye, a.nose, 0.5));
  const lips = W(lerpPt(a.mouth, a.hand, 0.45));
  const wS = onSuck / Math.max(1e-6, carry + onSuck);
  const spotW = lerpPt(face, lips, wS);
  const spotR = lerp(0.3, 0.19, wS) * r.size * zoom;

  // ---- tracker band (y 100-290): follows the crown in the face close-up
  const crownY = toS(W(a.crown)).y;
  const top = Math.min(1, Math.max(0, (300 - crownY) / 110));

  return {
    f, r, a, W, cam, blur, opacity, xray, oss, scan,
    tipS, tipAngle, tipWidth,
    spot: toS(spotW), spotR, spotAmt: Math.max(carry, onSuck), top,
    hb: heartbeat(g, 160), // C09's constant 160/min, on its clock
    cheek: toS(W(a.cheek)),
  };
};

export type WombTL = ReturnType<typeof wombTimeline>;
