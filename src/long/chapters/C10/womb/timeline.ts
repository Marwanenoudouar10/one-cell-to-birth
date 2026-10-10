// Every animated number of the womb shot (0 .. ~7 s), as a pure function of
// the chapter-local frame. All story moments come from BEATS.
import { noise2D } from "@remotion/noise";
import { HERO } from "../../../../theme/layout";
import { EASE, tween } from "../../../../lib/ease";
import { FetusPose, fetusAnchors } from "../../../../shared/fetus";
import { BEATS, after, s } from "../beats";
import { Pt, add, clamp, lerp, lerpPt, mul, sub } from "../geom";

const B = BEATS;
const io = EASE.inOut;
const nz = (k: string, f: number, speed = 0.012) => noise2D(`c10-${k}`, f * speed, 0);

// world placement of the fetus origin (body centre) and the sac
export const FETUS_AT: Pt = { x: 522, y: 858 };
export const SAC_AT: Pt = { x: 540, y: 860 };
export const TIP = 2; // the fingertip the camera pushes into (the most exposed one once the hand opens)

// the camera frames the thumb-suck on this (stable) reference, not live anchors
const SUCK_REF = (() => {
  const a = fetusAnchors(15.5, { armPose: "thumbSuck" }, 530);
  return add(FETUS_AT, add(mul(lerpPt(a.mouth, a.wrist, 0.45), 1), { x: -10, y: 40 }));
})();

export const wombTimeline = (f: number) => {
  // --- growth 12.5 -> ~17 wk (smooth; the counter carries the exact weeks)
  const g = tween(f, 0, s(6.6), [0, 1], io);
  const week = lerp(12.5, 16.9, g);
  const size = lerp(505, 548, g);
  const sacR = lerp(360, 384, g) * (1 + 0.004 * Math.sin(f * 0.09));

  // --- X-ray (silent): bones warm from cartilage-blue to bone-white
  const xray = tween(f, B.xrayOn, after(B.xrayOn, 0.55), [0, 1], io) * (1 - tween(f, after(B.xrayOff, -0.25), after(B.xrayOff, 0.45), [0, 1], io));
  const oss = tween(f, B.ossify, B.ossifyDone, [0, 1], io);
  const scan = tween(f, B.xrayOn, after(B.xrayOn, 0.9), [0, 1], EASE.inOut); // light band sweeping head -> toe

  // --- thumb: drift up, meet the lips, rhythmic sucking, release + open
  const up = tween(f, B.handUp, B.thumbIn, [0, 1], io);
  const rel = tween(f, B.release, after(B.release, 0.6), [0, 1], io);
  const suckW = up * (1 - rel);
  const env = tween(f, B.thumbIn, after(B.thumbIn, 0.2)) * (1 - tween(f, after(B.release, -0.15), after(B.release, 0.15)));
  const suck = env * (0.5 - 0.5 * Math.cos(((f - B.thumbIn) / 14) * Math.PI * 2));
  const handOpen = lerp(lerp(0.55, 0.2, up), 0.95, rel);

  const pose: FetusPose = {
    curl: 0.5 + 0.02 * nz("curl", f, 0.01),
    headTilt: 1.3 * nz("ht", f) + 1.4 * suck - 2.5 * up * (1 - rel),
    armPose: { rest: 1 - suckW, thumbSuck: suckW },
    armSway: 2 * nz("as", f) * (1 - 0.6 * suckW) + 1.2 * suck - 18 * rel, // released: the hand floats forward, off the face
    handOpen: clamp(handOpen + 0.04 * nz("ho", f, 0.05)),
    toesCurl: [0, 1, 2, 3, 4].map((i) => 0.15 + 0.15 * nz(`t${i}`, f, 0.03)),
  };

  // --- the fetus drifts gently in the fluid
  const at: Pt = {
    x: FETUS_AT.x + 6 * nz("fx", f, 0.008),
    y: FETUS_AT.y + 7 * nz("fy", f, 0.008) + 3 * Math.sin(f * 0.06),
  };
  const a = fetusAnchors(week, pose, size);
  const tipW = add(at, a.fingertips[TIP]);

  // --- camera: body (X-ray) -> mouth + hand (thumb) -> one fingertip
  const wSuck = tween(f, after(B.xrayOff, -0.3), after(B.thumbIn, 0.2), [0, 1], io);
  const wTip = tween(f, B.pushIn, after(B.macroIn, 0.4), [0, 1], EASE.in);
  const body = add(at, { x: 6, y: -6 });
  const look = lerpPt(lerpPt(body, SUCK_REF, wSuck), tipW, wTip);
  const zoom =
    lerp(1, 1.24, tween(f, 0, B.xrayOff, [0, 1], io)) *
    lerp(1, 1.3, wSuck) *
    lerp(1, 1.04, tween(f, B.thumbIn, B.pushIn, [0, 1], io)) *
    lerp(1, 5.2, wTip);
  const blur = tween(f, after(B.macroIn, -0.15), after(B.macroIn, 0.42), [0, 12], EASE.in);
  const opacity = 1 - tween(f, after(B.macroIn, 0.2), after(B.macroIn, 0.5), [0, 1], io);

  // fingertip on screen (camera drift ignored: it is a few px), for the zoom-through
  const tipS = { x: HERO.cx + (tipW.x - look.x) * zoom, y: HERO.cy + (tipW.y - look.y) * zoom };
  const dirTip = sub(a.fingertips[TIP], a.hand);
  const tipAngle = (Math.atan2(dirTip.y, dirTip.x) * 180) / Math.PI;
  const tipWidth = 0.16 * a.headRadius * zoom;

  return { week, size, sacR, xray, oss, scan, suck, pose, at, a, look, zoom, blur, opacity, tipS, tipAngle, tipWidth };
};

export type WombTL = ReturnType<typeof wombTimeline>;
