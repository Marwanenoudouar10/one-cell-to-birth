import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../theme/colors";
import { Pt, add, dist, mul, smooth, sub } from "./geom";

// Umbilical cord, drawn in fetus-local space: a pearly, translucent tube with
// its vessels spiralling inside, swaying gently in the fluid.
const bez = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const u = 1 - t;
  return add(add(mul(a, u * u * u), mul(b, 3 * u * u * t)), add(mul(c, 3 * u * t * t), mul(d, t * t * t)));
};

export const Cord: React.FC<{ from: Pt; to: Pt; f: number; w: number }> = ({ from, to, f, w }) => {
  const span = dist(from, to);
  const sway = (k: string) => noise2D(k, f * 0.012, 0) * span * 0.06;
  // leave the belly heading forward/down, arc out, rise into the placenta
  const c1 = add(from, { x: span * 0.42 + sway("c1x"), y: span * 0.3 + sway("c1y") });
  const c2 = add(to, { x: span * 0.12 + sway("c2x"), y: span * 0.62 + sway("c2y") });
  const d = `M${from.x},${from.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;

  // helical vessels: offset curves winding around the cord's centre line
  const N = 48;
  const samples = Array.from({ length: N + 1 }, (_, i) => bez(from, c1, c2, to, i / N));
  const helix = (phase: number, amp: number) =>
    smooth(
      samples.map((p, i) => {
        const q = samples[Math.min(N, i + 1)];
        const o = samples[Math.max(0, i - 1)];
        const tg = sub(q, o);
        const l = Math.hypot(tg.x, tg.y) || 1;
        const nrm = { x: -tg.y / l, y: tg.x / l };
        const s = Math.sin((i / N) * span * 0.11 + phase - f * 0.06);
        return add(p, mul(nrm, s * w * amp));
      }),
      false,
    );
  return (
    <g strokeLinecap="round" fill="none">
      <path d={d} stroke={C.wombDeep} strokeOpacity={0.5} strokeWidth={w * 1.6} filter="url(#s4-sh)" />
      <path d={d} stroke={C.skinShade} strokeWidth={w * 1.1} />
      <path d={d} stroke={C.skin} strokeWidth={w * 0.78} />
      {/* one vein + two arteries spiral through the cord */}
      <path d={helix(0, 0.24)} stroke={C.heart} strokeOpacity={0.45} strokeWidth={w * 0.26} />
      <path d={helix((2 * Math.PI) / 3, 0.26)} stroke={C.womb} strokeOpacity={0.5} strokeWidth={w * 0.17} />
      <path d={helix((4 * Math.PI) / 3, 0.26)} stroke={C.womb} strokeOpacity={0.5} strokeWidth={w * 0.17} />
      <path d={d} transform={`translate(${-w * 0.14} ${-w * 0.16})`} stroke={C.text} strokeOpacity={0.4} strokeWidth={w * 0.16} />
    </g>
  );
};
