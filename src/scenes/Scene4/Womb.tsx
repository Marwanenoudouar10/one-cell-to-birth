import React from "react";
import { random } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../theme/colors";
import { P, smooth } from "./geom";

// Womb surroundings: soft folds of uterine wall in depth layers around the sac.
// Drawn in world space; the parent applies a parallax camera per layer.
const fold = (R: number, f: number, seed: string, amp: number) =>
  smooth(
    Array.from({ length: 36 }, (_, i) => {
      const th = (i / 36) * Math.PI * 2;
      const r = R * (1 + amp * noise2D(seed, Math.cos(th) * 1.4 + f * 0.004, Math.sin(th) * 1.4));
      return P(Math.cos(th) * r, Math.sin(th) * r);
    }),
  );

export const WombFolds: React.FC<{ R: number; f: number; layer: number }> = ({ R, f, layer }) => {
  const rings =
    layer === 0
      ? [
          { r: R + 330, w: 150, c: C.womb, o: 0.16 },
          { r: R + 520, w: 220, c: C.wombDeep, o: 0.4 },
        ]
      : [
          { r: R + 70, w: 70, c: C.womb, o: 0.3 },
          { r: R + 175, w: 90, c: C.rose, o: 0.09 },
        ];
  return (
    <g>
      <defs>
        <filter id={`s4-fold${layer}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={layer === 0 ? 30 : 18} />
        </filter>
      </defs>
      <g filter={`url(#s4-fold${layer})`}>
        {rings.map((g, i) => (
          <path
            key={i}
            d={fold(g.r, f, `fold${layer}${i}`, 0.07)}
            fill="none"
            stroke={g.c}
            strokeWidth={g.w}
            opacity={g.o}
          />
        ))}
      </g>
    </g>
  );
};

// Specks suspended in the amniotic fluid. depth < 1 sits behind the fetus.
const SPECKS = Array.from({ length: 30 }, (_, i) => ({
  a: random(`sa${i}`) * Math.PI * 2,
  d: Math.sqrt(random(`sd${i}`)) * 0.9,
  z: 0.55 + random(`sz${i}`) * 0.95,
  ph: random(`sp${i}`) * 100,
}));

export const Specks: React.FC<{ R: number; f: number; front: boolean }> = ({ R, f, front }) => (
  <g>
    {SPECKS.filter((s) => (s.z > 1.15) === front).map((s, i) => {
      const x = Math.cos(s.a) * s.d * R + noise2D(`spx${i}${front}`, f * 0.006 + s.ph, 0) * 40;
      const y = Math.sin(s.a) * s.d * R + noise2D(`spy${i}${front}`, 0, f * 0.006 + s.ph) * 40 - f * 0.12 * s.z;
      const r = 1.6 + s.z * 2.6;
      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={front ? r * 1.8 : r}
          fill={i % 4 === 0 ? C.gold : C.cell}
          opacity={front ? 0.16 : 0.12 + 0.12 * s.z}
        />
      );
    })}
  </g>
);
