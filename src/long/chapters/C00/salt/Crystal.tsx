// A grain of table salt: a frosted, translucent, slightly irregular cube with
// one chipped corner. Bold face tones (top brightest, lit from the upper left),
// a milky inner glow, soft inner rim light along every facet, faint stepped
// growth lines on top, the far edges showing through, crisp specular edges,
// twinkling glitter, a gold bounce from the cell on its left, and a glint that
// sweeps across it on "salt".
import React from "react";
import { interpolateColors, random } from "remotion";
import { C } from "../../../../theme/colors";
import { Face, P2, projectCube } from "./cube";

export type CrystalProps = {
  frame: number;
  x: number;
  y: number;
  e: number; // edge length, px
  yaw: number;
  pitch: number;
  roll: number;
  opacity: number;
  glint: number; // 0..1 progress of the sweep (0 or 1 = off)
  warm: number; // gold bounce from the cell on its left
};

const inset = (f: Face, k: number): string =>
  `M${f.pts.map((p) => `${(f.c[0] + (p[0] - f.c[0]) * k).toFixed(1)},${(f.c[1] + (p[1] - f.c[1]) * k).toFixed(1)}`).join("L")}Z`;

const GLITTER = Array.from({ length: 11 }, (_, i) => ({
  face: i % 3,
  corner: Math.floor(random(`c00-salt-g${i}-c`) * 5),
  t: 0.25 + random(`c00-salt-g${i}-t`) * 0.6,
  ph: random(`c00-salt-g${i}-p`) * Math.PI * 2,
  sp: 0.09 + random(`c00-salt-g${i}-s`) * 0.08,
}));

const Sparkle: React.FC<{ at: P2; s: number; o: number }> = ({ at, s, o }) => (
  <g transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})`} opacity={o}>
    <circle r={s * 1.1} fill="url(#c00-salt-spark)" />
    <path d={`M${-s * 2.2},0 Q0,${-s * 0.1} ${s * 2.2},0 Q0,${s * 0.1} ${-s * 2.2},0Z`} fill={C.text} opacity={0.85} />
    <path d={`M0,${-s * 1.4} Q${s * 0.1},0 0,${s * 1.4} Q${-s * 0.1},0 0,${-s * 1.4}Z`} fill={C.text} opacity={0.7} />
  </g>
);

export const Crystal: React.FC<CrystalProps> = ({ frame, x, y, e, yaw, pitch, roll, opacity, glint, warm }) => {
  if (opacity <= 0.005) return null;
  const cube = projectCube(x, y, e, yaw, pitch, roll);
  const faces = cube.front.filter((f) => f.id !== "chip");
  const top = faces.find((f) => f.id === "top");
  const chip = cube.front.find((f) => f.id === "chip");
  const xs = faces.flatMap((f) => f.pts.map((p) => p[0]));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const gx = minX - e * 0.4 + (maxX - minX + e * 0.8) * glint;
  const sweep = glint > 0 && glint < 1 ? Math.sin(Math.PI * glint) : 0;
  // salt, not glass: milky white-cyan faces (only the shade side keeps a cool blue cast)
  const tone = (lit: number) => interpolateColors(lit, [-0.22, 0.35, 0.85], [C.cellBlue, C.cell, C.text]);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible", opacity }}>
      <defs>
        <radialGradient id="c00-salt-haze">
          <stop offset="0" stopColor={C.cellCyan} stopOpacity={0.16} />
          <stop offset="1" stopColor={C.cellCyan} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c00-salt-milk" gradientUnits="userSpaceOnUse" cx={x - e * 0.16} cy={y - e * 0.16} r={e * 0.62}>
          <stop offset="0" stopColor={C.cell} stopOpacity={0.42} />
          <stop offset="0.6" stopColor={C.cell} stopOpacity={0.12} />
          <stop offset="1" stopColor={C.cell} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="c00-salt-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.text} stopOpacity={0.4} />
          <stop offset="0.5" stopColor={C.cell} stopOpacity={0.06} />
          <stop offset="1" stopColor={C.bg0} stopOpacity={0.18} />
        </linearGradient>
        <linearGradient id="c00-salt-warm" gradientUnits="userSpaceOnUse" x1={minX} y1={0} x2={minX + e * 0.7} y2={0}>
          <stop offset="0" stopColor={C.gold} stopOpacity={0.5} />
          <stop offset="0.35" stopColor={C.peach} stopOpacity={0.14} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="c00-salt-band" gradientUnits="userSpaceOnUse" x1={gx - e * 0.2} y1={0} x2={gx + e * 0.2} y2={0} gradientTransform={`rotate(-24 ${gx} ${y})`}>
          <stop offset="0" stopColor={C.text} stopOpacity={0} />
          <stop offset="0.5" stopColor={C.text} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.text} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="c00-salt-chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.text} stopOpacity={0.9} />
          <stop offset="1" stopColor={C.cell} stopOpacity={0.5} />
        </linearGradient>
        <radialGradient id="c00-salt-spark">
          <stop offset="0" stopColor={C.text} stopOpacity={0.95} />
          <stop offset="0.4" stopColor={C.cell} stopOpacity={0.35} />
          <stop offset="1" stopColor={C.cellCyan} stopOpacity={0} />
        </radialGradient>
        <clipPath id="c00-salt-clip">
          {cube.front.map((f) => (
            <path key={f.id} d={f.d} />
          ))}
        </clipPath>
      </defs>
      <circle cx={x} cy={y} r={e * 1.05} fill="url(#c00-salt-haze)" />
      {/* the far edges, seen through the body */}
      {cube.back.map((f) => (
        <path key={f.id} d={f.d} fill={C.cellBlue} fillOpacity={0.05} stroke={C.cellCyan} strokeOpacity={0.13} strokeWidth={1.4} strokeLinejoin="round" />
      ))}
      {/* soft rounded silhouette (worn edges) */}
      <path d={cube.outline} fill="none" stroke={C.cell} strokeOpacity={0.22} strokeWidth={e * 0.022} strokeLinejoin="round" />
      {/* frosted near faces: bold tone per facet + a soft light-to-shade sweep */}
      {cube.front.map((f) => (
        <g key={f.id}>
          <path d={f.d} fill={tone(f.lit)} fillOpacity={0.24 + 0.5 * f.lit} />
          <path d={f.d} fill="url(#c00-salt-face)" />
        </g>
      ))}
      <g clipPath="url(#c00-salt-clip)">
        <rect x={x - e} y={y - e} width={e * 2} height={e * 2} fill="url(#c00-salt-milk)" />
        {/* inner rim light along every facet: reads as thickness */}
        <g style={{ filter: `blur(${(e * 0.008).toFixed(2)}px)` }}>
          {faces.map((f) => (
            <path key={f.id} d={inset(f, 0.93)} fill="none" stroke={C.text} strokeOpacity={0.12 + 0.2 * f.lit} strokeWidth={e * 0.018} strokeLinejoin="round" />
          ))}
        </g>
        {/* stepped growth terraces on top: soft stacked fills, read as relief, not as outlines */}
        {top && (
          <g fill={C.text} style={{ filter: `blur(${(e * 0.006).toFixed(2)}px)` }}>
            <path d={inset(top, 0.72)} fillOpacity={0.07} />
            <path d={inset(top, 0.46)} fillOpacity={0.07} />
            <path d={inset(top, 0.22)} fillOpacity={0.06} />
          </g>
        )}
        <rect x={minX - 10} y={y - e} width={e * 0.9} height={e * 2} fill="url(#c00-salt-warm)" opacity={warm} />
        {sweep > 0.01 && <rect x={minX - e} y={y - e * 1.5} width={maxX - minX + e * 2} height={e * 3} fill="url(#c00-salt-band)" opacity={sweep} />}
      </g>
      {/* crisp edges: brightest on the lit top */}
      {faces.map((f) => (
        <path key={f.id} d={f.d} fill="none" stroke={C.cell} strokeOpacity={0.3 + 0.45 * f.lit} strokeWidth={1.8} strokeLinejoin="round" />
      ))}
      {top && <path d={top.d} fill="none" stroke={C.text} strokeOpacity={0.8} strokeWidth={2.4} strokeLinejoin="round" />}
      {chip && <path d={chip.d} fill="url(#c00-salt-chip)" fillOpacity={0.6 + 0.35 * sweep} stroke={C.text} strokeOpacity={0.8} strokeWidth={1.4} strokeLinejoin="round" />}
      {/* glitter: tiny facets catching the light */}
      {GLITTER.map((g, i) => {
        const f = faces[g.face % faces.length];
        const p = f.pts[g.corner % f.pts.length];
        const at: P2 = [f.c[0] + (p[0] - f.c[0]) * g.t, f.c[1] + (p[1] - f.c[1]) * g.t];
        const tw = Math.pow(0.5 + 0.5 * Math.sin(frame * g.sp + g.ph), 6);
        return tw > 0.04 ? <Sparkle key={i} at={at} s={e * 0.012} o={tw * 0.85} /> : null;
      })}
      <Sparkle at={cube.corners.tl} s={e * 0.026} o={0.7} />
      <Sparkle at={cube.corners.chip} s={e * 0.024 * (1 + 0.8 * sweep)} o={0.5 + 0.5 * sweep} />
    </svg>
  );
};
