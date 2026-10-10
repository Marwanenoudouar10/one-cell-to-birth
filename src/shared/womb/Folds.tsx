// Concentric folds of womb wall around the cavity (the teaser's week-40 look,
// as full closed rings). Each fold is the region OUTSIDE its noisy outline,
// drawn inner -> outer, with a lift gradient (lit lip fading outward), a soft
// + crisp lit lip facing the sac (brighter toward the upper-left key light)
// and darker fibres. SVG <g>, world px. Used by <WombBackdrop>. Internal.
import React from "react";
import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { C } from "../../theme/colors";
import { Pt, SacShape, baseRadius, smooth, useUid } from "./geom";

const RINGS = [
  { off: 22, lift: 0.95, cool: C.bg2, warm: C.wombDeep },
  { off: 150, lift: 0.7, cool: C.bg2, warm: C.wombDeep },
  { off: 300, lift: 0.55, cool: C.bg1, warm: C.bg2 },
  { off: 490, lift: 0.42, cool: C.bg1, warm: C.bg2 },
  { off: 740, lift: 0.3, cool: C.bg0, warm: C.bg2 },
];

type Props = { shape: Required<SacShape>; frame: number; warmth: number; depth: number; breathe: number; seed: string };

const outline = (s: Required<SacShape>, off: number, f: number, seed: string, amp: number, breathe: number, n = 48): Pt[] => {
  const t = f * 0.006;
  return Array.from({ length: n }, (_, i) => {
    const th = (i / n) * Math.PI * 2;
    const ca = Math.cos(th);
    const sa = Math.sin(th);
    const w = noise2D(seed, ca * 1.6 + t, sa * 1.6 - t);
    const r = (baseRadius(s, th) + off) * breathe + w * amp;
    return { x: s.cx + ca * r, y: s.cy + sa * r };
  });
};

// Partial arc of an offset outline between two angles (degrees).
const partial = (s: Required<SacShape>, off: number, a0: number, a1: number, f: number, seed: string, breathe: number) => {
  const t = f * 0.005;
  const n = 14;
  return smooth(
    Array.from({ length: n + 1 }, (_, i) => {
      const th = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
      const w = noise2D(seed, Math.cos(th) * 1.6 + t, Math.sin(th) * 1.6);
      const r = (baseRadius(s, th) + off) * breathe + w * 14;
      return { x: s.cx + Math.cos(th) * r, y: s.cy + Math.sin(th) * r };
    }),
    false,
  );
};

export const Folds: React.FC<Props> = ({ shape, frame: f, warmth, depth, breathe: br, seed }) => {
  const id = useUid("fold");
  const { cx, cy, r } = shape;
  const far = 4000;
  const lit = 0.45 + 0.55 * warmth;
  const rings = RINGS.map((g, i) => {
    const breathe = 1 + br * 0.012 * Math.sin((f / 84) * Math.PI * 2 - i * 0.7);
    const edge = smooth(outline(shape, g.off, f, `${seed}f${i}`, 0.04 * (r + g.off) * 0.6, breathe));
    return { g, i, edge, breathe };
  });
  return (
    <g>
      <defs>
        {RINGS.map((g, i) => {
          const next = i < RINGS.length - 1 ? RINGS[i + 1].off : g.off + 400;
          const R0 = r + g.off;
          const R1 = r + next;
          return (
            <radialGradient key={i} id={`${id}-lift${i}`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={R1}>
              <stop offset={R0 / R1} stopColor={C.womb} stopOpacity={g.lift * lit} />
              <stop offset={(R0 / R1 + 1) / 2} stopColor={C.womb} stopOpacity={g.lift * lit * 0.33} />
              <stop offset="1" stopColor={C.womb} stopOpacity={0} />
            </radialGradient>
          );
        })}
        <linearGradient id={`${id}-key`} gradientUnits="userSpaceOnUse" x1={cx - r} y1={cy - r * 1.2} x2={cx + r} y2={cy + r * 1.2}>
          <stop offset="0" stopColor={C.peach} />
          <stop offset="0.45" stopColor={C.rose} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0.45} />
        </linearGradient>
        <filter id={`${id}-b10`} filterUnits="userSpaceOnUse" x={-300} y={-300} width={1680} height={2520}>
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      {rings.map(({ g, i, edge, breathe }) => {
        const region = `M${cx - far},${cy - far}H${cx + far}V${cy + far}H${cx - far}Z ${edge}`;
        const next = i < RINGS.length - 1 ? RINGS[i + 1].off : g.off + 400;
        const fib = [0.3, 0.62].map((k, j) => {
          const a0 = random(`${seed}fa${i}${j}`) * 360;
          const sweep = 110 + random(`${seed}fs${i}${j}`) * 120;
          return partial(shape, g.off + (next - g.off) * k, a0, a0 + sweep, f, `${seed}fb${i}${j}`, breathe);
        });
        return (
          <g key={i}>
            <path d={region} fill={g.cool} fillRule="evenodd" />
            {warmth > 0.01 && <path d={region} fill={g.warm} fillRule="evenodd" opacity={warmth} />}
            <path d={region} fill={`url(#${id}-lift${i})`} fillRule="evenodd" />
            {fib.map((d, j) => (
              <path
                key={j}
                d={d}
                fill="none"
                stroke={j ? C.bg0 : C.rose}
                strokeOpacity={j ? 0.32 * depth : 0.1 * lit}
                strokeWidth={j ? 10 : 4}
                strokeLinecap="round"
              />
            ))}
          </g>
        );
      })}
      {/* lit lips: one blur pass for all the soft glows, then the crisp lines */}
      <g filter={`url(#${id}-b10)`}>
        {rings.map(({ g, i, edge }) => (
          <path key={i} d={edge} fill="none" stroke={C.rose} strokeOpacity={0.18 * g.lift * lit} strokeWidth={28} />
        ))}
      </g>
      {rings.map(({ g, i, edge }) => (
        <path key={i} d={edge} fill="none" stroke={`url(#${id}-key)`} strokeOpacity={0.6 * g.lift * lit} strokeWidth={3} />
      ))}
    </g>
  );
};
