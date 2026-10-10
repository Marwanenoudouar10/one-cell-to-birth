// Makes the practice breaths readable at phone size: a warm light inside the
// chest swells with every inhale, and a soft band of light (the diaphragm)
// rises and falls under the lungs. Masked to the torso; LOCAL px.
import React from "react";
import { C } from "../../../theme/colors";
import { tween } from "../../../lib/ease";
import { BabyState } from "./baby";
import { BEATS as B } from "./beats";
import { breatheAt } from "./motion";
import { TorsoMask } from "./TorsoMask";

export const BreathGlow: React.FC<{ f: number; b: BabyState }> = ({ f, b }) => {
  const env = tween(f, B.breatheIn - 8, B.breatheIn + 6) * (1 - tween(f, B.pauseHold, B.rhythmOut));
  const br = breatheAt(f);
  const pulse = tween(f, B.practicePulse - 14, B.practicePulse) * (1 - tween(f, B.practicePulse + 4, B.practicePulse + 24));
  const k = Math.max(env * (0.25 + 0.75 * br), 0.6 * pulse * br * 3);
  if (k <= 0.004) return null;
  const m = b.chest;
  const c = m({ x: 0.02, y: -0.45 });
  const R = b.chestPx * (0.62 + 0.12 * br);
  const lift = 0.12 * br; // diaphragm moves away from the lungs on the inhale
  const d0 = m({ x: -0.62, y: -0.86 - lift * 0.6 });
  const d1 = m({ x: 0.05, y: -1.08 - lift });
  const d2 = m({ x: 0.66, y: -0.84 - lift * 0.6 });
  const dia = `M${d0.x.toFixed(1)},${d0.y.toFixed(1)} Q${d1.x.toFixed(1)},${d1.y.toFixed(1)} ${d2.x.toFixed(1)},${d2.y.toFixed(1)}`;
  return (
    <g opacity={k}>
      <defs>
        <TorsoMask id="c14-bmask" b={b} arm={false} />
        <radialGradient id="c14-bglow">
          <stop offset="0%" stopColor={C.text} stopOpacity={0.75} />
          <stop offset="45%" stopColor={C.skin} stopOpacity={0.5} />
          <stop offset="100%" stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
        <filter id="c14-bblur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={7} />
        </filter>
      </defs>
      <g mask="url(#c14-bmask)">
        <circle cx={c.x} cy={c.y} r={R} fill="url(#c14-bglow)" />
        <path d={dia} stroke={C.text} strokeOpacity={0.55} strokeWidth={10} fill="none" strokeLinecap="round" filter="url(#c14-bblur)" />
      </g>
    </g>
  );
};
