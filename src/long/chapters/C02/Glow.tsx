// Light around the zygote, cell-local px (centre 0,0), drawn under the cell:
//  - Scene1's warm halo hugging the zona (the C01 END look), dissolving away
//  - Scene2's wide, soft gold cluster glow taking over (what C03 continues)
//  - the conception echo: a brief swell plus one soft ring rolling outward
import React from "react";
import { C } from "../../../theme/colors";
import { ZR, countDim, echoAt, echoRing, glowOn, matchOp } from "./motion";

export const Glow: React.FC<{ f: number }> = ({ f }) => {
  const halo = matchOp(f);
  const on = glowOn(f);
  const echo = echoAt(f);
  const ring = echoRing(f);
  const ringOp = 0.55 * Math.sin(Math.PI * Math.min(1, ring * 1.15)) * (ring < 1 ? 1 : 0);
  return (
    <g>
      <defs>
        <radialGradient id="c02-halo" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={ZR * 1.7}>
          <stop offset={0.55} stopColor={C.gold} stopOpacity={0.32} />
          <stop offset={0.7} stopColor={C.gold} stopOpacity={0.12} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c02-cglow">
          <stop offset={0} stopColor={C.gold} stopOpacity={0.24 + 0.14 * echo} />
          <stop offset={0.42} stopColor={C.gold} stopOpacity={0.08 + 0.07 * echo} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c02-ering" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={ZR + 150}>
          <stop offset={0} stopColor={C.gold} stopOpacity={0} />
          <stop offset={0.86} stopColor={C.gold} stopOpacity={0} />
          <stop offset={0.94} stopColor={C.gold} stopOpacity={0.34} />
          <stop offset={0.965} stopColor={C.text} stopOpacity={0.22} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {on > 0.01 && <circle r={330 + 40 * echo} fill="url(#c02-cglow)" opacity={on * (1 - 0.45 * countDim(f))} />}
      {halo > 0.01 && <circle r={ZR * 1.7} fill="url(#c02-halo)" opacity={halo} />}
      {ringOp > 0.01 && (
        <circle r={ZR + 150} fill="url(#c02-ering)" opacity={ringOp} style={{ mixBlendMode: "screen" }} transform={`scale(${(0.57 + 0.45 * ring).toFixed(4)})`} />
      )}
    </g>
  );
};
