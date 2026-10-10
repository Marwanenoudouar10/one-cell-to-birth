// Showcase-only placeholder figure (NOT part of the kit API): a simple curled
// silhouette so the kit can be judged with something floating in the sac.
// Local units: head at (40,-100), body around (0,60); belly() = the navel.
import React from "react";
import { C } from "../../../theme/colors";
import { Pt } from "../geom";

export type Pose = { x: number; y: number; s: number; rot: number };

const toWorld = (p: Pose, q: Pt): Pt => {
  const r = (p.rot * Math.PI) / 180;
  const x = q.x * p.s;
  const y = q.y * p.s;
  return { x: p.x + x * Math.cos(r) - y * Math.sin(r), y: p.y + x * Math.sin(r) + y * Math.cos(r) };
};

export const belly = (p: Pose) => toWorld(p, { x: 80, y: 62 });
export const heartPt = (p: Pose) => toWorld(p, { x: 35, y: 5 });

const BODY = "M-10,-40 C60,-50 100,10 92,70 C85,130 40,165 -20,158 C-80,150 -105,95 -98,30 C-92,-20 -60,-38 -10,-40Z";

const Parts: React.FC<{ fill: string }> = ({ fill }) => (
  <g fill={fill}>
    <circle cx={40} cy={-100} r={78} />
    <path d={BODY} />
    <ellipse cx={40} cy={132} rx={64} ry={34} transform="rotate(-18 40 132)" />
    <ellipse cx={100} cy={100} rx={24} ry={14} transform="rotate(-50 100 100)" />
    <path d="M30,-5 C55,-15 75,-30 92,-50" fill="none" stroke={fill} strokeWidth={26} strokeLinecap="round" />
  </g>
);

export const StandIn: React.FC<{ pose: Pose; id: string }> = ({ pose, id }) => (
  <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.rot}) scale(${pose.s})`}>
    <defs>
      <radialGradient id={`${id}-skin`} gradientUnits="userSpaceOnUse" cx={-10} cy={-80} r={300}>
        <stop offset="0" stopColor={C.skin} />
        <stop offset="0.55" stopColor={C.peach} />
        <stop offset="1" stopColor={C.skinShade} />
      </radialGradient>
      <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
    <g opacity={0.45} filter={`url(#${id}-glow)`}>
      <Parts fill={C.rose} />
    </g>
    <Parts fill={`url(#${id}-skin)`} />
    <path d="M-62,-150 C-30,-182 20,-188 60,-170" fill="none" stroke={C.text} strokeOpacity={0.4} strokeWidth={7} strokeLinecap="round" />
  </g>
);
