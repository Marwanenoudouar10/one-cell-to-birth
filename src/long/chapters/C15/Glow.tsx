// <FaceGlow>: the baby's response to her voice. A gentle warm light that
// gathers on the face (clipped to the skin, so it reads as the face lighting
// up, not a blob in the fluid), a soft halo into the fluid, and the ear
// brightening as each of her arcs arrives. The stranger's voice gets none.
// Render in a <WombLayer blend="screen"> right above the fetus layer.
import React from "react";
import { C } from "../../../theme/colors";
import { buildFetus, outFrame } from "../../../shared/fetus";
import { BABY } from "./shot";
import { BabyState } from "./motion";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const FaceGlow: React.FC<{ b: BabyState; glow: number; ear: number }> = ({ b, glow, ear }) => {
  if (glow < 0.005 && ear < 0.005) return null;
  const geo = buildFetus(b.week, b.pose);
  const fr = outFrame(geo, b.size);
  const place = `translate(${BABY.x} ${BABY.y}) ${fr.css}`;
  const face = b.w(b.a.face);
  const head = b.w(b.a.headCenter);
  const earP = b.w(b.a.ear);
  const hr = b.a.headRadius;
  const c = { x: lerp(face.x, head.x, 0.1), y: lerp(face.y, head.y, 0.1) };
  return (
    <g>
      <defs>
        <clipPath id="c15-skin">
          {geo.silhouette.map((d, i) => (
            <path key={i} d={d} transform={place} />
          ))}
        </clipPath>
        <radialGradient id="c15-face-glow" gradientUnits="userSpaceOnUse" cx={c.x} cy={c.y} r={hr * 1.45}>
          <stop offset="0" stopColor={C.gold} stopOpacity={0.62 * glow} />
          <stop offset="0.5" stopColor={C.peach} stopOpacity={0.28 * glow} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c15-halo" gradientUnits="userSpaceOnUse" cx={c.x} cy={c.y} r={hr * 2.6}>
          <stop offset="0.3" stopColor={C.gold} stopOpacity={0.3 * glow} />
          <stop offset="0.62" stopColor={C.rose} stopOpacity={0.14 * glow} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c15-ear-glow" gradientUnits="userSpaceOnUse" cx={earP.x} cy={earP.y} r={hr * 0.5}>
          <stop offset="0" stopColor={C.gold} stopOpacity={0.75 * ear} />
          <stop offset="0.5" stopColor={C.peach} stopOpacity={0.3 * ear} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* warm halo into the fluid around the head */}
      <circle cx={c.x} cy={c.y} r={hr * 2.6} fill="url(#c15-halo)" />
      <g clipPath="url(#c15-skin)">
        <circle cx={c.x} cy={c.y} r={hr * 1.45} fill="url(#c15-face-glow)" />
        <circle cx={earP.x} cy={earP.y} r={hr * 0.5} fill="url(#c15-ear-glow)" />
      </g>
    </g>
  );
};
