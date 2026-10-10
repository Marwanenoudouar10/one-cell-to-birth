import React from "react";
import { AbsoluteFill, random } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { EASE, tween } from "../../../lib/ease";
import { smooth } from "./geometry";
import { B, C02_OFF } from "./timeline";

// START handoff: C02's drifting fluid specks (same seeds, recipe and clock as
// C02/Specks.tsx; C02's camera is at rest by its END), so the crossfade shows
// one set of specks, not two. They dissolve after the fade while C03's own
// motes (which scroll with the tube) take over.
type Speck = { x: number; y: number; r: number; a: number; c: number; v: number };
const make = (n: number, seed: string, r0: number, r1: number, a0: number, a1: number): Speck[] =>
  Array.from({ length: n }, (_, i) => {
    const rnd = (k: string) => random(`c02-${seed}-${i}-${k}`);
    return {
      x: rnd("x") * WIDTH,
      y: 260 + rnd("y") * 1150,
      r: r0 + rnd("r") * (r1 - r0),
      a: a0 + rnd("a") * (a1 - a0),
      c: i % 3,
      v: 0.15 + rnd("v") * 0.25,
    };
  });
const FAR = make(18, "far", 1.6, 3.4, 0.14, 0.34);
const NEAR = make(6, "near", 7, 13, 0.06, 0.13);
const COLS = [C.cell, C.gold, C.peach];
const zoneFade = (y: number) => smooth((y - 300) / 90) * (1 - 0.6 * smooth((y - 1240) / 80));

export const handOp = (f: number) => 1 - tween(f, B.settled, B.settled + 36, [0, 1], EASE.inOut);

const Layer: React.FC<{ f: number; list: Speck[]; depth: number; blur: number; tag: string }> = ({ f, list, depth, blur, tag }) => {
  const g = f + C02_OFF;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", filter: blur ? `blur(${blur}px)` : undefined }}>
      <defs>
        {COLS.map((c, i) => (
          <radialGradient key={c} id={`c03hs-${tag}${i}`}>
            <stop offset={0} stopColor={c} stopOpacity={1} />
            <stop offset={0.4} stopColor={c} stopOpacity={0.45} />
            <stop offset={1} stopColor={c} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      {list.map((s, i) => {
        const x = s.x + noise2D(`c02-${tag}x`, i * 3.1, g * 0.006) * 30;
        const y = s.y + noise2D(`c02-${tag}y`, g * 0.006, i * 2.3) * 30 - g * s.v * depth;
        const o = s.a * zoneFade(y);
        if (o < 0.005) return null;
        return <circle key={i} cx={x} cy={y} r={s.r * 2.6} fill={`url(#c03hs-${tag}${s.c})`} opacity={o} />;
      })}
    </svg>
  );
};

export const HandoffSpecks: React.FC<{ f: number; near: boolean }> = ({ f, near }) => {
  const o = handOp(f);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {o > 0.004 && (near ? <Layer f={f} list={NEAR} depth={1.6} blur={5} tag="n" /> : <Layer f={f} list={FAR} depth={0.7} blur={0.8} tag="f" />)}
    </AbsoluteFill>
  );
};
