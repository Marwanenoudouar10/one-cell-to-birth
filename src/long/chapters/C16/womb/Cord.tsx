import React from "react";
import { random } from "remotion";
import { C } from "../../../../theme/colors";
import { smoothOpen } from "../geometry";
import { CORD, PLACENTA } from "./babyShapes";

const LOBES = Array.from({ length: 9 }, (_, i) => ({
  x: (random(`c16-plx${i}`) - 0.5) * 1.5,
  y: (random(`c16-ply${i}`) - 0.5) * 1.1,
  r: 0.16 + random(`c16-plr${i}`) * 0.14,
}));

// Placenta on the upper-left wall, and the twisted umbilical cord.
export const Placenta: React.FC = () => {
  const p = PLACENTA;
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}>
      <ellipse rx={p.rx + 6} ry={p.ry + 6} fill={C.wombDeep} opacity={0.35} filter="url(#c16-wblur10)" />
      <ellipse rx={p.rx} ry={p.ry} fill="url(#c16-placenta)" />
      {LOBES.map((l, i) => (
        <circle key={i} cx={l.x * p.rx * 0.8} cy={l.y * p.ry * 0.8} r={l.r * p.ry * 1.6} fill={i % 2 ? C.womb : C.wombDeep} opacity={0.3} />
      ))}
      <ellipse rx={p.rx} ry={p.ry} fill="none" stroke={C.rose} strokeWidth={3} opacity={0.45} />
      <ellipse cx={p.rx * 0.1} cy={p.ry * 0.4} rx={p.rx * 0.65} ry={p.ry * 0.25} fill={C.peach} opacity={0.3} filter="url(#c16-wblur10)" />
    </g>
  );
};

export const Cord: React.FC<{ frame: number }> = ({ frame }) => {
  const sway = Math.sin(frame * 0.05) * 4;
  const pts = CORD.map(([x, y], i) => [x + (i > 0 && i < CORD.length - 1 ? sway * Math.sin(i) : 0), y] as [number, number]);
  const d = smoothOpen(pts);
  return (
    <g>
      <path d={d} fill="none" stroke={C.wombDeep} strokeWidth={30} strokeLinecap="round" opacity={0.5} transform="translate(-5 8)" filter="url(#c16-wblur10)" />
      <path d={d} fill="none" stroke={C.womb} strokeWidth={28} strokeLinecap="round" />
      <path d={d} fill="none" stroke={C.rose} strokeWidth={16} strokeLinecap="round" opacity={0.55} transform="translate(3 -4)" />
      <path d={d} fill="none" stroke={C.wombDeep} strokeWidth={6} strokeLinecap="round" strokeDasharray="22 14" strokeDashoffset={frame * 0.4} opacity={0.35} transform="translate(-4 5)" />
      <path d={d} fill="none" stroke={C.peach} strokeWidth={4} strokeLinecap="round" opacity={0.7} transform="translate(6 -7)" />
    </g>
  );
};
