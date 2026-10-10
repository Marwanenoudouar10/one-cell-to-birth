import React from "react";
import { C } from "../../../theme/colors";
import { smoothPath } from "../../../shared/embryo/math";
import { domeFrame, domePts } from "./geo";
import { View } from "./view";

// The amnion: a soft glassy dome over the dorsal face (brighter at its rim,
// like a bubble), with a specular arc top-left. On `burst` it inflates into a
// sphere around the embryo and fades, so C06's sac can take over.
const N = 36;

export const Dome: React.FC<{ v: View; burst: number; opacity: number }> = ({ v, burst, opacity }) => {
  if (opacity <= 0.001) return null;
  const pts = domePts(v, burst, N);
  const fr = domeFrame(v, burst);
  const arc = (a0: number, a1: number, k: number) => {
    const out = [];
    for (let i = 0; i <= 12; i++) {
      const th = Math.PI * (a0 + ((a1 - a0) * i) / 12);
      out.push({ x: fr.cx + fr.rx * k * Math.cos(th), y: fr.cy - fr.ry * k * Math.sin(th) });
    }
    return smoothPath(out, false);
  };
  return (
    <g opacity={opacity}>
      <defs>
        <radialGradient id="c05-dome" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={1} gradientTransform={`translate(${fr.cx} ${fr.cy}) scale(${fr.rx} ${fr.ry})`}>
          <stop offset="0" stopColor={C.cellCyan} stopOpacity={0.07} />
          <stop offset="0.68" stopColor={C.cellCyan} stopOpacity={0.08} />
          <stop offset="0.92" stopColor={C.cellCyan} stopOpacity={0.17} />
          <stop offset="1" stopColor={C.cell} stopOpacity={0.3} />
        </radialGradient>
        <filter id="c05-spec" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <path d={smoothPath(pts, true)} fill="url(#c05-dome)" />
      <path d={smoothPath(pts.slice(0, N + 1), false)} fill="none" stroke={C.cellCyan} strokeOpacity={0.4} strokeWidth={3.5} filter="url(#c05-spec)" />
      <path d={smoothPath(pts.slice(N), false)} fill="none" stroke={C.cell} strokeOpacity={0.16 * (1 - burst)} strokeWidth={1.6} />
      <path d={arc(0.62, 0.86, 0.9)} fill="none" stroke={C.text} strokeOpacity={0.42} strokeWidth={6} strokeLinecap="round" filter="url(#c05-spec)" />
      <path d={arc(0.36, 0.42, 0.9)} fill="none" stroke={C.text} strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" filter="url(#c05-spec)" />
    </g>
  );
};
