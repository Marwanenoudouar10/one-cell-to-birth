import React from "react";
import { interpolateColors, random } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../lib/ease";
import { C } from "../../theme/colors";
import { HEIGHT, WIDTH } from "../../theme/layout";
import { camAt, layerXf, xfAttr } from "./camera";
import { B, END } from "./constants";
import { n2 } from "./math";

// Fallopian tube walls: soft, bulging folds of mucosa at the left/right edges,
// out of focus. Each wall = a dark body plus a column of overlapping lobes lit
// on the side facing the egg. Two parallax depths; the push slides them away.
type Depth = "back" | "front";
const CFG = {
  back: { p: 0.7, blur: 8, base: 430, y0: -1200, y1: 2000, lobes: 15, rx: 92, ry: 300, motes: 0 },
  front: { p: 1.6, blur: 22, base: 600, y0: -1000, y1: 2400, lobes: 11, rx: 170, ry: 420, motes: 9 },
} as const;

// k = 0: the lit inner column of folds; k = 1: a deeper, darker column behind
const lobesFor = (d: Depth, side: number, k: number) => {
  const c = CFG[d];
  const n = k === 0 ? c.lobes : Math.round(c.lobes * 0.6);
  const step = (c.y1 - c.y0) / (n - 1);
  return Array.from({ length: n }, (_, i) => {
    const rnd = (q: string) => random(`s1w-${d}${side}${k}${i}-${q}`);
    const big = k === 0 ? 1 : 1.5;
    return {
      i,
      k,
      x: side * (c.base + c.rx * (k === 0 ? 0.35 + rnd("x") * 0.95 : 1.5 + rnd("x") * 0.6)),
      y: c.y0 + i * step + (rnd("y") - 0.5) * step * 0.8,
      rx: c.rx * big * (0.6 + rnd("rx") * 0.8),
      ry: c.ry * big * (0.55 + rnd("ry") * 0.9),
      rot: (rnd("r") - 0.5) * 12,
      tone: rnd("t"),
    };
  });
};
const both = (d: Depth, side: number) => [...lobesFor(d, side, 1), ...lobesFor(d, side, 0)];
const LOBES = {
  back: [both("back", -1), both("back", 1)],
  front: [both("front", -1), both("front", 1)],
};
const MOTES = Array.from({ length: CFG.front.motes }, (_, i) => {
  const rnd = (k: string) => random(`s1mote-${i}-${k}`);
  return { i, x: (rnd("x") - 0.5) * 900, y: -300 + rnd("y") * 1700, r: 14 + rnd("r") * 30, rose: rnd("c") < 0.5, a: 0.07 + rnd("a") * 0.1 };
});

export const Tissue: React.FC<{ depth: Depth; frame: number }> = ({ depth, frame }) => {
  const c = CFG[depth];
  const fade = 1 - tween(frame, B.fertilise + 4, END - 4, [0, 1], EASE.inOut);
  if (fade <= 0.01) return null;
  const L = layerXf(frame, c.p);
  const cam = camAt(frame);
  const flash = tween(frame, B.fertilise, B.fertilise + 5) * (1 - tween(frame, B.fertilise + 6, B.fertilise + 34));
  const lit = interpolateColors(flash, [0, 1], [C.rose, C.gold]);
  const id = `s1-wall-${depth}`;
  const front = depth === "front";
  const t = frame * 0.006;
  // foreground motes clear out for the climax so nothing crosses the winner
  const motesOp = 1 - tween(frame, B.oneWins - 24, B.oneWins - 4, [0, 1], EASE.inOut);
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", filter: `blur(${c.blur}px)`, opacity: fade }}>
      <defs>
        {[-1, 1].map((side) => (
          <React.Fragment key={side}>
            <radialGradient id={`${id}-lobe${side}`} cx="0.5" cy="0.5" r="0.5" fx={side < 0 ? 0.8 : 0.2} fy="0.4">
              <stop offset="0" stopColor={front ? C.womb : lit} stopOpacity={front ? 0.7 : 0.85} />
              <stop offset="0.35" stopColor={front ? C.wombDeep : C.womb} stopOpacity={0.92} />
              <stop offset="0.75" stopColor={front ? C.bg2 : C.wombDeep} stopOpacity={0.98} />
              <stop offset="1" stopColor={front ? C.bg1 : C.bg2} stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${id}-deep${side}`} cx="0.5" cy="0.5" r="0.5" fx={side < 0 ? 0.75 : 0.25} fy="0.45">
              <stop offset="0" stopColor={front ? C.wombDeep : C.womb} stopOpacity={front ? 0.6 : 0.7} />
              <stop offset="0.45" stopColor={front ? C.bg2 : C.wombDeep} stopOpacity={0.95} />
              <stop offset="1" stopColor={C.bg1} stopOpacity={0} />
            </radialGradient>
            <linearGradient
              id={`${id}-body${side}`}
              gradientUnits="userSpaceOnUse"
              x1={side * c.base}
              y1={0}
              x2={side * (c.base + 500)}
              y2={0}
            >
              <stop offset="0" stopColor={front ? C.bg2 : C.wombDeep} />
              <stop offset="1" stopColor={C.bg1} />
            </linearGradient>
          </React.Fragment>
        ))}
        {/* the egg lights the walls: brighter beside it, falling off above and below */}
        <radialGradient id={`${id}-lit`} gradientUnits="userSpaceOnUse" cx={cam.ex} cy={cam.ey} r={1150}>
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.8} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.3} />
        </radialGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={0} y={0} width={WIDTH} height={HEIGHT}>
          <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-lit)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <g transform={xfAttr(L)}>
          {[-1, 1].map((side, si) => (
            <g key={side}>
              <rect
                x={side < 0 ? -(c.base + 2600) : c.base + c.rx * 1.4}
                y={c.y0 - 400}
                width={2600 - c.rx * 1.4}
                height={c.y1 - c.y0 + 800}
                fill={`url(#${id}-body${side})`}
              />
              {LOBES[depth][si].map((l) => {
                // slow peristaltic swell
                const sw = 1 + noise2D(`s1lw${depth}${side}${l.i}`, t, 0) * 0.08;
                const dx = noise2D(`s1lx${depth}${side}${l.i}`, 0, t) * 18;
                return (
                  <ellipse
                    key={`${l.k}-${l.i}`}
                    cx={n2(l.x + dx)}
                    cy={n2(l.y)}
                    rx={n2(l.rx * sw)}
                    ry={n2(l.ry * sw)}
                    transform={`rotate(${n2(l.rot)} ${n2(l.x)} ${n2(l.y)})`}
                    fill={`url(#${id}-${l.k === 0 ? "lobe" : "deep"}${side})`}
                    opacity={(l.k === 0 ? 0.62 : 0.8) + l.tone * 0.3 + (front ? 0 : flash * 0.2)}
                  />
                );
              })}
            </g>
          ))}
          {motesOp > 0.01 && MOTES.map((m) => (
            <circle
              key={m.i}
              cx={m.x + noise2D(`s1mx${m.i}`, t, 0) * 60}
              cy={m.y + noise2D(`s1my${m.i}`, 0, t) * 60 - frame * 0.6}
              r={m.r}
              fill={m.rose ? C.rose : C.cell}
              opacity={m.a * motesOp}
            />
          ))}
        </g>
      </g>
    </svg>
  );
};
