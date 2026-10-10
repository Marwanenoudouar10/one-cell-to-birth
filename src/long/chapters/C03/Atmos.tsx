import React from "react";
import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { WIDTH } from "../../../theme/layout";
import { tween } from "../../../lib/ease";
import { mix } from "./palette";
import { B, wallScroll } from "./timeline";

// Light and air around the cluster: its glow, the warm core that fills the
// gaps between packed cells, and fluid motes drifting with parallax.

// The wide soft gold glow C02 hands over (same radius and stops).
export const ClusterGlow: React.FC = () => {
  return (
    <g>
      <defs>
        <radialGradient id="c03a-glow">
          <stop offset={0} stopColor={C.gold} stopOpacity={0.24} />
          <stop offset={0.42} stopColor={C.gold} stopOpacity={0.08} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={330} fill="url(#c03a-glow)" />
    </g>
  );
};

// Warm shadow behind the packed cluster: gaps between round cells read as
// more cells deeper inside, never as holes to the background.
export const CoreFill: React.FC<{ f: number }> = ({ f }) => {
  // fades in as the four cells spring apart (earlier, it showed as a warm
  // smudge in the notches of the 2-cell waist)
  const o = tween(f, B.four - 2, B.four + 8);
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <defs>
        <radialGradient id="c03a-core">
          <stop offset={0} stopColor={mix(C.gold, C.skinShade, 0.45)} stopOpacity={0.9} />
          <stop offset={0.6} stopColor={mix(C.gold, C.skinShade, 0.6)} stopOpacity={0.6} />
          <stop offset={1} stopColor={C.skinShade} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={118} fill="url(#c03a-core)" />
    </g>
  );
};

// Motes in the tube fluid. Depth p: far ones are small, dim and slow; near
// ones big, soft and fast. They slide up like the walls (we travel down).
const MOTES = Array.from({ length: 34 }, (_, i) => {
  const p = 0.35 + random(`c03m-p${i}`) * 1.25;
  return {
    x: random(`c03m-x${i}`) * WIDTH,
    y: random(`c03m-y${i}`) * 2400 - 200,
    p,
    r: 1.4 + p * 3.2,
    a: 0.1 + random(`c03m-a${i}`) * 0.26,
    c: i % 3,
  };
});
const TONES = [C.cell, C.gold, C.peach];

export const Motes: React.FC<{ f: number; near: boolean; op: number }> = ({ f, near, op }) => (
  <g opacity={op}>
    <defs>
      {TONES.map((c, i) => (
        <radialGradient key={c} id={`c03a-m${i}`}>
          <stop offset={0} stopColor={c} stopOpacity={1} />
          <stop offset={0.35} stopColor={c} stopOpacity={0.5} />
          <stop offset={1} stopColor={c} stopOpacity={0} />
        </radialGradient>
      ))}
    </defs>
    {MOTES.map((m, i) => {
      if (m.p > 1 !== near) return null;
      const span = 2400;
      const raw = m.y - wallScroll(f, 0.9 * m.p);
      const y = ((((raw + 200) % span) + span) % span) - 200 + noise2D("c03-m", i * 3.3, f * 0.008) * 30;
      const x = m.x + noise2D("c03-m", f * 0.008, i * 2.7) * 36;
      // keep the tracker band and the caption band quiet
      const band = Math.min(1, Math.max(0, (y - 300) / 120)) * Math.min(1, Math.max(0, (1290 - y) / 140));
      if (band <= 0.01) return null;
      return <circle key={i} cx={x} cy={y} r={m.r * 2.6} fill={`url(#c03a-m${m.c})`} opacity={m.a * band} />;
    })}
  </g>
);

