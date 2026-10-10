import React from "react";
import { C } from "../../../theme/colors";
import { R0, ZR } from "./timeline";

// The zona pellucida (adapted from the teaser's Scene2, intact only): the
// glassy shell from the cell edge out to r = 175.5 with a bright outer edge.
// It never changes size in this chapter: the cells divide inside it.
// `glint` (0..1) and `glintAng` (deg) add the travelling highlight of the
// same-size trace; `exit` fades the (all translucent) shell under C04's copy.
const HIGHLIGHT: [number, number] = [196, 284];
const TINT: [number, number] = [20, 70];
const RIN = R0 * 0.988;
const ROUT = ZR;

const rad = (a: number) => (a * Math.PI) / 180;
const pt = (r: number, a: number) => [Math.cos(rad(a)) * r, Math.sin(rad(a)) * r];
export const arc = (r: number, a0: number, a1: number) => {
  const [x0, y0] = pt(r, a0);
  const [x1, y1] = pt(r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};

export const Zona: React.FC<{ glint: number; glintAng: number; exit: number }> = ({ glint, glintAng, exit }) => {
  const s0 = RIN / ROUT;
  const tail = 46;
  return (
    <g>
      <defs>
        <radialGradient id="c03z-band" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={ROUT}>
          <stop offset={s0} stopColor={C.gold} stopOpacity={0} />
          <stop offset={s0 + (1 - s0) * 0.226} stopColor={C.gold} stopOpacity={0.12} />
          <stop offset={s0 + (1 - s0) * 0.55} stopColor={C.text} stopOpacity={0.16} />
          <stop offset={1} stopColor={C.text} stopOpacity={0.42} />
        </radialGradient>
      </defs>
      <g opacity={exit}>
        <circle r={(RIN + ROUT) / 2} fill="none" stroke="url(#c03z-band)" strokeWidth={ROUT - RIN} />
        <circle r={ROUT} fill="none" stroke={C.text} strokeOpacity={0.45} strokeWidth={1.65} />
        <path d={arc(ROUT - 3.6, HIGHLIGHT[0], HIGHLIGHT[1])} fill="none" stroke={C.text} strokeOpacity={0.7} strokeWidth={3.6} strokeLinecap="round" />
        <path d={arc(ROUT - 3.6, TINT[0], TINT[1])} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={2.7} strokeLinecap="round" />
      </g>
      {glint > 0.01 &&
        Array.from({ length: 6 }, (_, i) => {
          // Comet: light sweeping along the glass, brightest at its head.
          const a1 = glintAng - (i * tail) / 6;
          const a0 = a1 - tail / 6 - 0.5;
          return (
            <path
              key={i}
              d={arc(ROUT - 2.2, a0, a1)}
              fill="none"
              stroke={i === 0 ? C.text : C.gold}
              strokeOpacity={glint * 0.85 * (1 - i / 6) ** 1.6}
              strokeWidth={4.2 - i * 0.4}
              strokeLinecap="round"
            />
          );
        })}
    </g>
  );
};
