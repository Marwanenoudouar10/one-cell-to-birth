import React from "react";
import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { Pt } from "./geometry";
import { SAC } from "./camera";
import { Ring, ringAlpha, ringRadius } from "./motion";

// Copied from src/scenes/Scene3/Particles.tsx; adds `R` (resolving sac radius) and `opacity`.

// Tiny specks suspended in the amniotic fluid, kept inside the sac.
const make = (key: string, count: number, rMin: number, rMax: number) =>
  Array.from({ length: count }, (_, i) => {
    const a = random(`${key}a${i}`) * Math.PI * 2;
    const d = Math.sqrt(random(`${key}d${i}`)) * (SAC.r - 30);
    return {
      x: SAC.x + Math.cos(a) * d,
      y: SAC.y + Math.sin(a) * d,
      r: rMin + random(`${key}r${i}`) * (rMax - rMin),
      o: 0.25 + random(`${key}o${i}`) * 0.5,
      warm: random(`${key}c${i}`) > 0.4,
    };
  });

const SETS = {
  far: make("s3pf", 26, 1.2, 3),
  near: make("s3pn", 12, 2.5, 6),
};

type Props = { frame: number; set: keyof typeof SETS; glow: number; heart: Pt; rs: Ring[]; R: number; opacity: number };

export const Particles: React.FC<Props> = ({ frame, set, glow, heart, rs, R, opacity }) => {
  const id = `c06-specks-clip-${set}`;
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={id}>
          <circle cx={SAC.x} cy={SAC.y} r={R - 14} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {SETS[set].map((p, i) => {
          const t = frame * 0.006;
          let x = p.x + noise2D(`${set}x`, t, i) * 40;
          let y = p.y + noise2D(`${set}y`, i, t) * 40 - frame * 0.12;
          // each passing pulse ring nudges the speck outward a little
          const dx = x - heart.x;
          const dy = y - heart.y;
          const d = Math.hypot(dx, dy) || 1;
          let push = 0;
          for (const r of rs) push += 7 * r.strength * ringAlpha(r) * Math.exp(-((d - ringRadius(r)) ** 2) / (2 * 34 * 34));
          x += (dx / d) * push;
          y += (dy / d) * push;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={p.r}
              fill={p.warm ? C.peach : C.cell}
              opacity={p.o * (0.7 + 0.3 * glow)}
            />
          );
        })}
      </g>
    </g>
  );
};
