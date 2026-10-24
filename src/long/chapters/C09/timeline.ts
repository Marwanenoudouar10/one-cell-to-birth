// Every animated number of C09 as a pure function of the chapter-local frame.
// The fetus itself lives in rig.ts, the camera in camera.ts; story moments in beats.ts.
import { EASE, heartbeat, pop, tween } from "../../../lib/ease";
import { WOMB_LOOKS, WombLook, mixLook } from "../../../shared/womb";
import { BEATS as B, ORGAN_BEATS } from "./beats";
import { cameraAt, driftAt, topShadeAt, worldToScreenCam } from "./camera";
import { Pt, anchorsAt, footCentre, handCentre, mix } from "./rig";

export type { Pt } from "./rig";

const io = EASE.inOut;

// ---- the world: C08's END look (Scene3 sac, frozen early wall) -> Scene4's mid look
const C08_LOOK: WombLook = {
  ...WOMB_LOOKS.early,
  backdrop: { warmth: 0.04, depth: 0.75, folds: 0.5, r: 410, cx: 540, cy: 960, aspect: 1.12, pear: 0.3 },
  sac: { cx: 540, cy: 860, r: 330, aspect: 1, pear: 0, warmth: 0, villi: 0, wobble: 1 },
  shafts: { intensity: 0 },
};
const MID: WombLook = { ...WOMB_LOOKS.mid, sac: { ...WOMB_LOOKS.mid.sac, r: 375 } };

// fade 1 -> 0 over the last 15 frames (C10 fades in on top; rule 5)
const outro = (f: number) => tween(f, B.exit, B.end - 1, [1, 0], io);

export const timeline = (f: number) => {
  const { r, a, W } = anchorsAt(f);
  const cam = cameraAt(f);
  const look = mixLook(C08_LOOK, MID, tween(f, B.levelUp - 30, B.wide, [0, 1], io));

  // ---- level-up: a warm band sweeps head -> toe on "embryo" .. "fetus", then a halo
  const lp = tween(f, B.levelUp, B.fetus, [0, 1], io);
  const bandA = Math.sin(Math.PI * lp);
  // eased rise over 7 frames (an EASE.out rise jumped ~5/255 in one frame)
  const halo = tween(f, B.fetus - 5, B.fetus + 2, [0, 1], io) * tween(f, B.fetus + 3, B.fetus + 34, [1, 0], EASE.out);

  // ---- organs: pop on (flash + ping), all pulse together on "place", then the band
  // flares each one as it passes and they settle back into the body
  const lockP = f < B.lock ? 0 : Math.exp(-(f - B.lock) / 8) * tween(f, B.lock - 1, B.lock + 2);
  const organs = ORGAN_BEATS.map((t) => ({
    on: f < t ? 0 : Math.min(1.15, pop(f, t)),
    flash: f < t ? 0 : Math.exp(-(f - t) / 7),
    ping: tween(f, t, t + 18, [0, 1], EASE.out),
  }));
  // the glows rest after the band has passed, fading out by the wide shot
  const organRest = 1 - tween(f, B.fetus - 2, B.pullBack + 10, [0, 1], io);
  // the skin dims to a translucent wine while they glow; the band wipes it off
  const dim = 0.42 * tween(f, B.heart - 14, B.heart + 4, [0, 1], io) * (1 - tween(f, B.fetus - 6, B.fetus + 10, [0, 1], io));

  // ---- highlights
  // each ring fades as the camera leaves its subject, before the tilt carries it into the
  // tracker band (hand, moving up) or the caption band (foot, moving down): rule 6
  const ringHand = tween(f, B.fingers - 1, B.fingers + 12) * tween(f, B.toFoot + 1, B.toFoot + 9, [1, 0], io);
  const ringFoot = tween(f, B.toes - 1, B.toes + 12) * tween(f, B.toFace - 3, B.toFace + 5, [1, 0], io);
  const sweep = tween(f, B.face - 1, B.face + 15, [0, 1], io);
  const faceGlow = tween(f, B.face - 2, B.face + 6) * outro(f);
  const glint = tween(f, B.glint, B.glint + 10, [0, 1], io);
  const glintA = tween(f, B.glint - 2, B.glint + 2) * tween(f, B.glint + 10, B.glint + 16, [1, 0], io) * outro(f);

  // ---- spotlight (screen space): follows what the narration names; dims non-focal skin
  const toS = (p: Pt) => worldToScreenCam(cam, p);
  const hand = W(handCentre(a));
  const foot = W(footCentre(a));
  const face = W(mix(a.eye, a.nose, 0.5));
  // the spotlight already sits on the hand during the dive (the frame no longer washes
  // to flat skin on the way in), so wHand is 1 well before it fades in
  const wHand = tween(f, B.weekTwelve, B.weekTwelve + 6, [0, 1], io) * (1 - tween(f, B.toFoot + 2, B.toes - 2, [0, 1], io));
  const wFoot = tween(f, B.toFoot + 2, B.toes - 2, [0, 1], io) * (1 - tween(f, B.toFace + 2, B.face - 2, [0, 1], io));
  const wFace = tween(f, B.toFace + 2, B.face - 2, [0, 1], io);
  const wSum = Math.max(1e-6, wHand + wFoot + wFace);
  const spotW = {
    x: (hand.x * wHand + foot.x * wFoot + face.x * wFace) / wSum,
    y: (hand.y * wHand + foot.y * wFoot + face.y * wFace) / wSum,
  };
  const spotR = (wHand * 0.13 + wFoot * 0.13 + wFace * 0.3) / wSum * r.size;
  const spotAmt = tween(f, B.weekTwelve + 8, B.fingers, [0, 1], io) * (1 - tween(f, B.face + 6, B.end - 1, [0, 1], io));

  // ---- tracker band (y 100-290): the zoom-tied shade (C08's curve, kept as-is from frame
  // 0) lets go before the crown has cleared the band on the way out of the close-ups, so
  // from the dive on it also follows the crown itself: full above y 185, off by y 295
  const crownY = toS(W(a.crown)).y;
  const crownShade = f < B.weekTwelve ? 0 : Math.min(1, Math.max(0, (295 - crownY) / 110));
  const top = Math.max(topShadeAt(cam.zoom), crownShade);

  // ---- world
  const placenta = tween(f, B.pullBack - 6, B.wide, [0, 1], io);
  const shafts = tween(f, B.levelUp, B.wide, [0, 1], io);
  const hb = heartbeat(f, 160); // constant rate (a changing bpm would jump the phase)

  return {
    r, a, cam, drift: driftAt(f), look, top,
    lp, bandA, halo, bloom: 0.5 * bandA + 0.6 * halo, rim: 0.75 + 0.25 * bandA + 0.2 * halo,
    organs, organRest, lockP, dim,
    ringHand, ringFoot, sweep, faceGlow, glint, glintA,
    spot: toS(spotW), spotR: spotR * cam.zoom, spotAmt,
    placenta, shafts, hb, nearSpecks: Math.min(1, Math.max(0, (1.9 - cam.zoom) / 0.5)),
    // an extra same-hue multiply under the captions for the face beat + END hold (the
    // sac's lit lower rim and the cord cross the band)
    capMul: 0.5 * tween(f, B.toFace + 4, B.face, [0, 1], io),
  };
};

export type TL = ReturnType<typeof timeline>;
