import React from "react";
import { C } from "../../../../theme/colors";
import { labourWaves } from "./labour";

const CX = 540;
const CY = 860;

// The labour waves drawn as warm concentric rings of light rolling through the
// womb folds (screen-blended over the walls, under the sac).
export const LabourRings: React.FC<{ frame: number }> = ({ frame }) => {
  const waves = labourWaves(frame).filter((w) => w.a > 0.01);
  if (waves.length === 0) return null;
  const rim = waves.reduce((acc, w) => acc + w.a * Math.max(0, 1 - (w.r - 380) / 200), 0);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id="c16-labourCore" gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r={470}>
          <stop offset="0.8" stopColor={C.rose} stopOpacity={0} />
          <stop offset="0.9" stopColor={C.peach} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
      </defs>
      {waves.map((w, i) => (
        <g key={i}>
          {/* wide soft glow of the wave front */}
          <circle cx={CX} cy={CY} r={w.r} fill="none" stroke={C.rose} strokeOpacity={0.3 * w.a} strokeWidth={130} style={{ filter: "blur(30px)" }} />
          <circle cx={CX} cy={CY} r={w.r} fill="none" stroke={C.peach} strokeOpacity={0.32 * w.a} strokeWidth={34} style={{ filter: "blur(12px)" }} />
          {/* trailing echo ring */}
          <circle cx={CX} cy={CY} r={w.r * 0.9} fill="none" stroke={C.rose} strokeOpacity={0.14 * w.a} strokeWidth={60} style={{ filter: "blur(20px)" }} />
        </g>
      ))}
      {/* the sac rim warms while a wave swells against it */}
      <circle cx={CX} cy={CY} r={470} fill="url(#c16-labourCore)" opacity={Math.min(1, rim)} />
    </svg>
  );
};
