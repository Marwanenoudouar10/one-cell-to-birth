// C09's womb-world helpers that sit inside the kit's <AmnioticSac>.
//
// <MembranePatch>: while the placenta fades in, the sac's membrane line is
// already hidden under it (the kit hides it wherever a <Placenta> child
// exists). This redraws that stretch of line, fading out as the placenta
// fades in, so the rim never pops. Must be a child of <AmnioticSac>.
import React from "react";
import { C } from "../../../theme/colors";
import { WombLayer, membraneArc, useSac } from "../../../shared/womb";

export const MembranePatch: React.FC<{ at: number; spread: number; opacity: number }> = ({ at, spread, opacity }) => {
  const sac = useSac();
  if (!sac || opacity <= 0.005) return null;
  const rad = (d: number) => (d * Math.PI) / 180;
  const d = membraneArc(sac, rad(at - spread + 2), rad(at + spread - 2), 20);
  const w = sac.warmth;
  return (
    <WombLayer opacity={opacity}>
      <defs>
        <filter id="c09-memBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={9} />
        </filter>
      </defs>
      <g fill="none" strokeLinecap="round">
        <path d={d} stroke={C.rose} strokeOpacity={0.22 + 0.13 * w} strokeWidth={22} filter="url(#c09-memBlur)" />
        <path d={d} stroke={C.rose} strokeOpacity={0.55} strokeWidth={3} />
        <path d={d} stroke={C.peach} strokeOpacity={0.35 + 0.35 * w} strokeWidth={1.6} />
      </g>
    </WombLayer>
  );
};
