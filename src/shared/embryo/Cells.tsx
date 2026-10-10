import React from "react";
import { random } from "remotion";
import { Body } from "./body";
import { N, S0 } from "./centreline";
import { surf } from "./Neural";

// A sparse speckle of cells on the disc's top (ectoderm) face, so the early
// stages read as living tissue. Fades out with the germ-layer colours.
const CELLS = Array.from({ length: 64 }, (_, i) => ({
  s: -0.24 + random(`emb-cs${i}`) * 1.16,
  v: (random(`emb-cv${i}`) * 2 - 1) * 0.86,
  r: 2.6 + random(`emb-cr${i}`) * 3.4,
}));

export const Cells: React.FC<{ b: Body; uid: string }> = ({ b, uid }) => {
  const g = b.st.germ;
  if (g < 0.02) return null;
  return (
    <g opacity={g * 0.38}>
      {CELLS.map((c, k) => {
        const i = Math.max(0, Math.min(N, Math.round(((c.s - S0) / (1 - S0)) * N)));
        const p = surf(b, i, c.v);
        return <circle key={k} cx={p.x} cy={p.y} r={c.r * 1.15} fill={`url(#${uid}-soft)`} />;
      })}
    </g>
  );
};
