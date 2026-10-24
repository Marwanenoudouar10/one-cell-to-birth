// "A flutter...": the foot gives four light flicks, and each one is felt by
// the wall right by the toes, the first time the wall has moved (pay-off of
// the still wall in C07-C10). At each flick the membrane there catches the
// light (a short soft glow along it) and a few small bubble-like ripples of
// uneven size swell quickly, drift up a touch and pop into a faint ring. The
// clusters work up the wall toward the spot the kick will strike. Soft-filled
// domes with a crescent of key light (upper left); no outlines-only circles,
// no catchlight dots (a dot in a circle reads as an eye). World px, as a
// child of <AmnioticSac>; drawn screen-blended by the caller.
import React from "react";
import { C } from "../../../theme/colors";
import { EASE } from "../../../lib/ease";
import { WombLayer, membraneArc, useSac } from "../../../shared/womb";
import { BUBBLES, TAP_AT } from "./staging";

const rad = (d: number) => (d * Math.PI) / 180;
// an arc of a circle between two angles (degrees), clockwise
const arc = (x: number, y: number, r: number, a0: number, a1: number) =>
  `M${(x + Math.cos(rad(a0)) * r).toFixed(1)},${(y + Math.sin(rad(a0)) * r).toFixed(1)}A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${(x + Math.cos(rad(a1)) * r).toFixed(1)},${(y + Math.sin(rad(a1)) * r).toFixed(1)}`;

const GLOW_LIFE = 16;

export const Flutter: React.FC<{ f: number }> = ({ f }) => {
  const sac = useSac();
  if (!sac) return null;
  const live = BUBBLES.filter((b) => f >= b.t && f < b.t + b.life);
  const glows = TAP_AT.map((p) => ({ ...p, age: f - p.t })).filter((p) => p.age >= -1 && p.age < GLOW_LIFE);
  if (live.length === 0 && glows.length === 0) return null; // nothing on screen
  const { cx, cy } = sac.shape;
  return (
    <WombLayer>
      <defs>
        <filter id="c11-flutter-blur" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1480" height="2320">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <radialGradient id="c11-flutter-dome">
          <stop offset="0" stopColor={C.peach} stopOpacity={0.06} />
          <stop offset="0.62" stopColor={C.peach} stopOpacity={0.2} />
          <stop offset="0.86" stopColor={C.peach} stopOpacity={0.62} />
          <stop offset="0.95" stopColor={C.text} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* light catches the stretch of wall that moves */}
      {glows.map((p, i) => {
        const e = Math.min(1, (p.age + 1) / 2) * Math.exp(-Math.max(0, p.age) / 6);
        const a = rad(p.ang);
        return (
          <g key={i} fill="none" strokeLinecap="round" filter="url(#c11-flutter-blur)" opacity={e}>
            <path d={membraneArc(sac, a - 0.24, a + 0.24, 16)} stroke={C.peach} strokeWidth={40} strokeOpacity={0.6} />
            <path d={membraneArc(sac, a - 0.11, a + 0.11, 12)} stroke={C.text} strokeWidth={7} strokeOpacity={0.5} />
          </g>
        );
      })}
      {live.map((b, i) => {
        const age = f - b.t;
        const u = age / b.life;
        const th = rad(b.ang);
        const r = sac.rAt(th) + b.out;
        const x = cx + Math.cos(th) * r;
        const y = cy + Math.sin(th) * r - b.rise * age;
        // swell fast, hold, then pop: a last quick growth into a fading ring
        const pop = Math.max(0, (u - 0.72) / 0.28);
        const R = b.R * (0.3 + 0.7 * EASE.out(Math.min(1, u / 0.55))) * (1 + 0.3 * pop);
        const o = Math.min(1, (age + 1) / 2) * (1 - EASE.in(pop));
        return (
          <g key={i} fill="none" strokeLinecap="round" opacity={o}>
            <circle cx={x} cy={y} r={R} fill="url(#c11-flutter-dome)" />
            <path d={arc(x, y, R * 0.74, 194, 262)} stroke={C.text} strokeOpacity={0.9} strokeWidth={Math.max(2.4, R * 0.13)} />
            {pop > 0 && <circle cx={x} cy={y} r={R * (1.05 + 0.35 * pop)} stroke={C.peach} strokeOpacity={0.7 * (1 - pop)} strokeWidth={2.2} />}
          </g>
        );
      })}
    </WombLayer>
  );
};
