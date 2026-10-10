// Every animated number of C09 as a pure function of the chapter-local frame.
// All story moments come from beats.ts (never hard-code beat frames here).
import { noise2D } from "@remotion/noise";
import { EASE, heartbeat, pop, tween } from "../../../lib/ease";
import { FetusAnchors, FetusPose, fetusAnchors } from "../../../shared/fetus";
import { BEATS as B, ORGAN_BEATS } from "./beats";

export type Pt = { x: number; y: number };

// world placement (sac plane). With camera zoom 1 at (540, 860) world == screen.
export const SAC_C: Pt = { x: 540, y: 860 };
const FETUS_AT: Pt = { x: 505, y: 862 };
export const END_FOCUS: Pt = { x: 532, y: 866 };
const REVEAL: Pt = { x: 566, y: 836 }; // between baby and placenta (upper right)

const io = EASE.inOut;
const nz = (seed: string, f: number, speed = 0.012) => noise2D(seed, f * speed, 0);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
const mix = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

// Eased (inOut) keyframe track; holds before the first and after the last key.
export const track = (f: number, keys: readonly (readonly [number, number])[]) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f0, v0] = keys[i - 1];
    const [f1, v1] = keys[i];
    if (f <= f1) return tween(f, f0, f1, [v0, v1], io);
  }
  return keys[keys.length - 1][1];
};
const trackPt = (f: number, keys: readonly (readonly [number, Pt])[]): Pt => ({
  x: track(f, keys.map(([k, p]) => [k, p.x] as const)),
  y: track(f, keys.map(([k, p]) => [k, p.y] as const)),
});

export const timeline = (f: number) => {
  // ---- growth: fetus kit week 10.6 -> 12 while the counter climbs 10 -> 12
  const week = track(f, [[B.levelUp, 10.6], [B.cordIn, 11.3], [B.weekTwelve + 9, 12]]);
  const size = lerp(448, 492, (week - 10.6) / 1.4);
  const sacR = lerp(350, 360, (week - 10.6) / 1.4) * (1 + 0.004 * Math.sin(f * 0.09));

  // ---- level-up: a warm band sweeps head -> toe, the C-curl relaxes
  const lp = tween(f, B.levelUp, B.fetus, [0, 1], io);
  const bandA = Math.sin(Math.PI * lp);
  const halo = tween(f, B.fetus - 3, B.fetus + 3) * tween(f, B.fetus + 3, B.fetus + 34, [1, 0], EASE.out);
  const curl = track(f, [[B.levelUp, 0.7], [B.fetus + 10, 0.5]]);
  const uncurl = tween(f, B.levelUp, B.fetus + 10, [0, 1], io);

  // ---- fingers: curl in (anticipation), spring open, relax
  const fa = tween(f, B.fingers - 9, B.fingers - 1, [0, 1], io);
  const fo = pop(f, B.fingers);
  const fr = tween(f, B.toes + 2, B.toes + 24, [0, 1], io);
  const handOpen = (0.42 - 0.3 * fa) * (1 - Math.min(1, fo)) + Math.min(1, fo) * lerp(1, 0.7, fr) + 0.04 * nz("c09ho", f, 0.05);

  // ---- toes: stretch, then a curling wiggle that ripples across the toes
  const tStretch = tween(f, B.toes - 8, B.toes - 1, [0, 1], io) * (1 - tween(f, B.toes - 1, B.toes + 5));
  const tEnv = tween(f, B.toes - 1, B.toes + 4) * (1 - tween(f, B.toes + 20, B.toes + 32, [0, 1], io));
  const toesCurl = [0, 1, 2, 3, 4].map(
    (i) => 0.15 + 0.12 * nz(`c09t${i}`, f, 0.04) - 0.75 * tStretch + tEnv * (0.35 + 0.65 * Math.sin((f - B.toes) * 0.62 - i * 0.9)),
  );
  const legKick = 0.12 * tStretch * (1 - tEnv) + 0.03 * nz("c09lk", f, 0.02);

  // ---- face: the chin lifts a touch into the light
  const lift = tween(f, B.face - 8, B.face + 8, [0, 1], io) * (1 - tween(f, B.settle, B.end, [0, 1], io));

  const pose: FetusPose = {
    curl,
    headTilt: 1.4 * nz("c09ht", f) - 5 * lift - 4 * uncurl * (1 - tween(f, B.cordIn, B.weekTwelve, [0, 1], io)),
    armSway: 2.2 * nz("c09as", f) + 3 * fa * (1 - Math.min(1, fo)),
    handOpen,
    toesCurl,
    legKick,
  };
  const a: FetusAnchors = fetusAnchors(week, pose, size);

  // the baby floats: slow drift + bob, a tiny rise as it uncurls
  const at: Pt = {
    x: FETUS_AT.x + 5 * nz("c09fx", f, 0.008),
    y: FETUS_AT.y + 6 * nz("c09fy", f, 0.008) + 3 * Math.sin(f * 0.07) - 6 * uncurl,
  };
  const W = (p: Pt) => add(at, p);

  // ---- camera: what it looks at (world) and how close
  const body = W({ x: -2, y: -8 });
  const organs = W({ x: -32, y: -22 });
  const strip = W({ x: 92, y: 30 }); // the front of the baby: hand, foot and face
  const hand = W(a.hand);
  const foot = W(a.foot);
  const face = W(mix(a.face, a.eye, 0.4));
  const handShot = mix(strip, hand, 0.6);
  const footShot = mix(strip, foot, 0.55);
  const faceShot = mix(strip, add(face, { x: -10, y: 34 }), 0.85);
  const camKeys: (readonly [number, Pt, number])[] = [
    [0, body, 1.14],
    [B.weekTen, body, 1.17],
    [B.heart, organs, 1.5],
    [B.gut + 14, organs, 1.58],
    [B.levelUp + 24, body, 1.24],
    [B.fetus + 10, body, 1.2],
    [B.cordIn + 26, REVEAL, 0.98],
    [B.weekTwelve - 2, REVEAL, 1.0],
    [B.fingers - 3, handShot, 1.34],
    [B.toes, footShot, 1.36],
    [B.face, faceShot, 1.46],
    [B.settle, faceShot, 1.48],
    [B.end, END_FOCUS, 1.08],
    [B.end + 15, END_FOCUS, 1.09],
  ];
  const camFocus = trackPt(f, camKeys.map(([k, p]) => [k, p] as const));
  const zoom = track(f, camKeys.map(([k, , z]) => [k, z] as const));

  // ---- spotlight follows the thing being talked about (screen-space)
  const spotWorld = trackPt(f, [
    [B.heart - 10, organs], [B.gut + 14, organs], [B.fingers - 6, hand], [B.toes - 2, foot], [B.face - 2, face],
  ]);
  const spotAmt =
    0.75 * tween(f, B.heart - 12, B.heart + 4, [0, 1], io) * (1 - tween(f, B.levelUp, B.levelUp + 20, [0, 1], io)) +
    tween(f, B.fingers - 12, B.fingers + 2, [0, 1], io) * (1 - tween(f, B.settle, B.end, [0, 1], io));
  const toScreen = (p: Pt): Pt => ({ x: 540 + (p.x - camFocus.x) * zoom, y: 860 + (p.y - camFocus.y) * zoom });

  // ---- highlights
  const ringHand = tween(f, B.fingers - 1, B.fingers + 14) * tween(f, B.toes - 6, B.toes + 2, [1, 0], EASE.in);
  const ringFoot = tween(f, B.toes - 1, B.toes + 14) * tween(f, B.face - 6, B.face + 2, [1, 0], EASE.in);
  const sweep = tween(f, B.face - 2, B.face + 16, [0, 1], io);
  const faceGlow = tween(f, B.face - 2, B.face + 8) * tween(f, B.settle + 2, B.end, [1, 0], io);
  const glint = tween(f, B.glint, B.glint + 11, [0, 1], io);
  const glintA = tween(f, B.glint - 2, B.glint + 2) * tween(f, B.glint + 11, B.glint + 22, [1, 0], io);

  // ---- organs: pop on (with a flash + ping), glow, then flare and fade as the band passes
  const organs6 = ORGAN_BEATS.map((t) => ({
    on: f < t ? 0 : pop(f, t),
    flash: f < t ? 0 : Math.exp(-(f - t) / 7),
    ping: tween(f, t, t + 18, [0, 1], EASE.out),
  }));
  // the skin dims to translucent wine while they glow (the level-up band wipes it off)
  const dim = 0.48 * tween(f, B.heart - 14, B.heart + 2, [0, 1], io) * (f < B.fetus + 2 ? 1 : 0);

  // ---- womb world
  const placenta = tween(f, B.cordIn, B.cordIn + 24, [0, 1], io);
  const cord = tween(f, B.cordIn + 4, B.cordIn + 30, [0, 1], io);
  const blur = tween(f, 0, 20, [9, 0], io);
  const hb = heartbeat(f, 165);

  return {
    week, size, sacR, pose, a, at, camFocus, zoom, spotAmt, spot: toScreen(spotWorld),
    lp, bandA, halo, bloom: 0.55 * bandA + 0.6 * halo, rim: 0.75 + 0.25 * bandA + 0.2 * halo,
    ringHand, ringFoot, sweep, faceGlow, glint, glintA,
    organs: organs6, dim, placenta, cord, blur, hb,
  };
};

export type TL = ReturnType<typeof timeline>;
