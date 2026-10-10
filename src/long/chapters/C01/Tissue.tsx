import React from "react";
import { interpolateColors, random } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { C } from "../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { B, DUR, END } from "./beats";
import { camAt, layerXf, scroll, xfAttr } from "./camera";
import { wallOffset } from "./corridor";
import { n2 } from "./math";

// Out-of-focus walls at the left/right edges (Scene1's tissue, same seeds, so
// frame 0 is Scene1's opening), extended up the whole corridor and bent to its
// profile: straight channel, wide-open womb, pinched throat, then the tube.
// Each wall = dark body + a column of overlapping lobes lit toward the egg.
type Depth = "back" | "front";
const CFG = {
  back: { p: 0.7, blur: 8, base: 430, y0: -1200, y1: 2000, lobes: 15, rx: 92, ry: 300, motes: 0, k: 0.9 },
  front: { p: 1.6, blur: 22, base: 600, y0: -1000, y1: 2400, lobes: 11, rx: 170, ry: 420, motes: 9, k: 0.8 },
} as const;
const TOP = (p: number) => p * (-900 / p - scroll(DUR)); // highest layer y ever on screen

// k = 0: the lit inner column of folds; k = 1: a deeper, darker column behind
const lobesFor = (d: Depth, side: number, k: number) => {
  const c = CFG[d];
  const n = k === 0 ? c.lobes : Math.round(c.lobes * 0.6);
  const step = (c.y1 - c.y0) / (n - 1);
  const extra = Math.ceil((c.y0 - TOP(c.p)) / step);
  return Array.from({ length: n + extra }, (_, j) => {
    const i = j < n ? j : n - 1 - j; // Scene1's lobes first, then on up the corridor
    const rnd = (q: string) => random(j < n ? `s1w-${d}${side}${k}${i}-${q}` : `c01w-${d}${side}${k}${i}-${q}`);
    const big = k === 0 ? 1 : 1.5;
    return {
      i,
      k,
      ext: j >= n,
      x: c.base + c.rx * (k === 0 ? 0.35 + rnd("x") * 0.95 : 1.5 + rnd("x") * 0.6),
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
const wrap = (y: number, lo: number, span: number) => lo + ((((y - lo) % span) + span) % span);

export const Tissue: React.FC<{ depth: Depth; frame: number }> = ({ depth, frame }) => {
  const c = CFG[depth];
  const fade = 1 - tween(frame, B.fuse + 4, END - 4, [0, 1], EASE.inOut);
  if (fade <= 0.01) return null;
  const L = layerXf(frame, c.p);
  const cam = camAt(frame);
  const sc = c.p * scroll(frame);
  // the corridor's extra folds (above Scene1's) and its bends wait until the
  // climb starts, so frame 0 is exactly Scene1's opening (C00's last frame)
  const extOn = tween(sc, 0, 160, [0, 1], EASE.inOut);
  const flash = tween(frame, B.fuse, B.fuse + 5) * (1 - tween(frame, B.fuse + 6, B.fuse + 34));
  const lit = interpolateColors(flash, [0, 1], [C.rose, C.gold]);
  const id = `c01-wall-${depth}`;
  const front = depth === "front";
  const t = frame * 0.006;
  const yLo = (-L.oy) / L.zL - 700;
  const yHi = (HEIGHT - L.oy) / L.zL + 700;
  const off = (y: number) => wallOffset((y - sc) / c.p) * c.k * extOn;
  // dark body behind the lobes, following the profile
  const body = (side: number) => {
    const pts: string[] = [];
    for (let y = yLo; y <= yHi; y += 90) pts.push(`${n2(side * (c.base + c.rx * 1.4 + off(y)))},${n2(y)}`);
    return `M${side * 3000},${n2(yLo)}L${pts.join("L")}L${side * 3000},${n2(yHi)}Z`;
  };
  // foreground motes clear out for the climax so nothing crosses the winner
  const motesOp = 1 - tween(frame, B.oneOut - 24, B.oneOut - 4, [0, 1], EASE.inOut);
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
              <path d={body(side)} fill={front ? C.bg1 : C.wombDeep} opacity={front ? 0.9 : 0.75} />
              {LOBES[depth][si].map((l) => {
                const y = l.y + sc;
                if (y + l.ry < yLo + 500 || y - l.ry > yHi - 500 || (l.ext && extOn <= 0)) return null;
                const x = side * (l.x + off(y));
                // slow peristaltic swell
                const sw = 1 + noise2D(`s1lw${depth}${side}${l.i}`, t, 0) * 0.08;
                const dx = noise2D(`s1lx${depth}${side}${l.i}`, 0, t) * 18;
                return (
                  <ellipse
                    key={`${l.k}-${l.i}`}
                    cx={n2(x + dx)}
                    cy={n2(y)}
                    rx={n2(l.rx * sw)}
                    ry={n2(l.ry * sw)}
                    transform={`rotate(${n2(l.rot)} ${n2(x)} ${n2(y)})`}
                    fill={`url(#${id}-${l.k === 0 ? "lobe" : "deep"}${side})`}
                    opacity={((l.k === 0 ? 0.62 : 0.8) + l.tone * 0.3 + (front ? 0 : flash * 0.2)) * (l.ext ? extOn : 1)}
                  />
                );
              })}
            </g>
          ))}
          {motesOp > 0.01 &&
            MOTES.map((m) => (
              <circle
                key={m.i}
                cx={m.x + noise2D(`s1mx${m.i}`, t, 0) * 60}
                cy={wrap(m.y + noise2D(`s1my${m.i}`, 0, t) * 60 - frame * 0.6 + sc, -420, 2300)}
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
