import { Easing, interpolate, spring } from "remotion";
import { FPS } from "../theme/layout";

// House easing curves. Use these instead of linear motion.
export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // fast start, soft landing (default)
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // camera moves
  in: Easing.bezier(0.7, 0, 0.84, 0), // exits
  back: Easing.bezier(0.34, 1.56, 0.64, 1), // small overshoot pop
} as const;

// interpolate with clamping and an easing, in one call.
export const tween = (
  frame: number,
  from: number,
  to: number,
  out: [number, number] = [0, 1],
  easing: (t: number) => number = EASE.out,
) =>
  interpolate(frame, [from, to], out, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// House springs.
export const pop = (frame: number, delay = 0) =>
  spring({ frame: frame - delay, fps: FPS, config: { damping: 14, stiffness: 180, mass: 0.6 } });

export const soft = (frame: number, delay = 0) =>
  spring({ frame: frame - delay, fps: FPS, config: { damping: 200 } });

// Realistic heartbeat: two quick pulses (lub-dub) per beat, 0..1.
export const heartbeat = (frame: number, bpm = 110) => {
  const period = (60 / bpm) * FPS;
  const t = (frame % period) / period;
  const pulse = (c: number, w: number) => Math.exp(-((t - c) ** 2) / (2 * w * w));
  return Math.min(1, pulse(0.08, 0.035) + 0.6 * pulse(0.26, 0.04));
};
