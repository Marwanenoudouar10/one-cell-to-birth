import React from "react";
import { C } from "../../theme/colors";
import { EASE, tween } from "../../lib/ease";
import { R0, ZR } from "./timeline";

// START handoff. Scene1 ends on a centre-lit, white-hot zygote with a bright
// membrane rim and a warm halo. These layers repeat that exact look
// (same gradients, sizes and stops, in screen px) for the crossfade, then
// dissolve into Scene2's own sculpted cell lighting once Scene1 is gone.
export const matchOp = (f: number) => 1 - tween(f, 8, 24, [0, 1], EASE.inOut);

// Scene1's warm halo hugging the zona. (Scene1 also declares a wide gold
// "egg light" wash, but its colour string is invalid so it never renders;
// we match what Scene1 actually shows: the halo only.)
export const EggLight: React.FC<{ f: number }> = ({ f }) => {
  const halo = matchOp(f);
  if (halo <= 0.01) return null;
  return (
    <g>
      <defs>
        <radialGradient id="s2h-halo" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={ZR * 1.7}>
          <stop offset={0.55} stopColor={C.gold} stopOpacity={0.32} />
          <stop offset={0.7} stopColor={C.gold} stopOpacity={0.12} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={ZR * 1.7} fill="url(#s2h-halo)" opacity={halo} />
    </g>
  );
};

// Scene1's final zygote body, laid over Scene2's root cell while it fades.
export const ZygoteMatch: React.FC<{ f: number }> = ({ f }) => {
  const o = matchOp(f);
  if (o <= 0.01) return null;
  const R = R0;
  return (
    <g opacity={o}>
      <defs>
        <radialGradient id="s2h-core" gradientUnits="userSpaceOnUse" cx={-0.24 * R} cy={-0.3 * R} r={R * 1.32}>
          <stop offset={0} stopColor={C.cell} stopOpacity={0.97} />
          <stop offset={0.4} stopColor={C.cell} stopOpacity={0.8} />
          <stop offset={0.75} stopColor={C.cellCyan} stopOpacity={0.5} />
          <stop offset={1} stopColor={C.cell} stopOpacity={0.7} />
        </radialGradient>
        <radialGradient id="s2h-gold" gradientUnits="userSpaceOnUse" cx={-0.16 * R} cy={-0.2 * R} r={R * 1.38}>
          <stop offset={0} stopColor={C.text} stopOpacity={1} />
          <stop offset={0.22} stopColor={C.text} stopOpacity={0.96} />
          <stop offset={0.5} stopColor={C.gold} stopOpacity={0.96} />
          <stop offset={0.8} stopColor={C.gold} stopOpacity={0.95} />
          <stop offset={0.92} stopColor={C.peach} stopOpacity={0.85} />
          <stop offset={1} stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="s2h-mem" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={R}>
          <stop offset={0.74} stopColor={C.text} stopOpacity={0} />
          <stop offset={0.94} stopColor={C.text} stopOpacity={0.55} />
          <stop offset={1} stopColor={C.text} stopOpacity={0.9} />
        </radialGradient>
        <radialGradient id="s2h-shade" gradientUnits="userSpaceOnUse" cx={-0.4 * R} cy={-0.5 * R} r={R * 1.75}>
          <stop offset={0.5} stopColor={C.cellBlue} stopOpacity={0} />
          <stop offset={0.8} stopColor={C.cellBlue} stopOpacity={0.2} />
          <stop offset={0.95} stopColor={C.cellBlue} stopOpacity={0.08} />
        </radialGradient>
        <radialGradient id="s2h-spec">
          <stop offset={0} stopColor={C.text} stopOpacity={0.8} />
          <stop offset={1} stopColor={C.text} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={R} fill="url(#s2h-core)" />
      <circle r={R} fill="url(#s2h-gold)" />
      <circle r={R} fill="url(#s2h-shade)" opacity={0.15} />
      <circle r={R} fill="url(#s2h-mem)" />
      <ellipse
        cx={-0.38 * R}
        cy={-0.44 * R}
        rx={R * 0.26}
        ry={R * 0.17}
        fill="url(#s2h-spec)"
        opacity={0.55}
        transform={`rotate(-38 ${-0.38 * R} ${-0.44 * R})`}
      />
    </g>
  );
};
