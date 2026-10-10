import { heartbeat } from "../../lib/ease";
import { FPS } from "../../theme/layout";

// Scene3's heartbeat drivers, generalised: feed the results to
// <Embryo heartBeat={...} heartGlow={...} />. `start` = frame of the first beat
// (nothing before it); the first beat lands extra strong, then settles.

export type BeatOpts = { start?: number; bpm?: number; firstBoost?: boolean };

const raw = (t: number, bpm: number) => (t < 0 ? 0 : heartbeat(t, bpm));

// Fast attack / smooth release, sampled at sub-frames so every beat peaks equally.
const envelope = (t: number, bpm: number, release: number, span: number) => {
  let m = 0;
  for (let k = 0; k <= span; k += 0.25) m = Math.max(m, raw(t - k, bpm) * Math.exp(-k / release));
  return m;
};

export const beatPeriod = (bpm = 110) => (60 / bpm) * FPS;

// 1 on the first beat, settling to 0 over the next few beats.
export const firstBeat = (frame: number, o: BeatOpts = {}) => {
  const t = frame - (o.start ?? 0);
  return t < 0 ? 0 : Math.exp(-t / (beatPeriod(o.bpm) * 0.85));
};

// Squeeze pulse: ~1 on every lub (up to ~1.7 on the first beat if firstBoost).
export const heartbeatPulse = (frame: number, o: BeatOpts = {}) => {
  const bpm = o.bpm ?? 110;
  const boost = o.firstBoost === false ? 0 : 0.7 * firstBeat(frame, o);
  return envelope(frame - (o.start ?? 0), bpm, 1.7, 7) * (1 + boost);
};

// Slower glow that lights the body from the heart outward.
export const heartbeatGlow = (frame: number, o: BeatOpts = {}) => {
  const bpm = o.bpm ?? 110;
  const boost = o.firstBoost === false ? 0 : 0.9 * firstBeat(frame, o);
  return envelope(frame - (o.start ?? 0), bpm, 5.5, 24) * (1 + boost);
};
