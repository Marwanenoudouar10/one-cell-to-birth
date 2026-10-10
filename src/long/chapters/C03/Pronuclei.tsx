import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { lerp } from "./geometry";
import { mix } from "./palette";
import { C02_OFF } from "./timeline";

// START handoff: C02's two pronuclei (one per parent, neutral gold and peach)
// exactly as C02 ends them: glassy bubbles r31 pressed together along a
// -70 deg axis around (0, 6), gold at the lower-left end, a flat shared wall
// between them (never merged). Same recipe and noise seeds as C02, on C02's
// clock, so the crossfade lines up. `meet` 0..1 then breaks the envelopes
// down (they press closer, shrink, fade) as the first division begins.
// Cluster-local px, not stretched with the cell (as in C02).
const PR = 31;
const REST = PR * 0.9;
const AXIS = -70;
const rad = (d: number) => (d * Math.PI) / 180;
const polar = (r: number, d: number) => ({ x: Math.cos(rad(d)) * r, y: Math.sin(rad(d)) * r });

export type Pron = { x: number; y: number; r: number };
export const pronPose = (f: number, meet: number) => {
  const g = f + C02_OFF;
  const n = g * 0.012;
  const axis = AXIS + noise2D("c02-pax", n, 0) * 4;
  const mid = { x: noise2D("c02-pmx", n, 3) * 2.5, y: 6 + noise2D("c02-pmy", 3, n) * 2.5 };
  const r = PR * (1 + 0.012 * Math.sin(g * 0.11)) * (1 - 0.3 * meet);
  const o = polar(REST * (1 - 0.45 * meet), axis);
  return { mid, axis, list: [-1, 1].map((s) => ({ x: mid.x + s * o.x, y: mid.y + s * o.y, r })) as Pron[] };
};

type Look = { core: string; body: string; rim: string; bead: string; halo: string };
const LOOKS: Look[] = [
  { core: mix(C.gold, C.text, 0.82), body: mix(C.gold, C.text, 0.4), rim: mix(C.gold, C.skinShade, 0.45), bead: mix(C.gold, C.skinShade, 0.5), halo: mix(C.gold, C.text, 0.5) },
  { core: mix(C.peach, C.text, 0.55), body: mix(C.peach, C.gold, 0.12), rim: mix(mix(C.peach, C.skinShade, 0.4), C.gold, 0.2), bead: mix(C.peach, C.skinShade, 0.55), halo: C.peach },
];
// Nucleolar beads: C02's hand-placed layout (C02/Pronuclei.tsx BEAD_LAYOUT,
// copied so a C02 edit never breaks this file silently). [along the pair axis
// toward the partner, across it, radius], all x the pronucleus radius.
const BEAD_LAYOUT: [number, number, number][][] = [
  [[0.36, -0.02, 0.17], [0.5, 0.18, 0.1], [0.28, 0.25, 0.075], [0.58, -0.15, 0.055], [0.15, -0.18, 0.045]], // gold
  [[0.38, 0.03, 0.16], [0.27, -0.21, 0.095], [0.53, -0.17, 0.07], [0.22, 0.2, 0.05]], // peach
];
const beadAt = (i: number, b: [number, number, number], axis: number, r: number) => {
  const u = polar(1, axis + (i === 0 ? 0 : 180));
  return { x: (u.x * b[0] - u.y * b[1]) * r, y: (u.y * b[0] + u.x * b[1]) * r, r: b[2] * r };
};
const arcD = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p0 = polar(r, a0);
  const p1 = polar(r, a1);
  return `M${(cx + p0.x).toFixed(2)} ${(cy + p0.y).toFixed(2)}A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${(cx + p1.x).toFixed(2)} ${(cy + p1.y).toFixed(2)}`;
};

const One: React.FC<{ p: Pron; i: number; g: number; env: number; clip: string; axis: number }> = ({ p, i, g, env, clip, axis }) => {
  const L = LOOKS[i];
  const id = `c03p-pn${i}`;
  const n = g * 0.02;
  return (
    <g clipPath={clip}>
      <defs>
        <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={p.x} cy={p.y} r={p.r} fx={p.x - p.r * 0.3} fy={p.y - p.r * 0.36}>
          <stop offset={0} stopColor={L.core} stopOpacity={0.85} />
          <stop offset={0.5} stopColor={L.body} stopOpacity={0.62} />
          <stop offset={0.82} stopColor={L.body} stopOpacity={0.55} />
          <stop offset={1} stopColor={L.rim} stopOpacity={lerp(0.2, 0.8, env)} />
        </radialGradient>
        <radialGradient id={`${id}-h`} gradientUnits="userSpaceOnUse" cx={p.x} cy={p.y} r={p.r * 1.45}>
          <stop offset={0.62} stopColor={L.halo} stopOpacity={0.3} />
          <stop offset={1} stopColor={L.halo} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-s`} gradientUnits="userSpaceOnUse" cx={p.x + p.r * 0.18} cy={p.y + p.r * 0.24} r={p.r * 1.25}>
          <stop offset={0.6} stopColor={C.skinShade} stopOpacity={0.3} />
          <stop offset={1} stopColor={C.skinShade} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={p.x + p.r * 0.18} cy={p.y + p.r * 0.24} r={p.r * 1.25} fill={`url(#${id}-s)`} opacity={env} />
      <circle cx={p.x} cy={p.y} r={p.r * 1.45} fill={`url(#${id}-h)`} />
      <circle cx={p.x} cy={p.y} r={p.r} fill={`url(#${id})`} />
      {BEAD_LAYOUT[i].map((b, k) => {
        const o = beadAt(i, b, axis, p.r);
        return (
          <circle
            key={k}
            cx={p.x + o.x + noise2D(`c02-bx${i}${k}`, n, 0) * 0.04 * p.r}
            cy={p.y + o.y + noise2D(`c02-by${i}${k}`, 0, n) * 0.04 * p.r}
            r={o.r}
            fill={L.bead}
            opacity={k === 0 ? 0.62 : 0.5}
          />
        );
      })}
      <circle cx={p.x} cy={p.y} r={p.r - 0.8} fill="none" stroke={L.rim} strokeOpacity={0.5 * env} strokeWidth={1.5} />
      <path d={arcD(p.x, p.y, p.r * 0.74, 198, 258)} fill="none" stroke={C.text} strokeOpacity={0.5 * env} strokeWidth={Math.max(1.4, p.r * 0.1)} strokeLinecap="round" />
    </g>
  );
};

// op: overall fade; env: 1 = intact envelope, 0 = broken down.
export const Pronuclei: React.FC<{ f: number; meet: number; op: number; env: number }> = ({ f, meet, op, env }) => {
  if (op <= 0.01) return null;
  const { list, axis } = pronPose(f, meet);
  const [a, b] = list;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const D = Math.hypot(dx, dy) || 1;
  const ux = dx / D;
  const uy = dy / D;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  // half-planes either side of the shared wall (+0.6 px overlap, no hairline)
  const side = (s: number) => {
    const ax = mx - ux * 0.6 * s;
    const ay = my - uy * 0.6 * s;
    const pts = [
      [ax - uy * 300, ay + ux * 300],
      [ax + uy * 300, ay - ux * 300],
      [ax + uy * 300 + ux * 300 * s, ay - ux * 300 + uy * 300 * s],
      [ax - uy * 300 + ux * 300 * s, ay + ux * 300 + uy * 300 * s],
    ];
    return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  };
  const chord = Math.sqrt(Math.max(0, a.r * a.r - (D / 2) ** 2));
  return (
    <g opacity={op}>
      <defs>
        <clipPath id="c03p-c0">
          <polygon points={side(-1)} />
        </clipPath>
        <clipPath id="c03p-c1">
          <polygon points={side(1)} />
        </clipPath>
      </defs>
      <One p={a} i={0} g={f + C02_OFF} env={env} clip="url(#c03p-c0)" axis={axis} />
      <One p={b} i={1} g={f + C02_OFF} env={env} clip="url(#c03p-c1)" axis={axis} />
      {chord > 0.5 && (
        <line x1={mx - uy * chord} y1={my + ux * chord} x2={mx + uy * chord} y2={my - ux * chord} stroke={C.text} strokeOpacity={0.5 * env} strokeWidth={1.6} strokeLinecap="round" />
      )}
    </g>
  );
};
