// Drifting fluid specks in two depth planes (far: small, dim, slow, slightly
// soft; near: big, blurred bokeh) so the slow push reads as depth. They thin
// out under the week tracker (y 100-290) and in the caption band.
import React from "react";
import { AbsoluteFill, random } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { tween } from "../../../lib/ease";
import { BEATS as B } from "./beats";
import { camXf, smooth } from "./motion";

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

// screen-y fade: clear of the tracker band, quiet over the captions
const zoneFade = (y: number) => smooth((y - 300) / 90) * (1 - 0.6 * smooth((y - 1240) / 80));
// while the day dots are up, specks give their band (y ~1170) a wide berth
const dotsUp = (f: number) => tween(f, B.dotsDraw - 12, B.dotsDraw) * (1 - tween(f, B.dotsFade, B.endHold));
const bandFade = (y: number, up: number) => 1 - 0.85 * up * Math.exp(-(((y - 1170) / 80) ** 2));

const Layer: React.FC<{ f: number; list: Speck[]; depth: number; blur: number; tag: string }> = ({ f, list, depth, blur, tag }) => {
  const up = dotsUp(f);
  return (
  <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", filter: blur ? `blur(${blur}px)` : undefined }}>
    <defs>
      {COLS.map((c, i) => (
        <radialGradient key={c} id={`c02-sp-${tag}${i}`}>
          <stop offset={0} stopColor={c} stopOpacity={1} />
          <stop offset={0.4} stopColor={c} stopOpacity={0.45} />
          <stop offset={1} stopColor={c} stopOpacity={0} />
        </radialGradient>
      ))}
    </defs>
    <g transform={camXf(f, depth)}>
      {list.map((s, i) => {
        const x = s.x + noise2D(`c02-${tag}x`, i * 3.1, f * 0.006) * 30;
        const y = s.y + noise2D(`c02-${tag}y`, f * 0.006, i * 2.3) * 30 - f * s.v * depth;
        const o = s.a * zoneFade(y) * bandFade(y, up);
        if (o < 0.005) return null;
        return <circle key={i} cx={x} cy={y} r={s.r * 2.6} fill={`url(#c02-sp-${tag}${s.c})`} opacity={o} />;
      })}
    </g>
  </svg>
  );
};

export const SpecksFar: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Layer f={f} list={FAR} depth={0.7} blur={0.8} tag="f" />
  </AbsoluteFill>
);

export const SpecksNear: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Layer f={f} list={NEAR} depth={1.6} blur={5} tag="n" />
  </AbsoluteFill>
);
