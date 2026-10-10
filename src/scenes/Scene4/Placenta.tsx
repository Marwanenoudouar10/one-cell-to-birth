import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../theme/colors";
import { Pt, add, dir, mul, smooth, sub } from "./geom";

// Placenta: a plush, dark-rose cushion set INTO the uterine wall at the upper
// right. It tapers into the wall at both ends (no hard corners), its lobed
// body is lit along the fluid-facing surface, and the cord's vessels run
// along that surface from the insertion point, tapering as they branch.
// The amnion line continues over its surface (see SacFront's mask). World space.
export const PLACENTA_DEG = -38;
export const PLACENTA_HALF = 32; // degrees either side of the centre
const THICK = 100; // px at sac radius 360 (a thick, plush disc seen edge-on)
const HALF = PLACENTA_HALF;
const pol = (r: number, deg: number) => mul(dir(deg), r);
const depth = (u: number) => Math.pow(Math.max(0, Math.cos(u * Math.PI * 0.5)), 0.65); // u in -1..1

// where the cord meets the placenta surface (the surface depth at u = 0)
export const placentaInsertion = (R: number) => pol(R - (THICK * 0.95 - 3) * (R / 360), PLACENTA_DEG);

// A filled, tapering vessel along a list of points (one path, no filters).
const vessel = (pts: Pt[], w0: number, w1: number) => {
  const N = pts.length - 1;
  const left: Pt[] = [];
  const right: Pt[] = [];
  pts.forEach((p, i) => {
    const tg = sub(pts[Math.min(N, i + 1)], pts[Math.max(0, i - 1)]);
    const l = Math.hypot(tg.x, tg.y) || 1;
    const nrm = { x: -tg.y / l, y: tg.x / l };
    const w = (w0 + (w1 - w0) * (i / N)) / 2;
    left.push(add(p, mul(nrm, w)));
    right.push(add(p, mul(nrm, -w)));
  });
  return smooth([...left, ...right.reverse()]);
};

export const Placenta: React.FC<{ R: number; f: number }> = ({ R, f }) => {
  const a = PLACENTA_DEG;
  const s = R / 360;
  const thick = THICK * s;
  const n = 40;
  const ang = (u: number) => a + HALF * u;
  // fluid-facing surface radius at u (-1..1), with soft lobed bumps
  const innerR = (u: number) => {
    const lobes = 0.07 * Math.abs(Math.sin(u * Math.PI * 3 + 0.4));
    const wob = noise2D("plw", u * 2, f * 0.01) * 0.025;
    return R - thick * depth(u) * (0.92 + lobes + wob) + 3 * s;
  };
  // wall-side radius: tucked just outside the membrane, tapering at the ends
  const outerR = (u: number) => R + 18 * s * Math.pow(depth(u), 0.6);
  const us = Array.from({ length: n + 1 }, (_, i) => 1 - (2 * i) / n);
  const innerPts = us.map((u) => pol(innerR(u), ang(u)));
  const outerPts = [...us].reverse().map((u) => pol(outerR(u), ang(u)));
  const shape = smooth([...outerPts, ...innerPts]);
  const surface = smooth(innerPts.slice(1, n), false);
  const ins = placentaInsertion(R);

  // chorionic vessels: run along the surface from the insertion, both ways.
  // along() samples u from uA to uB at a depth (fraction of thickness) below
  // the surface going dA -> dB, with a slow organic wiggle.
  const along = (uA: number, uB: number, dA: number, dB: number, seed: string, steps: number) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;
      const u = uA + (uB - uA) * t;
      const wig = noise2D(seed, t * 2.2, f * 0.004) * thick * 0.07 * t;
      return pol(innerR(u) + thick * (dA + (dB - dA) * t) * depth(u * 0.9) + wig, ang(u));
    });
  const trunk = (u1: number, d1: number, seed: string, steps = 12) => [ins, ...along(u1 / steps, u1, 0.08, d1, seed, steps - 1)];
  const T = [
    { pts: trunk(-0.86, 0.3, "v0"), w: 7.5 },
    { pts: trunk(0.84, 0.28, "v1"), w: 7 },
    { pts: trunk(-0.46, 0.5, "v2", 9), w: 5 },
    { pts: trunk(0.48, 0.52, "v3", 9), w: 4.8 },
  ];
  const vessels = [
    ...T.map((m) => vessel(m.pts, m.w * s, 1.2 * s)),
    vessel(along(-0.42, -0.74, 0.18, 0.66, "v4", 8), 3.4 * s, 0.9 * s),
    vessel(along(0.42, 0.72, 0.17, 0.64, "v5", 8), 3.2 * s, 0.9 * s),
  ];
  // cotyledon lobes + the grooves (septa) between them
  const LOBES = [-0.78, -0.48, -0.17, 0.15, 0.46, 0.76];
  const grooves = [-0.63, -0.33, -0.01, 0.31, 0.61].map((u) => {
    const p0 = pol(innerR(u) + thick * 0.18 * depth(u), ang(u));
    const p1 = pol(R + 6 * s, ang(u) + 1.5);
    return `M${p0.x},${p0.y} L${p1.x},${p1.y}`;
  });
  const lit = pol(R - thick, a - HALF * 0.55);
  const top = pol(R, a - HALF);
  const bot = pol(R, a + HALF);
  return (
    <g>
      <defs>
        <radialGradient id="s4-plac" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={R + 20 * s}>
          <stop offset={(R - thick) / (R + 20 * s)} stopColor={C.rose} />
          <stop offset={(R - thick * 0.62) / (R + 20 * s)} stopColor={C.womb} />
          <stop offset={(R - thick * 0.12) / (R + 20 * s)} stopColor={C.wombDeep} />
          <stop offset={(R + 4 * s) / (R + 20 * s)} stopColor={C.wombDeep} stopOpacity={0.8} />
          <stop offset={1} stopColor={C.wombDeep} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="s4-placLit" gradientUnits="userSpaceOnUse" cx={lit.x} cy={lit.y} r={R * 0.42}>
          <stop offset={0} stopColor={C.peach} stopOpacity={0.4} />
          <stop offset={1} stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="s4-placSurf" gradientUnits="userSpaceOnUse" x1={top.x} y1={top.y} x2={bot.x} y2={bot.y}>
          <stop offset={0} stopColor={C.skin} stopOpacity={0.85} />
          <stop offset={0.55} stopColor={C.rose} stopOpacity={0.6} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0.45} />
        </linearGradient>
        <radialGradient id="s4-lobe">
          <stop offset={0} stopColor={C.rose} stopOpacity={0.55} />
          <stop offset={0.6} stopColor={C.womb} stopOpacity={0.25} />
          <stop offset={1} stopColor={C.womb} stopOpacity={0} />
        </radialGradient>
        <clipPath id="s4-placClip">
          <path d={shape} />
        </clipPath>
      </defs>
      {/* soft glow seating it into the wall */}
      <path d={shape} fill={C.womb} opacity={0.5} filter="url(#s4-halo)" />
      <path d={shape} fill="url(#s4-plac)" />
      <g clipPath="url(#s4-placClip)">
        {LOBES.map((u, i) => {
          const c = pol(innerR(u) + thick * 0.36 * depth(u), ang(u));
          const r = 30 * s * (0.55 + 0.45 * depth(u * 0.85));
          return <ellipse key={`l${i}`} cx={c.x} cy={c.y} rx={r} ry={r * 0.9} fill="url(#s4-lobe)" />;
        })}
        <g stroke={C.bg2} strokeWidth={7 * s} strokeLinecap="round" opacity={0.45} filter="url(#s4-soft)">
          {grooves.map((d, i) => (
            <path key={`g${i}`} d={d} />
          ))}
        </g>
        <path d={shape} fill="url(#s4-placLit)" />
        {/* lit fluid-facing surface */}
        <path d={surface} fill="none" stroke={C.rose} strokeWidth={24 * s} opacity={0.4} filter="url(#s4-sh)" />
      </g>
      {/* vessels: dark underlay for depth, then the warm red vessel itself */}
      <g transform={`translate(${2 * s} ${3 * s})`} opacity={0.5}>
        {vessels.map((d, i) => (
          <path key={`u${i}`} d={d} fill={C.bg2} />
        ))}
      </g>
      {vessels.map((d, i) => (
        <path key={i} d={d} fill={i % 2 ? C.heart : C.womb} opacity={0.85} />
      ))}
      <g opacity={0.4}>
        {vessels.slice(0, 4).map((d, i) => (
          <path key={`h${i}`} d={d} fill="none" stroke={C.rose} strokeWidth={1} transform={`translate(${-1 * s} ${-1.2 * s})`} />
        ))}
      </g>
      {/* the amnion running over the placenta surface (continues the sac line) */}
      <path d={surface} fill="none" stroke="url(#s4-placSurf)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={ins.x} cy={ins.y} r={13 * s} fill={C.skinShade} />
      <circle cx={ins.x - 3 * s} cy={ins.y - 3 * s} r={6 * s} fill={C.skin} opacity={0.65} />
    </g>
  );
};
