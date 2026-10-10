import React from "react";
import { C } from "../../../theme/colors";
import { EASE } from "../../../lib/ease";
import { Pt } from "./geometry";

// Small accents, screen-blended over the embryo:
//  - Sparkle: the "click" where the neural tube seals (head end, then tail end).
//  - BudPop: a soft warm bloom where a limb bud pushes out.

const STAR = (r: number, w: number) =>
  `M0,${-r} Q${w},${-w} ${r},0 Q${w},${w} 0,${r} Q${-w},${w} ${-r},0 Q${-w},${-w} 0,${-r}Z`;

export const Sparkle: React.FC<{ at: Pt; t: number; id: string; size?: number }> = ({ at, t, id, size = 1 }) => {
  // t = frames since the click
  if (t < -1 || t > 30) return null; // invisible outside: pop = 0 before, fade < 1% after
  const pop = EASE.back(Math.max(0, Math.min(1, (t + 1) / 5)));
  const fade = Math.exp(-Math.max(0, t - 3) / 6);
  const ring = EASE.out(Math.max(0, Math.min(1, t / 18)));
  const s = size * pop;
  return (
    <g transform={`translate(${at.x} ${at.y})`} opacity={fade}>
      <defs>
        <radialGradient id={`c06-spk-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.text} stopOpacity={0.95} />
          <stop offset="0.35" stopColor={C.cellCyan} stopOpacity={0.4} />
          <stop offset="1" stopColor={C.cellCyan} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={30 * s} fill={`url(#c06-spk-${id})`} />
      <circle r={8 + 34 * ring} fill="none" stroke={C.cell} strokeWidth={2.2 * (1 - ring)} opacity={0.8 * (1 - ring) * Math.min(1, pop)} />
      <path d={STAR(22 * s, 2.6 * s)} fill={C.text} transform={`rotate(${12 + t * 1.5})`} />
      <path d={STAR(11 * s, 1.8 * s)} fill={C.cell} transform={`rotate(${57 + t * 1.5})`} opacity={0.8} />
    </g>
  );
};

export const BudPop: React.FC<{ at: Pt; v: number; id: string; r?: number }> = ({ at, v, id, r = 50 }) => {
  if (v < 0.01) return null;
  return (
    <g>
      <defs>
        <radialGradient id={`c06-bud-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.text} stopOpacity={0.7} />
          <stop offset="0.3" stopColor={C.skin} stopOpacity={0.45} />
          <stop offset="0.6" stopColor={C.peach} stopOpacity={0.16} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* a soft warm bloom only (a ring read as a bubble at phone size) */}
      <circle cx={at.x} cy={at.y} r={r * (0.7 + 0.3 * v)} fill={`url(#c06-bud-${id})`} opacity={v} />
    </g>
  );
};
