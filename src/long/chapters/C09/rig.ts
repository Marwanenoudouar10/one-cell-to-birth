// The fetus as a pure function of the chapter frame: kit week, size, pose and where it
// floats in the world (sac plane). Shared by the camera (which aims at the hand, foot and
// face at fixed beat frames) and the timeline. Story moments come from beats.ts.
import { noise2D } from "@remotion/noise";
import { EASE, pop, tween } from "../../../lib/ease";
import { FetusAnchors, FetusPose, fetusAnchors } from "../../../shared/fetus";
import { BEATS as B } from "./beats";

export type Pt = { x: number; y: number };

const io = EASE.inOut;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const mix = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const nz = (seed: string, f: number, speed = 0.012) => noise2D(seed, f * speed, 0);

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

// ---- START numbers (C08's END, see the chapter pack): C08's embryo head (~640 px wide,
// crown ~y 245, face edge ~x 930) under camera zoom 2.55 at (494, 882). Our week-10.6
// fetus matches the head: size 431 world (~1100 px on screen) at world (497.5, 843.6).
const AT0: Pt = { x: 497.5, y: 843.6 };
// where it floats once the sac has grown (Scene4: a little left of and below centre)
const AT1: Pt = { x: 486, y: 866 };

// kit week 10.6 (fingers free) -> 11.3 through the level-up -> 12 while we pull back
export const weekAt = (f: number) =>
  track(f, [[B.levelUp, 10.6], [B.fetus + 12, 11.3], [B.pullBack, 11.3], [B.weekTwelve + 4, 12]]);
// world size: slow growth under the organs, a step at the level-up, the rest in the wide
export const sizeAt = (f: number) =>
  track(f, [[0, 431], [B.levelUp, 442], [B.fetus + 12, 468], [B.pullBack, 470], [B.weekTwelve + 4, 515]]);

export type Rig = { week: number; size: number; pose: FetusPose; at: Pt; uncurl: number; fa: number; fo: number };

export const rigAt = (f: number): Rig => {
  // the C-curl relaxes as the embryo "becomes a fetus"
  const uncurl = tween(f, B.levelUp + 4, B.fetus + 12, [0, 1], io);
  const curl = lerp(0.7, 0.55, uncurl);

  // fingers: curl in (anticipation), spring open on "fingers", relax as we leave the foot
  const fa = tween(f, B.fingers - 9, B.fingers - 1, [0, 1], io);
  const fo = f < B.fingers ? 0 : pop(f, B.fingers);
  const fr = tween(f, B.toes + 4, B.face, [0, 1], io);
  const open = Math.min(1, fo);
  const handOpen = (0.42 - 0.3 * fa) * (1 - open) + open * lerp(1, 0.72, fr) + 0.04 * nz("c09ho", f, 0.05);

  // toes: a small stretch + kick (anticipation), then a curling wave that ripples across
  // the toes. Every release is eased over 5-8 frames: an EASE.out release (and a kick
  // gated by 1 - tEnv) snapped the whole foot ~50 px in ONE frame on "toes" (rule 14).
  const tPre = tween(f, B.toes - 9, B.toes - 1, [0, 1], io);
  const tStretch = tPre * (1 - tween(f, B.toes - 1, B.toes + 4, [0, 1], io));
  const tEnv = tween(f, B.toes - 2, B.toes + 4, [0, 1], io) * (1 - tween(f, B.toes + 12, B.toes + 24, [0, 1], io));
  const toesCurl = [0, 1, 2, 3, 4].map(
    (i) => 0.15 + 0.12 * nz(`c09t${i}`, f, 0.04) - 0.75 * tStretch + tEnv * (0.35 + 0.65 * Math.sin((f - B.toes) * 0.62 - i * 0.9)),
  );
  const legKick = 0.12 * tPre * (1 - tween(f, B.toes - 1, B.toes + 7, [0, 1], io)) + 0.03 * nz("c09lk", f, 0.02);

  // face: the chin lifts a touch into the light and stays there (END hold)
  const lift = tween(f, B.face - 8, B.face + 10, [0, 1], io);

  const pose: FetusPose = {
    curl,
    headTilt: 1.4 * nz("c09ht", f) - 4 * lift - 3 * uncurl,
    armSway: 2.2 * nz("c09as", f) + 3 * fa * (1 - open),
    handOpen,
    toesCurl,
    legKick,
  };

  // floats: slow drift + bob, settling toward AT1 as the sac opens up
  const settle = tween(f, B.levelUp, B.weekTwelve, [0, 1], io);
  const base = mix(AT0, AT1, settle);
  const calm = 1 - 0.6 * tween(f, B.weekTwelve, B.fingers, [0, 1], io); // less float in the close-ups
  const at: Pt = {
    x: base.x + calm * 5 * nz("c09fx", f, 0.008),
    y: base.y + calm * (6 * nz("c09fy", f, 0.008) + 3 * Math.sin(f * 0.07)) - 5 * uncurl,
  };
  return { week: weekAt(f), size: sizeAt(f), pose, at, uncurl, fa, fo };
};

// anchors of the rig at frame f, plus a world mapper
export const anchorsAt = (f: number): { r: Rig; a: FetusAnchors; W: (p: Pt) => Pt } => {
  const r = rigAt(f);
  const a = fetusAnchors(r.week, r.pose, r.size);
  return { r, a, W: (p: Pt) => add(r.at, p) };
};

// centre of the open hand (palm + fingertips), local px
export const handCentre = (a: FetusAnchors): Pt => {
  const tips = a.fingertips.reduce((s, p) => add(s, p), { x: 0, y: 0 });
  return mix(a.hand, { x: tips.x / 5, y: tips.y / 5 }, 0.35);
};
// centre of the foot + toes, local px
export const footCentre = (a: FetusAnchors): Pt => {
  const toes = a.toes.reduce((s, p) => add(s, p), { x: 0, y: 0 });
  return mix(a.foot, { x: toes.x / 5, y: toes.y / 5 }, 0.3);
};
