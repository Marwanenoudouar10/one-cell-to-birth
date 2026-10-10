// "A flutter...": tiny bubble-like ripples pop and spread across the lower-
// right womb wall, the first time the wall has moved (pay-off of C07's still
// wall). Each bubble sits on the live membrane (or just into the wall), grows
// a thin ring with a soft glow and a tiny glassy highlight, then fades.
// World px, as a child of <AmnioticSac> (reads the live membrane).
import React from "react";
import { C } from "../../../theme/colors";
import { EASE } from "../../../lib/ease";
import { WombLayer, membraneArc, useSac } from "../../../shared/womb";
import { FLUTTER, FLUTTER_SPAN } from "./staging";

const LIFE = 24;

export const Flutter: React.FC<{ f: number; wall: number }> = ({ f, wall }) => {
  const sac = useSac();
  if (!sac) return null;
  const live = FLUTTER.filter((b) => f >= b.t && f < b.t + LIFE);
  if (live.length === 0 && wall < 0.01) return null;
  const { cx, cy } = sac.shape;
  const [a0, a1] = FLUTTER_SPAN.map((d) => (d * Math.PI) / 180);
  // a soft shimmer of light along the stretch of wall that moves
  const sh = 0.75 + 0.25 * Math.sin(f * 1.3);
  return (
    <WombLayer>
      {wall > 0.01 && (
        <g fill="none" strokeLinecap="round" filter="url(#c11-wallB)" opacity={wall * sh}>
          <path d={membraneArc(sac, a0, a1, 30)} stroke={C.peach} strokeWidth={26} strokeOpacity={0.35} />
          <path d={membraneArc(sac, a0 + 0.12, a1 - 0.12, 30)} stroke={C.text} strokeWidth={6} strokeOpacity={0.35} />
        </g>
      )}
      <defs>
        <filter id="c11-wallB" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <radialGradient id="c11-bub">
          <stop offset="0" stopColor={C.peach} stopOpacity={0} />
          <stop offset="0.55" stopColor={C.peach} stopOpacity={0.35} />
          <stop offset="0.75" stopColor={C.rose} stopOpacity={0.25} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
      </defs>
      {live.map((b, i) => {
        const age = f - b.t;
        const u = Math.min(1, age / LIFE);
        const th = (b.ang * Math.PI) / 180;
        const r = sac.rAt(th) + b.out;
        const x = cx + Math.cos(th) * r;
        const y = cy + Math.sin(th) * r;
        const R = (4 + 23 * EASE.out(u)) * b.size;
        const o = Math.min(1, age / 2) * Math.pow(1 - u, 1.3);
        const R2 = (2 + 11 * EASE.out(Math.max(0, u - 0.2) / 0.8)) * b.size;
        return (
          <g key={i} opacity={o}>
            <circle cx={x} cy={y} r={R * 1.9} fill="url(#c11-bub)" />
            <circle cx={x} cy={y} r={R} fill="none" stroke={C.peach} strokeWidth={2.4 * (1 - 0.5 * u)} />
            {u > 0.2 && <circle cx={x} cy={y} r={R2} fill="none" stroke={C.rose} strokeOpacity={0.7} strokeWidth={1.6} />}
            <circle cx={x - R * 0.38} cy={y - R * 0.38} r={Math.max(1.2, R * 0.16)} fill={C.text} opacity={0.85} />
          </g>
        );
      })}
    </WombLayer>
  );
};
