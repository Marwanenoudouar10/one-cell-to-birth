import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../theme/colors";
import { HEIGHT, WIDTH } from "../theme/layout";
import { TOTAL_FRAMES } from "../theme/timing";

const PARTICLES = Array.from({ length: 34 }, (_, i) => ({
  x: random(`px${i}`) * WIDTH,
  y: random(`py${i}`) * HEIGHT,
  r: 4 + random(`pr${i}`) * 18,
  a: 0.05 + random(`pa${i}`) * 0.16,
  speed: 0.2 + random(`ps${i}`) * 0.6,
}));

// Continuous backdrop under every scene: deep gradient that warms up over the
// film (cold start -> warm womb), plus slow drifting bokeh specks.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const warm = interpolate(frame, [0, TOTAL_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
  });
  const mid = warm < 0.5 ? C.bg1 : C.bg2;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 45%, ${mid} 0%, ${C.bg0} 70%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(90% 60% at 50% 45%, ${C.wombDeep} 0%, transparent 70%)`,
          opacity: 0.25 + warm * 0.55,
        }}
      />
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute" }}>
        {PARTICLES.map((p, i) => {
          const dx = noise2D(`nx${i}`, frame * 0.004 * p.speed, 0) * 60;
          const dy = noise2D(`ny${i}`, 0, frame * 0.004 * p.speed) * 60 - frame * p.speed * 0.3;
          const y = ((p.y + dy) % HEIGHT + HEIGHT) % HEIGHT;
          return (
            <circle
              key={i}
              cx={p.x + dx}
              cy={y}
              r={p.r}
              fill={i % 3 === 0 ? C.rose : C.cell}
              opacity={p.a}
              style={{ filter: "blur(6px)" }}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
