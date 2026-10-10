import React from "react";
import { AbsoluteFill } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../theme/colors";
import { Pt } from "./geom";

// Out-of-focus foreground motes (nearest depth layer, drawn with parallax 1.5).
const MOTES = [
  { x: -440, y: -560, r: 70, c: C.rose },
  { x: 470, y: -330, r: 46, c: C.peach },
  { x: -500, y: 260, r: 58, c: C.peach },
  { x: 480, y: 330, r: 84, c: C.rose },
  { x: -260, y: -840, r: 36, c: C.gold },
];

export const Bokeh: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <filter id="s4-bokeh" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
    </defs>
    <g filter="url(#s4-bokeh)">
      {MOTES.map((m, i) => (
        <circle
          key={i}
          cx={m.x + noise2D(`bx${i}`, f * 0.007, 0) * 30}
          cy={m.y + noise2D(`by${i}`, 0, f * 0.007) * 30 - f * 0.25}
          r={m.r}
          fill={m.c}
          opacity={0.13}
        />
      ))}
    </g>
  </g>
);

// Screen-space finishing: a soft spotlight that follows the focus moments,
// calm dark bands behind the captions and the week tracker, and a faint warm
// lift on the kick.
export const Overlays: React.FC<{ spot: Pt; spotAmt: number; flash: number }> = ({ spot, spotAmt, flash }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        opacity: 0.5 * spotAmt,
        background: `radial-gradient(circle at ${spot.x}px ${spot.y}px, transparent 0px, transparent 150px, ${C.bg0}aa 520px, ${C.bg0}dd 900px)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, transparent 0px, transparent 1190px, ${C.bg0}88 1340px, ${C.bg0}99 1560px, transparent 1800px)`,
      }}
    />
    {/* push-ins bring the sac rim / placenta up under the week tracker: calm it */}
    <AbsoluteFill
      style={{
        opacity: 0.8 * spotAmt,
        background: `linear-gradient(180deg, ${C.bg0}99 0px, ${C.bg0}77 210px, transparent 330px)`,
      }}
    />
    <AbsoluteFill style={{ background: C.gold, opacity: 0.05 * flash, mixBlendMode: "screen" }} />
  </AbsoluteFill>
);
