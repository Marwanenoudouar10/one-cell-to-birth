import React from "react";
import { random } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { C } from "../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { B, END } from "./beats";
import { layerXf, scroll, xfAttr } from "./camera";
import { n2 } from "./math";

// Fluid specks carried past by the climb: what makes the travel read. Far =
// tiny pin-points, mid = soft specks, near = big out-of-focus bokeh. They fade
// in once the camera starts moving (frame 0 stays Scene1's opening) and clear
// out for the final, still END.
type Depth = "far" | "mid" | "near";
const CFG = {
  far: { p: 0.5, n: 38, r: [1.4, 3.6], a: [0.16, 0.42], blur: 0.8, span: 3400 },
  mid: { p: 1, n: 20, r: [2.4, 6], a: [0.12, 0.3], blur: 1.6, span: 2400 },
  near: { p: 1.9, n: 7, r: [26, 58], a: [0.05, 0.1], blur: 12, span: 2600 },
} as const;
const COLS = [C.cell, C.peach, C.rose, C.cellCyan];

const SPECKS = (["far", "mid", "near"] as Depth[]).reduce(
  (o, d) => {
    const c = CFG[d];
    o[d] = Array.from({ length: c.n }, (_, i) => {
      const rnd = (k: string) => random(`c01mote-${d}${i}-${k}`);
      return {
        i,
        x: (rnd("x") - 0.5) * (d === "far" ? 2000 : 1300),
        y: rnd("y") * c.span,
        r: c.r[0] + rnd("r") * (c.r[1] - c.r[0]),
        a: c.a[0] + rnd("a") * (c.a[1] - c.a[0]),
        col: COLS[Math.floor(rnd("c") * COLS.length)],
      };
    });
    return o;
  },
  {} as Record<Depth, { i: number; x: number; y: number; r: number; a: number; col: string }[]>,
);

export const Motes: React.FC<{ depth: Depth; frame: number }> = ({ depth, frame }) => {
  const c = CFG[depth];
  const op = tween(frame, B.push - 8, B.push + 22, [0, 1], EASE.inOut) * (1 - tween(frame, B.fuse, END - 6, [0, 1], EASE.inOut));
  if (op <= 0.01) return null;
  const L = layerXf(frame, c.p);
  const top = -L.oy / L.zL - 80;
  const sc = c.p * scroll(frame);
  const t = frame * 0.01;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", opacity: op, filter: `blur(${c.blur}px)` }}>
      <g transform={xfAttr(L)}>
        {SPECKS[depth].map((m) => {
          const y = top + ((((m.y + sc + noise2D(`c01my${depth}${m.i}`, 0, t) * 40 - frame * 0.4) % c.span) + c.span) % c.span);
          return (
            <circle
              key={m.i}
              cx={n2(m.x + noise2D(`c01mx${depth}${m.i}`, t, 0) * 40)}
              cy={n2(y)}
              r={m.r}
              fill={m.col}
              opacity={m.a}
            />
          );
        })}
      </g>
    </svg>
  );
};
