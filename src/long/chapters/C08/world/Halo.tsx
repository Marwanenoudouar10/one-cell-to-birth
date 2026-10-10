import React from "react";
import { C } from "../../../../theme/colors";
import { Pt } from "./geometry";

// C07's HeartHalo (src/long/chapters/C07/world/Rings.tsx = C06's = Scene3's; ids -> c08),
// trimmed to the state C07 hands over: ignite 1, hold 0, first beat long gone (first 0).
// Light blooming out of the heart over the embryo (screen-blended layer), kept soft in
// the very centre so the heart itself stays a saturated red.
type Props = { heart: Pt; glow: number; pulse: number; vis: number };

export const HeartHalo: React.FC<Props> = ({ heart, glow, pulse, vis }) => {
  const R = 150 * (1 + 0.4 * glow);
  const fr = 34;
  return (
    <g opacity={vis}>
      <defs>
        <radialGradient id="c08-halo-g" gradientUnits="userSpaceOnUse" cx={heart.x} cy={heart.y} r={R}>
          <stop offset="0" stopColor={C.heart} stopOpacity={0.3} />
          <stop offset="0.22" stopColor={C.heart} stopOpacity={0.55} />
          <stop offset="0.5" stopColor={C.heart} stopOpacity={0.2} />
          <stop offset="1" stopColor={C.heart} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c08-halo-flare" gradientUnits="userSpaceOnUse" cx={heart.x} cy={heart.y} r={fr}>
          <stop offset="0" stopColor={C.text} stopOpacity={0.9} />
          <stop offset="0.3" stopColor={C.rose} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.heart} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* C07: min(1, 0.55 fill (1 - 0.6 ignite) + 0.3 ignite + 0.4 hold + 0.7 glow), fill = ignite = 1 */}
      <circle cx={heart.x} cy={heart.y} r={R} fill="url(#c08-halo-g)" opacity={Math.min(1, 0.22 + 0.3 + 0.7 * glow)} />
      <circle cx={heart.x} cy={heart.y} r={fr} fill="url(#c08-halo-flare)" opacity={Math.min(1, pulse) * 0.22} />
    </g>
  );
};
