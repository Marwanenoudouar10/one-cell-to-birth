// The soft downward glow under the head as the turn completes: a warm pool
// of light in the fluid below the crown, "settling" into place. Screen-blended
// world layer, drawn behind the baby (sac child before the fetus layer).
import React from "react";
import { C } from "../../../theme/colors";
import { WombLayer } from "../../../shared/womb";
import { BabyState } from "./baby";
import { glowEnv } from "./motion";

export const HeadGlow: React.FC<{ f: number; b: BabyState }> = ({ f, b }) => {
  const env = glowEnv(f);
  if (env <= 0.002) return null;
  const { a } = b;
  // from the head centre out through the crown: "below" the head
  const dx = a.crown.x - a.headCenter.x;
  const dy = a.crown.y - a.headCenter.y;
  const dl = Math.hypot(dx, dy) || 1;
  const c = b.w({ x: a.crown.x + (dx / dl) * 40, y: a.crown.y + (dy / dl) * 40 });
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI - 90;
  const breath = 1 + 0.06 * Math.sin(f * 0.11);
  return (
    <WombLayer blend="screen" opacity={env}>
      <defs>
        <radialGradient id="c14-hglow">
          <stop offset="0%" stopColor={C.gold} stopOpacity={0.55} />
          <stop offset="35%" stopColor={C.peach} stopOpacity={0.3} />
          <stop offset="100%" stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={c.x} cy={c.y} rx={250 * breath} ry={150 * breath} transform={`rotate(${ang.toFixed(2)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})`} fill="url(#c14-hglow)" />
      <ellipse cx={c.x} cy={c.y - 10} rx={120} ry={60} transform={`rotate(${ang.toFixed(2)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})`} fill="url(#c14-hglow)" opacity={0.6} />
    </WombLayer>
  );
};
