import React from "react";
import { random } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { C02_OFF, R0, grainsOp } from "./timeline";

// START handoff: C02's fine cytoplasm granules, streaming slowly around the
// centre of the (stretched) zygote. Same recipe and seeds as C02, on C02's
// clock, clipped to the cell; they fade as the first furrow starts.
// Cluster-local px, not stretched (as in C02).
const GRAINS = Array.from({ length: 34 }, (_, i) => {
  const rnd = (k: string) => random(`c02-gr-${i}-${k}`);
  return { d: R0 * 0.9 * Math.sqrt(rnd("d")), a: rnd("a") * 360, r: 1.1 + rnd("r") * 1.6, o: 0.1 + rnd("o") * 0.16, warm: rnd("c") > 0.6 };
});

export const Granules: React.FC<{ f: number; el: number; tilt: number }> = ({ f, el, tilt }) => {
  const o = grainsOp(f);
  if (o <= 0.01) return null;
  const g = f + C02_OFF;
  const t = g * 0.004;
  return (
    <g opacity={o}>
      <defs>
        <clipPath id="c03g-cell">
          <ellipse rx={R0 * (1 + el)} ry={R0 / (1 + el)} transform={`rotate(${tilt.toFixed(3)})`} />
        </clipPath>
      </defs>
      <g clipPath="url(#c03g-cell)">
        {GRAINS.map((gr, i) => {
          const a = ((gr.a + g * 0.06 * (1 - gr.d / R0)) * Math.PI) / 180;
          const x = Math.cos(a) * gr.d + noise2D(`c02-gx${i}`, t, 0) * 6;
          const y = Math.sin(a) * gr.d + noise2D(`c02-gy${i}`, 0, t) * 6;
          return <circle key={i} cx={x} cy={y} r={gr.r} fill={gr.warm ? C.skinShade : C.text} opacity={gr.o} />;
        })}
      </g>
    </g>
  );
};
