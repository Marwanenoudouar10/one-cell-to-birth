import React from "react";
import { C } from "../../../theme/colors";
import { Pt } from "./world/geometry";

// A soft warm bloom where a limb paddle forms (C06's BudPop look, ids -> c07):
// it guides the eye to the growing arm, then the leg. Screen-blended layer.
export const PaddleGlow: React.FC<{ at: Pt; v: number; id: string; r?: number }> = ({ at, v, id, r = 70 }) => (
  <g opacity={v}>
    <defs>
      <radialGradient id={`c07-paddle-${id}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={C.skin} stopOpacity={1} />
        <stop offset="0.45" stopColor={C.peach} stopOpacity={0.5} />
        <stop offset="1" stopColor={C.peach} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={at.x} cy={at.y} r={r * (0.75 + 0.25 * v)} fill={`url(#c07-paddle-${id})`} />
  </g>
);
