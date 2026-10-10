// Sound-wave maths shared by <SoundWaves> and soundRipples().
// A wave train of `count` arcs centred on `from`, travelling along `dir`.
// progress 0..1: at 0 the first arc is born at `from`, at 1 the last arc has
// faded out at `length` px. Arc k sits at radius travel - k * spacing.
import { random } from "remotion";
import { Pt, SacShape, add, dir as unit, dist, mul, sub } from "./geom";
import { Ripple } from "./ripples";

export type WaveTrain = {
  from: Pt;
  dir: number; // degrees, direction of travel
  count?: number; // arcs (default 5)
  spacing?: number; // px between arcs (default 66)
  length?: number; // px an arc travels before it is gone (default 1000)
  seed?: string;
};

export const trainDefaults = (w: WaveTrain) => ({
  count: w.count ?? 5,
  spacing: w.spacing ?? 66,
  length: w.length ?? 1000,
  seed: w.seed ?? "wb-snd",
});

// Voice-like unevenness: each arc a slightly different loudness (0.6..1).
export const voice = (seed: string, k: number) => 0.6 + 0.4 * random(`${seed}v${k}`);

export const arcRadii = (w: WaveTrain, progress: number) => {
  const { count, spacing, length } = trainDefaults(w);
  const travel = progress * (length + (count - 1) * spacing);
  return Array.from({ length: count }, (_, k) => travel - k * spacing);
};

// 0..1 visibility of an arc at radius rk (fade in near the source, out at the end).
export const arcFade = (rk: number, length: number) => {
  if (rk <= 0 || rk >= length) return 0;
  const a = Math.min(1, rk / 80);
  const t = Math.max(0, (rk - 0.62 * length) / (0.38 * length));
  return a * (1 - t * t * (3 - 2 * t));
};

// Where the travel ray first meets the sac (or its nearest rim point).
export const sacEntry = (w: WaveTrain, s: SacShape): { at: Pt; d: number } => {
  const c = { x: s.cx, y: s.cy };
  const u = unit(w.dir);
  const fv = sub(w.from, c);
  const b = fv.x * u.x + fv.y * u.y;
  const cc = fv.x * fv.x + fv.y * fv.y - s.r * s.r;
  const disc = b * b - cc;
  if (disc < 0) {
    const near = add(w.from, mul(u, -b));
    const v = sub(near, c);
    const l = Math.hypot(v.x, v.y) || 1;
    const at = add(c, mul(v, s.r / l));
    return { at, d: dist(at, w.from) };
  }
  const t = Math.max(0, -b - Math.sqrt(disc));
  return { at: add(w.from, mul(u, t)), d: t };
};

// Ripples the wave train makes on the sac as each arc reaches it. Assumes the
// SoundWaves progress is LINEAR from `start` to `end` (use soundProgress()).
export const soundRipples = (w: WaveTrain & { start: number; end: number; strength?: number }, s: SacShape): Ripple[] => {
  const { count, spacing, length, seed } = trainDefaults(w);
  const e = sacEntry(w, s);
  const total = length + (count - 1) * spacing;
  const out: Ripple[] = [];
  for (let k = 0; k < count; k++) {
    const fade = arcFade(e.d, length);
    if (fade < 0.05) continue;
    const p = (e.d + k * spacing) / total;
    out.push({ x: e.at.x, y: e.at.y, t: w.start + p * (w.end - w.start), kind: "sound", strength: (w.strength ?? 1) * voice(seed, k) * fade });
  }
  return out;
};

// Linear progress helper matching soundRipples().
export const soundProgress = (frame: number, start: number, end: number) => Math.max(0, Math.min(1, (frame - start) / (end - start)));
