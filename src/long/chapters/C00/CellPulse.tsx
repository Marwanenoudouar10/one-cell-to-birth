// "a single cell": one soft gold ring breathes out of the zygote (the chime).
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { C } from "../../../theme/colors";
import { tween } from "../../../lib/ease";
import { R } from "./s1/constants";
import { T, eggXfAt } from "./timeline";

export const CellPulse: React.FC<{ frame: number }> = ({ frame }) => {
  // a slow breath outward (~1.2 s), not a blip: the radius eases out gently,
  // the light swells in over the first few frames and fades as it travels
  const t = tween(frame, T.single, T.single + 36, [0, 1], (v) => v);
  if (t <= 0 || t >= 1) return null;
  const p = Easing.bezier(0.22, 0.55, 0.35, 1)(t);
  const { x, y, z } = eggXfAt(frame);
  const r0 = R * 1.25 * z;
  const r = r0 + p * 300;
  const o = Math.min(1, t / 0.14) * Math.pow(1 - t, 1.5) * 0.95;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", filter: "blur(5px)" }}>
        <circle cx={x} cy={y} r={r} fill="none" stroke={C.gold} strokeOpacity={o * 0.55} strokeWidth={18 * (1 - p) + 4} />
        <circle cx={x} cy={y} r={r * 0.94} fill="none" stroke={C.text} strokeOpacity={o * 0.3} strokeWidth={4} />
      </svg>
    </AbsoluteFill>
  );
};
