import React from "react";
import { C } from "../../theme/colors";
import { Pt, add, mul, norm, perp, smoothPath, sub } from "./math";

// Scene3's yolk sac + yolk stalk, made placeable. Draw BOTH before (behind)
// the <Embryo>: the stalk starts at embryoAnchors(...).yolkStalk, which is
// tucked behind the belly, and runs to the sac's edge facing the embryo.

const VESSELS = [
  "M-40,4 C-28,-2 -18,-14 -4,-12 S20,-22 34,-16",
  "M-40,4 C-26,10 -10,20 6,14 S26,10 36,18",
  "M-4,-12 C0,-22 -6,-30 -2,-38",
  "M6,14 C10,24 6,32 12,38",
];

type SacProps = {
  x: number;
  y: number;
  r: number; // radius px (Scene3: 42)
  glow?: number; // 0..1 heartbeat glow (vessels + halo brighten)
  opacity?: number;
  id?: string; // unique suffix if several sacs share an <svg>
};

export const YolkSac: React.FC<SacProps> = ({ x, y, r, glow = 0, opacity = 1, id }) => {
  const u = id ? `embys-${id}` : "embys";
  const k = r / 42; // vessel art is drawn for r = 42
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <defs>
        <radialGradient id={`${u}-fill`} cx="0.4" cy="0.36" r="0.68">
          <stop offset="0" stopColor={C.skin} />
          <stop offset="0.38" stopColor={C.gold} stopOpacity={0.92} />
          <stop offset="0.8" stopColor={C.peach} />
          <stop offset="1" stopColor={C.skinShade} />
        </radialGradient>
        <radialGradient id={`${u}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.4" stopColor={C.gold} stopOpacity={0.16} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${u}-shade`} cx="0.72" cy="0.8" r="0.62">
          <stop offset="0" stopColor={C.womb} stopOpacity={0.42} />
          <stop offset="1" stopColor={C.womb} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${u}-spec`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.text} stopOpacity={0.8} />
          <stop offset="1" stopColor={C.text} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${u}-clip`}>
          <circle cx={0} cy={0} r={r} />
        </clipPath>
      </defs>
      <circle r={r * 2.1} fill={`url(#${u}-glow)`} opacity={0.7 + 0.3 * glow} />
      <circle r={r} fill={`url(#${u}-fill)`} />
      <g clipPath={`url(#${u}-clip)`}>
        <g transform={`scale(${k})`}>
          {VESSELS.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={C.heart} strokeOpacity={0.22 + 0.12 * glow} strokeWidth={i < 2 ? 1.6 : 1.1} strokeLinecap="round" />
          ))}
        </g>
        <circle r={r} fill={`url(#${u}-shade)`} />
      </g>
      <circle r={r - 1} fill="none" stroke={C.skin} strokeOpacity={0.55} strokeWidth={2 * Math.sqrt(k)} />
      <ellipse cx={-r * 0.36} cy={-r * 0.42} rx={r * 0.3} ry={r * 0.18} transform={`rotate(-35 ${-r * 0.36} ${-r * 0.42})`} fill={`url(#${u}-spec)`} opacity={0.8} />
    </g>
  );
};

const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return add(add(mul(p0, u * u * u), mul(p1, 3 * u * u * t)), add(mul(p2, 3 * u * t * t), mul(p3, t * t * t)));
};

export type StalkOpts = {
  sag?: number; // how much the cord droops under its own weight (1 = Scene3)
  sway?: number; // px, animate with noise for a living cord
  scale?: number; // thickness multiplier (1 = Scene3 at its 1.15 embryo scale)
};

// Tapering, sagging tube from `from` (belly, thick) to `to` (sac edge, thin).
// Returns the filled outline + centre line (Scene3's shape for its geometry).
export const yolkStalkPath = (from: Pt, to: Pt, o: StalkOpts = {}) => {
  const { sag = 1, sway = 0, scale = 1 } = o;
  const d = sub(to, from);
  const L = Math.hypot(d.x, d.y) || 1;
  const p1 = add(add(from, mul(d, 0.16)), { x: 0, y: 0.26 * L * sag });
  const p2 = add(sub(to, mul(d, 0.41)), { x: 0, y: (0.15 * L + sway) * sag });
  const M = 28;
  const c: Pt[] = [];
  for (let i = 0; i <= M; i++) c.push(bez(from, p1, p2, to, i / M));
  const A: Pt[] = [];
  const B: Pt[] = [];
  c.forEach((p, i) => {
    const t = norm(sub(c[Math.min(M, i + 1)], c[Math.max(0, i - 1)]));
    const w = (7.5 - 4 * (i / M) + 1.2 * Math.sin((i / M) * Math.PI)) * scale;
    A.push(add(p, mul(perp(t), w)));
    B.push(add(p, mul(perp(t), -w)));
  });
  return { body: smoothPath([...A, ...B.reverse()], true), line: smoothPath(c, false) };
};

// The point on a sac's rim facing `from` (where the stalk should end).
export const sacEdge = (sac: { x: number; y: number; r: number }, from: Pt): Pt => {
  const d = norm(sub(from, sac));
  return { x: sac.x + d.x * sac.r * 0.92, y: sac.y + d.y * sac.r * 0.92 + 6 * (sac.r / 42) };
};

type StalkProps = { from: Pt; to: Pt; glow?: number; opacity?: number } & StalkOpts;

export const YolkStalk: React.FC<StalkProps> = ({ from, to, glow = 0, opacity = 1, ...o }) => {
  const s = yolkStalkPath(from, to, o);
  const k = o.scale ?? 1;
  return (
    <g opacity={opacity}>
      <path d={s.body} fill={C.skinShade} opacity={0.9} transform={`translate(${0.8 * k} ${1.6 * k})`} />
      <path d={s.body} fill={C.peach} />
      <path d={s.line} fill="none" stroke={C.heart} strokeOpacity={0.3 + 0.3 * glow} strokeWidth={1.6 * k} transform={`translate(0 ${1.2 * k})`} />
      <path d={s.line} fill="none" stroke={C.skin} strokeOpacity={0.85} strokeWidth={1.8 * k} transform={`translate(${-0.6 * k} ${-3 * k})`} />
    </g>
  );
};
