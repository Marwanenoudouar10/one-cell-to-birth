// Visuals of sac ripples (see ripples.ts for the data API). Internal.
// - RingFx: "beat" rings radiating through the fluid from the heart,
//   clipped to the membrane. Each ring is a thin bright crest with a
//   soft wake (one radial gradient per ring, no filters). Screen-blended.
// - KickFx: a "kick" lands on the wall: gold flash at the contact, shock
//   rings rolling out through the womb wall (faint inside the sac) and bright
//   glints racing along the membrane both ways.
// - SoundFx: a "sound" reaches the membrane: soft peach glow at the entry
//   and gentle glints running along the rim.
import React from "react";
import { C } from "../../theme/colors";
import { EASE } from "../../lib/ease";
import { useUid } from "./geom";
import { LiveRipple, ringAlpha, ringRadius, ringReach } from "./ripples";
import { SacClip, SacState, membraneArc } from "./sacContext";

const PAL = { beat: { wake: C.heart, crest: C.rose, core: C.peach } } as const;

export const RingFx: React.FC<{ sac: SacState }> = ({ sac }) => {
  const id = useUid("ring");
  const rs = sac.ripples.filter((r) => r.kind === "beat");
  if (rs.length === 0) return null;
  return (
    <g>
      <defs>
        <SacClip id={`${id}-clip`} sac={sac} />
        {rs.map((r, i) => {
          const R = ringRadius(r, ringReach(r, sac.shape));
          // a big (first) beat launches a thicker, brighter wave
          const band = (28 + 46 * r.u) * (r.strength > 1.5 ? 1.6 : 1);
          const edge = (7 + 5 * r.u) * (r.strength > 1.5 ? 1.8 : 1);
          const a = Math.min(1, ringAlpha(r) * r.strength * 0.85);
          const o = (px: number) => Math.max(0, Math.min(1, 1 - px / R));
          const p = PAL.beat;
          return (
            <radialGradient key={i} id={`${id}-${i}`} gradientUnits="userSpaceOnUse" cx={r.x} cy={r.y} r={R}>
              <stop offset={o(band)} stopColor={p.wake} stopOpacity={0} />
              <stop offset={o(band * 0.4)} stopColor={p.wake} stopOpacity={a * 0.22} />
              <stop offset={o(edge)} stopColor={p.crest} stopOpacity={a * 0.85} />
              <stop offset={o(edge * 0.4)} stopColor={p.core} stopOpacity={a} />
              <stop offset="1" stopColor={p.crest} stopOpacity={0} />
            </radialGradient>
          );
        })}
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        {rs.map((r, i) => (
          <circle key={i} cx={r.x} cy={r.y} r={ringRadius(r, ringReach(r, sac.shape))} fill={`url(#${id}-${i})`} />
        ))}
      </g>
    </g>
  );
};

const KICK_RINGS = [
  { delay: 0, c: C.rose, w: 44, soft: true },
  { delay: 1, c: C.gold, w: 6.5, soft: false },
  { delay: 6, c: C.peach, w: 4, soft: false },
  { delay: 11, c: C.rose, w: 3.2, soft: false },
];

const OneKick: React.FC<{ sac: SacState; k: LiveRipple; id: string }> = ({ sac, k, id }) => {
  const { cx, cy } = sac.shape;
  const t = k.age;
  const ang = Math.atan2(k.y - cy, k.x - cx);
  const rr = sac.rAt(ang);
  const at = { x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr };
  const s = Math.min(1.6, k.strength);
  const flash = Math.exp(-t / 5) * Math.min(1, (t + 1) / 2);
  const rings = KICK_RINGS.map((g) => {
    const u = (t - g.delay) / 36;
    if (u <= 0 || u >= 1) return null;
    return { ...g, r: 20 + 300 * s * EASE.out(u), o: (1 - u) ** 1.3, sw: g.w * (1 - 0.7 * u) };
  }).filter(Boolean) as { c: string; r: number; o: number; sw: number; soft: boolean }[];
  const ringEls = (o: number, soft: boolean) =>
    rings
      .filter((g) => g.soft === soft)
      .map((g, i) => <circle key={i} cx={at.x} cy={at.y} r={g.r} fill="none" stroke={g.c} strokeWidth={g.sw} opacity={g.o * o} />);
  const tr = t * 24;
  const glint = Math.exp(-t / 14);
  const aA = ang + tr / rr;
  const aB = ang - tr / rr;
  return (
    <g>
      <g clipPath={`url(#${id}-out)`}>
        <g filter={`url(#${id}-glow)`}>{ringEls(0.9, true)}</g>
        {ringEls(0.9, false)}
      </g>
      <g clipPath={`url(#${id}-in)`} opacity={0.2}>
        {ringEls(1, false)}
      </g>
      <g fill="none" strokeLinecap="round">
        <path d={membraneArc(sac, ang - 0.4, ang + 0.4)} stroke={C.gold} strokeWidth={7} opacity={0.8 * flash} filter={`url(#${id}-glow)`} />
        <path d={membraneArc(sac, aA - 0.22, aA)} stroke={C.gold} strokeWidth={5} opacity={0.85 * glint} />
        <path d={membraneArc(sac, aB, aB + 0.22)} stroke={C.gold} strokeWidth={5} opacity={0.85 * glint} />
      </g>
      {flash > 0.01 && (
        <g>
          <circle cx={at.x} cy={at.y} r={210 * s * (0.6 + 0.4 * (1 - flash))} fill={`url(#${id}-flash)`} opacity={0.95 * flash} />
          <circle cx={at.x} cy={at.y} r={44 * s} fill={C.text} opacity={0.85 * flash} filter={`url(#${id}-glow)`} />
          <g transform={`translate(${at.x} ${at.y}) rotate(${(ang * 180) / Math.PI + 45})`} opacity={flash}>
            <ellipse rx={120 * s * (1.3 - flash * 0.3)} ry={3.5} fill={C.text} />
            <ellipse rx={3.5} ry={80 * s * (1.3 - flash * 0.3)} fill={C.text} />
          </g>
        </g>
      )}
    </g>
  );
};

export const KickFx: React.FC<{ sac: SacState }> = ({ sac }) => {
  const id = useUid("kick");
  const ks = sac.ripples.filter((r) => r.kind === "kick");
  if (ks.length === 0) return null;
  return (
    <g>
      <defs>
        <SacClip id={`${id}-in`} sac={sac} />
        <clipPath id={`${id}-out`}>
          <path d={`M-4000,-4000H5000V6000H-4000Z ${sac.d}`} clipRule="evenodd" />
        </clipPath>
        <radialGradient id={`${id}-flash`}>
          <stop offset="0" stopColor={C.text} stopOpacity={1} />
          <stop offset="0.25" stopColor={C.gold} stopOpacity={0.75} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      {ks.map((k, i) => (
        <OneKick key={i} sac={sac} k={k} id={id} />
      ))}
    </g>
  );
};

export const SoundFx: React.FC<{ sac: SacState }> = ({ sac }) => {
  const id = useUid("sndfx");
  const ss = sac.ripples.filter((r) => r.kind === "sound");
  if (ss.length === 0) return null;
  const { cx, cy } = sac.shape;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-g`}>
          <stop offset="0" stopColor={C.peach} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
      </defs>
      {ss.map((k, i) => {
        const ang = Math.atan2(k.y - cy, k.x - cx);
        const rr = sac.rAt(ang);
        const at = { x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr };
        const env = Math.min(1, k.strength) * Math.exp(-k.age / 16) * Math.min(1, k.age / 2);
        const tr = (k.age * 14) / rr;
        return (
          <g key={i} fill="none" strokeLinecap="round">
            <circle cx={at.x} cy={at.y} r={90} fill={`url(#${id}-g)`} opacity={env} />
            <path d={membraneArc(sac, ang + tr - 0.16, ang + tr, 10)} stroke={C.peach} strokeWidth={3.5} opacity={0.75 * env} />
            <path d={membraneArc(sac, ang - tr, ang - tr + 0.16, 10)} stroke={C.peach} strokeWidth={3.5} opacity={0.75 * env} />
          </g>
        );
      })}
    </g>
  );
};
