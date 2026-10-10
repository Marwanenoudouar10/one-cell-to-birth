// Ripple API: kicks, heartbeats and sounds that make the amniotic sac react.
//
// A Ripple is plain data you pass to <AmnioticSac ripples={[...]} />:
//   { x, y, t, kind?, strength?, life? }
//   - x, y      world px of the source: the heart (beat), the point where the
//               foot/hand meets the wall (kick), the entry point (sound).
//   - t         START frame, on the same clock as useCurrentFrame() where the
//               sac is rendered (i.e. your chapter's local frame).
//   - kind      "beat" (default): rose pulse rings from inside, wall pulses.
//               "kick": wall bulge + ringing + gold flash + rings in the wall.
//               "sound": the membrane quivers at the entry point and soft
//                 peach glints run along the rim (the arcs themselves are
//                 drawn by <SoundWaves>; soundRipples() makes these for you).
//   - strength  default 1 (0.4 = subtle, 1.8 = a first, big beat).
//   - life      frames the effect lasts (defaults: beat 40, kick 60, sound 56).
// Keep the array small (only live ripples matter); the helpers below return
// just the ones alive at `frame`.
import { noise2D as noise } from "@remotion/noise";
import { FPS } from "../../theme/layout";
import { Pt, SacShape, angDiff, baseRadius, dist } from "./geom";

export type RippleKind = "beat" | "kick" | "sound";
export type Ripple = { x: number; y: number; t: number; kind?: RippleKind; strength?: number; life?: number };

export const RIPPLE_LIFE: Record<RippleKind, number> = { beat: 40, kick: 60, sound: 56 };

export type LiveRipple = Required<Ripple> & { age: number; u: number };

// Ripples alive at `frame`, with age (frames) and u = age / life (0..1).
export const liveRipples = (rs: Ripple[] | undefined, frame: number): LiveRipple[] =>
  (rs ?? [])
    .map((r) => {
      const kind = r.kind ?? "beat";
      const life = r.life ?? RIPPLE_LIFE[kind];
      const age = frame - r.t;
      return { x: r.x, y: r.y, t: r.t, kind, life, strength: r.strength ?? 1, age, u: age / life };
    })
    .filter((r) => r.age >= 0 && r.age < r.life);

// Heartbeat ripples (a lub + a fainter dub per beat) from `at`, beating at
// `bpm` since frame `start`. The first beat is boosted unless boostFirst=false.
export const heartbeatRipples = (
  frame: number,
  o: { x: number; y: number; start: number; bpm?: number; strength?: number; boostFirst?: boolean },
): Ripple[] => {
  const period = (60 / (o.bpm ?? 140)) * FPS;
  const t = frame - o.start;
  if (t < 0) return [];
  const k = o.strength ?? 1;
  const nBeat = Math.floor(t / period);
  const out: Ripple[] = [];
  for (let i = Math.max(0, nBeat - 3); i <= nBeat; i++) {
    const boost = o.boostFirst === false ? 1 : i === 0 ? 1.8 : i === 1 ? 1.15 : 1;
    out.push({ x: o.x, y: o.y, t: o.start + i * period + 0.08 * period, kind: "beat", strength: k * boost });
    out.push({ x: o.x, y: o.y, t: o.start + i * period + 0.26 * period, kind: "beat", strength: 0.38 * k * boost });
  }
  return out.filter((r) => frame - r.t >= 0 && frame - r.t < RIPPLE_LIFE.beat);
};

// --- how each kind travels -------------------------------------------------

// Reach (px) a ring must travel from the source to clear the far wall.
export const ringReach = (r: LiveRipple, s: SacShape) => dist(r, { x: s.cx, y: s.cy }) + s.r * (s.aspect ?? 1) + 20;

// Ring radius over its life: fast launch, decelerating as it spreads.
export const ringRadius = (r: LiveRipple, reach: number) => 24 + reach * (1 - Math.pow(1 - r.u, 2.2));

// Ring brightness: quick attack, long release.
export const ringAlpha = (r: LiveRipple) => Math.pow(1 - r.u, 1.6) * Math.min(1, r.age / 1.5);

// Outward wall bulge of a kick (px) at its contact, over its age.
export const kickPush = (r: LiveRipple) => {
  const a = r.age;
  const rise = Math.min(1, a / 3);
  return r.strength * 26 * (rise * rise * (3 - 2 * rise)) * Math.exp(-Math.max(0, a - 3) / 9);
};

// --- the living membrane ---------------------------------------------------

export type MembraneOpts = SacShape & { frame: number; wobble?: number; seed?: string; breathe?: number };

// Radius of the deformed membrane at angle theta (radians).
export const membraneR = (theta: number, o: MembraneOpts, rs: LiveRipple[]) => {
  const base = baseRadius(o, theta);
  const ca = Math.cos(theta);
  const sa = Math.sin(theta);
  const f = o.frame;
  const seed = o.seed ?? "wb-sac";
  const breathe = 1 + (o.breathe ?? 1) * 0.006 * Math.sin((f / 84) * Math.PI * 2 + 0.6);
  let r = base * breathe + noise(seed, ca * 1.1 + f * 0.008, sa * 1.1 - f * 0.004) * (o.wobble ?? 1) * base * 0.013;
  for (const k of rs) {
    if (k.kind === "kick") {
      const ang = Math.atan2(k.y - o.cy, k.x - o.cx);
      const d = angDiff(theta, ang);
      const bump = Math.exp(-((d / 0.24) ** 2));
      r += kickPush(k) * bump;
      // ringing of the struck spot + a ripple travelling along the rim
      r += bump * 16 * k.strength * Math.exp(-k.age / 9) * Math.sin(k.age * 0.55);
      const a = Math.abs(d) * base;
      const front = k.age * 24;
      const ahead = Math.max(0, Math.min(1, (front - a) / 40));
      r += 8 * k.strength * ahead * Math.exp(-k.age / 16) * Math.exp(-a / 700) * Math.sin((a - front) / 16);
    } else if (k.kind === "sound") {
      // the membrane catches the sound: a quiver at the entry point and a
      // soft bump travelling along the rim both ways
      const ang = Math.atan2(k.y - o.cy, k.x - o.cx);
      const d = angDiff(theta, ang);
      const env = k.strength * Math.exp(-k.age / 18) * Math.min(1, k.age / 2);
      const a = Math.abs(d) * base;
      r += 4 * env * Math.exp(-((d / 0.2) ** 2)) * Math.sin(k.age * 0.6);
      r += 3.5 * env * Math.exp(-((a - k.age * 14) ** 2) / (2 * 30 * 30));
    } else {
      const px = o.cx + ca * base;
      const py = o.cy + sa * base;
      const d = Math.hypot(px - k.x, py - k.y);
      const rr = ringRadius(k, ringReach(k, o));
      r += 8 * k.strength * ringAlpha(k) * Math.exp(-((d - rr) ** 2) / (2 * 22 * 22));
    }
  }
  return r;
};

export const membranePoints = (o: MembraneOpts, rs: LiveRipple[], samples = 120): Pt[] =>
  Array.from({ length: samples }, (_, i) => {
    const th = (i / samples) * Math.PI * 2;
    const r = membraneR(th, o, rs);
    return { x: o.cx + Math.cos(th) * r, y: o.cy + Math.sin(th) * r };
  });
