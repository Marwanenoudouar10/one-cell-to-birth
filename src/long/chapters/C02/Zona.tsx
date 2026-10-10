// The zona pellucida: the same glassy shell C01 / Scene1 ends on (a translucent
// band from the cell edge out to r 175.5 with a bright outer edge), copied from
// the teaser's Scene2 so both sides of every crossfade match. It stays round
// and rigid while the cell inside stretches. Cell-local px (centre 0,0).
import React from "react";
import { C } from "../../../theme/colors";
import { ENTRY_DEG, R0, ZR, lerp, polar } from "./motion";

const HIGHLIGHT: [number, number] = [196, 284];
const TINT: [number, number] = [20, 70];

const arc = (r: number, a0: number, a1: number) => {
  const p0 = polar(r, a0);
  const p1 = polar(r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${p0.x.toFixed(1)} ${p0.y.toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} 1 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
};

// `match` 1 = C01's END shell (its reacted zona is a touch denser, with a
// heavier edge), 0 = Scene2's shell that C03 continues.
// `glint` 0..1: the spark from dot 14 enters at ENTRY_DEG and a warm highlight
// runs both ways round the shell, meeting on the far side.
export const Zona: React.FC<{ glint: number; match: number }> = ({ glint, match }) => {
  const rin = R0 * 0.988;
  const rout = ZR;
  const s0 = rin / rout;
  const head = 180 * glint;
  return (
    <g>
      <defs>
        <radialGradient id="c02-zona" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={rout}>
          <stop offset={s0} stopColor={C.gold} stopOpacity={0} />
          <stop offset={s0 + (1 - s0) * 0.226} stopColor={C.gold} stopOpacity={lerp(0.12, 0.2, match)} />
          <stop offset={s0 + (1 - s0) * 0.55} stopColor={C.text} stopOpacity={lerp(0.16, 0.22, match)} />
          <stop offset={1} stopColor={C.text} stopOpacity={0.42} />
        </radialGradient>
      </defs>
      <circle r={(rin + rout) / 2} fill="none" stroke="url(#c02-zona)" strokeWidth={rout - rin} />
      <circle r={rout} fill="none" stroke={C.text} strokeOpacity={lerp(0.45, 0.55, match)} strokeWidth={lerp(1.65, 2.7, match)} />
      <path d={arc(rout - 3.6, HIGHLIGHT[0], HIGHLIGHT[1])} fill="none" stroke={C.text} strokeOpacity={0.7} strokeWidth={3.6} strokeLinecap="round" />
      <path d={arc(rout - 3.6, TINT[0], TINT[1])} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={2.7} strokeLinecap="round" />
      {glint > 0.001 && glint < 0.999 && (
        <g opacity={Math.sin(Math.PI * Math.min(1, glint * 1.1))} fill="none" strokeLinecap="round">
          {/* entry flash where the spark lands */}
          <path d={arc(rout - 2, ENTRY_DEG - 14, ENTRY_DEG + 14)} stroke={C.gold} strokeOpacity={0.5 * (1 - glint)} strokeWidth={10} />
          {[1, -1].map((dir) => {
            const a = ENTRY_DEG + dir * head;
            const [a0, a1] = dir > 0 ? [a - 30, a] : [a, a + 30];
            const [b0, b1] = dir > 0 ? [a - 16, a] : [a, a + 16];
            return (
              <g key={dir}>
                <path d={arc(rout - 2, a0, a1)} stroke={C.gold} strokeOpacity={0.35} strokeWidth={9} />
                <path d={arc(rout - 2, b0, b1)} stroke={C.text} strokeOpacity={0.75} strokeWidth={2.4} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};
