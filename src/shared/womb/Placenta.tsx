// <Placenta at spread size />: a plush dark-rose cushion set INTO the womb
// wall on the sac rim, lit along its fluid-facing surface, with lobes,
// grooves and the chorionic vessels branching from the cord insertion.
//   at       degrees around the sac where it sits (default -38 = upper right;
//            -90 = top, 180 = left). SVG convention.
//   spread   angular half-width in degrees (default 32)
//   size     thickness/scale multiplier (default 1 = teaser Scene4)
//   opacity
//   cx,cy,r  sac to sit on; omitted = the parent <AmnioticSac> (recommended)
// Put it as a DIRECT child of <AmnioticSac> so the membrane line hands over.
// placentaPort(sac, at, size) = world point where the cord plugs in; <Cord>
// inside the same sac defaults its `to` to it when one Placenta is present.
// <PlacentaShape> is the raw SVG <g> for your own layers.
import React from "react";
import { noise2D } from "@remotion/noise";
import { useCurrentFrame } from "remotion";
import { C } from "../../theme/colors";
import { WombLayer } from "./Camera";
import { Pt, SacShape, add, baseRadius, mul, polar, smooth, sub, useUid } from "./geom";
import { useSac } from "./sacContext";

export type PlacentaProps = { at?: number; spread?: number; size?: number; opacity?: number; cx?: number; cy?: number; r?: number };

const THICK = 100; // px at sac radius 360, size 1
const depthAt = (u: number) => Math.pow(Math.max(0, Math.cos(u * Math.PI * 0.5)), 0.65); // u in -1..1
const Rof = (s: SacShape, deg: number) => baseRadius(s, (deg * Math.PI) / 180);

export const placentaPort = (s: SacShape, at = -38, size = 1): Pt => {
  const R = Rof(s, at);
  const k = (R / 360) * size;
  return polar({ x: s.cx, y: s.cy }, R - (THICK * 0.95 - 3) * k, at);
};

// A filled, tapering vessel along points (one path, no filters).
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

export const PlacentaShape: React.FC<{ shape: SacShape; at: number; spread: number; size: number; frame: number }> = ({ shape, at, spread, size, frame: f }) => {
  const id = useUid("plac");
  const c = { x: shape.cx, y: shape.cy };
  const Rm = Rof(shape, at);
  const s = (Rm / 360) * size;
  const thick = THICK * s;
  const n = 40;
  const ang = (u: number) => at + spread * u;
  const pol = (r: number, deg: number) => polar(c, r, deg);
  const R = (u: number) => Rof(shape, ang(u));
  const innerR = (u: number) => {
    const lobes = 0.07 * Math.abs(Math.sin(u * Math.PI * 3 + 0.4));
    const wob = noise2D(`${id}w`, u * 2, f * 0.01) * 0.025;
    return R(u) - thick * depthAt(u) * (0.92 + lobes + wob) + 3 * s;
  };
  const outerR = (u: number) => R(u) + 18 * s * Math.pow(depthAt(u), 0.6);
  const us = Array.from({ length: n + 1 }, (_, i) => 1 - (2 * i) / n);
  const innerPts = us.map((u) => pol(innerR(u), ang(u)));
  const outerPts = [...us].reverse().map((u) => pol(outerR(u), ang(u)));
  const shapeD = smooth([...outerPts, ...innerPts]);
  const surface = smooth(innerPts.slice(1, n), false);
  const ins = placentaPort(shape, at, size);
  const along = (uA: number, uB: number, dA: number, dB: number, seed: string, steps: number) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;
      const u = uA + (uB - uA) * t;
      const wig = noise2D(`${id}${seed}`, t * 2.2, f * 0.004) * thick * 0.07 * t;
      return pol(innerR(u) + thick * (dA + (dB - dA) * t) * depthAt(u * 0.9) + wig, ang(u));
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
  const LOBES = [-0.78, -0.48, -0.17, 0.15, 0.46, 0.76];
  const grooves = [-0.63, -0.33, -0.01, 0.31, 0.61].map((u) => {
    const p0 = pol(innerR(u) + thick * 0.18 * depthAt(u), ang(u));
    const p1 = pol(R(u) + 6 * s, ang(u) + 1.5);
    return `M${p0.x},${p0.y} L${p1.x},${p1.y}`;
  });
  const lit = pol(Rm - thick, at - spread * 0.55);
  const top = pol(Rm, at - spread);
  const bot = pol(Rm, at + spread);
  const gR = Rm + 20 * s;
  const blur = (k: string, sd: number) => (
    <filter id={`${id}-${k}`} x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation={sd} />
    </filter>
  );
  return (
    <g>
      <defs>
        {blur("halo", 26 * s)}
        {blur("soft", 3 * s)}
        {blur("sh", 7 * s)}
        <radialGradient id={`${id}-body`} gradientUnits="userSpaceOnUse" cx={c.x} cy={c.y} r={gR}>
          <stop offset={(Rm - thick) / gR} stopColor={C.rose} />
          <stop offset={(Rm - thick * 0.62) / gR} stopColor={C.womb} />
          <stop offset={(Rm - thick * 0.12) / gR} stopColor={C.wombDeep} />
          <stop offset={(Rm + 4 * s) / gR} stopColor={C.wombDeep} stopOpacity={0.8} />
          <stop offset={1} stopColor={C.wombDeep} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-lit`} gradientUnits="userSpaceOnUse" cx={lit.x} cy={lit.y} r={Rm * 0.42}>
          <stop offset={0} stopColor={C.peach} stopOpacity={0.4} />
          <stop offset={1} stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-surf`} gradientUnits="userSpaceOnUse" x1={top.x} y1={top.y} x2={bot.x} y2={bot.y}>
          <stop offset={0} stopColor={C.skin} stopOpacity={0.85} />
          <stop offset={0.55} stopColor={C.rose} stopOpacity={0.6} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0.45} />
        </linearGradient>
        <radialGradient id={`${id}-lobe`}>
          <stop offset={0} stopColor={C.rose} stopOpacity={0.55} />
          <stop offset={0.6} stopColor={C.womb} stopOpacity={0.25} />
          <stop offset={1} stopColor={C.womb} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={shapeD} />
        </clipPath>
      </defs>
      <path d={shapeD} fill={C.womb} opacity={0.5} filter={`url(#${id}-halo)`} />
      <path d={shapeD} fill={`url(#${id}-body)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {LOBES.map((u, i) => {
          const p = pol(innerR(u) + thick * 0.36 * depthAt(u), ang(u));
          const lr = 30 * s * (0.55 + 0.45 * depthAt(u * 0.85));
          return <ellipse key={i} cx={p.x} cy={p.y} rx={lr} ry={lr * 0.9} fill={`url(#${id}-lobe)`} />;
        })}
        <g stroke={C.bg2} strokeWidth={7 * s} strokeLinecap="round" opacity={0.45} filter={`url(#${id}-soft)`}>
          {grooves.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <path d={shapeD} fill={`url(#${id}-lit)`} />
        <path d={surface} fill="none" stroke={C.rose} strokeWidth={24 * s} opacity={0.4} filter={`url(#${id}-sh)`} />
      </g>
      <g transform={`translate(${2 * s} ${3 * s})`} opacity={0.5}>
        {vessels.map((d, i) => (
          <path key={i} d={d} fill={C.bg2} />
        ))}
      </g>
      {vessels.map((d, i) => (
        <path key={i} d={d} fill={i % 2 ? C.heart : C.womb} opacity={0.85} />
      ))}
      <g opacity={0.4} transform={`translate(${-1 * s} ${-1.2 * s})`}>
        {vessels.slice(0, 4).map((d, i) => (
          <path key={i} d={d} fill="none" stroke={C.rose} strokeWidth={1} />
        ))}
      </g>
      <path d={surface} fill="none" stroke={`url(#${id}-surf)`} strokeWidth={3} strokeLinecap="round" />
      <circle cx={ins.x} cy={ins.y} r={13 * s} fill={C.skinShade} />
      <circle cx={ins.x - 3 * s} cy={ins.y - 3 * s} r={6 * s} fill={C.skin} opacity={0.65} />
    </g>
  );
};

export const Placenta: React.FC<PlacentaProps> = ({ at = -38, spread = 32, size = 1, opacity = 1, cx, cy, r }) => {
  const frame = useCurrentFrame();
  const sac = useSac();
  const shape: SacShape = sac && r === undefined ? sac.shape : { cx: cx ?? 540, cy: cy ?? 860, r: r ?? 360 };
  return (
    <WombLayer opacity={opacity}>
      <PlacentaShape shape={shape} at={at} spread={spread} size={size} frame={frame} />
    </WombLayer>
  );
};
