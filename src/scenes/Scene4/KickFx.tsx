import React from "react";
import { C } from "../../theme/colors";
import { EASE } from "../../lib/ease";
import { Pt } from "./geom";
import { Impact, membraneArc } from "./membrane";

// The first kick, in world space: a small gold flash where the foot meets the
// wall, shockwave rings rolling outward through the womb wall (faint inside
// the sac so the fetus stays clear) and bright arcs racing along the membrane.
const RINGS = [
  { delay: 0, c: C.rose, w: 44, soft: true },
  { delay: 1, c: C.gold, w: 6.5, soft: false },
  { delay: 6, c: C.peach, w: 4, soft: false },
  { delay: 11, c: C.rose, w: 3.2, soft: false },
];
const LIFE = 36;

export const KickFx: React.FC<{ k: Impact; at: Pt; R: number; f: number; sacD: string }> = ({ k, at, R, f, sacD }) => {
  if (k.t < -1 || k.t > 60) return null;
  const t = k.t;
  const flash = t < 0 ? 0 : Math.exp(-t / 5) * Math.min(1, (t + 1) / 2);
  const rings = RINGS.map((g) => {
    const u = (t - g.delay) / LIFE;
    if (u <= 0 || u >= 1) return null;
    const e = EASE.out(u);
    return { ...g, r: 20 + 300 * e, o: (1 - u) ** 1.3, sw: g.w * (1 - 0.7 * u) };
  }).filter(Boolean) as { c: string; r: number; o: number; sw: number; soft: boolean }[];
  // travelling wall glints, both directions from the impact angle
  const tr = Math.max(0, t) * 24;
  const span = 0.22;
  const glint = Math.exp(-Math.max(0, t) / 14) * (t > 0 ? 1 : 0);
  const aA = k.angle + tr / R;
  const aB = k.angle - tr / R;
  const rings2 = (o: number, soft: boolean) =>
    rings
      .filter((g) => g.soft === soft)
      .map((g, i) => (
        <circle key={i} cx={at.x} cy={at.y} r={g.r} fill="none" stroke={g.c} strokeWidth={g.sw} opacity={g.o * o} />
      ));
  return (
    <g>
      <defs>
        <clipPath id="s4-outside">
          <path d={`M-3000,-3000H3000V3000H-3000Z ${sacD}`} clipRule="evenodd" />
        </clipPath>
        <radialGradient id="s4-flash">
          <stop offset={0} stopColor={C.text} stopOpacity={1} />
          <stop offset={0.25} stopColor={C.gold} stopOpacity={0.75} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g clipPath="url(#s4-outside)">
        <g filter="url(#s4-glow)">{rings2(0.9, true)}</g>
        {rings2(0.9, false)}
      </g>
      <g clipPath="url(#s4-sacClip)" opacity={0.2}>
        {rings2(1, false)}
      </g>
      {glint > 0.01 && (
        <g fill="none" strokeLinecap="round">
          <path d={membraneArc(R, f, k, k.angle - 0.4, k.angle + 0.4)} stroke={C.gold} strokeWidth={7} opacity={0.8 * flash} filter="url(#s4-glow)" />
          <path d={membraneArc(R, f, k, aA - span, aA)} stroke={C.gold} strokeWidth={5} opacity={0.85 * glint} />
          <path d={membraneArc(R, f, k, aB, aB + span)} stroke={C.gold} strokeWidth={5} opacity={0.85 * glint} />
        </g>
      )}
      {flash > 0.01 && (
        <g>
          <circle cx={at.x} cy={at.y} r={210 * (0.6 + 0.4 * (1 - flash))} fill="url(#s4-flash)" opacity={0.95 * flash} />
          <circle cx={at.x} cy={at.y} r={44} fill={C.text} opacity={0.85 * flash} filter="url(#s4-glow)" />
          <g transform={`translate(${at.x} ${at.y}) rotate(${(k.angle * 180) / Math.PI + 45})`} opacity={flash}>
            <ellipse rx={120 * (1.3 - flash * 0.3)} ry={3.5} fill={C.text} />
            <ellipse rx={3.5} ry={80 * (1.3 - flash * 0.3)} fill={C.text} />
          </g>
        </g>
      )}
    </g>
  );
};
