import React from "react";
import { spring } from "remotion";
import { C } from "../../../theme/colors";
import { FPS } from "../../../theme/layout";
import { EASE, tween } from "../../../lib/ease";
import { mix } from "./palette";
import { B } from "./timeline";

// "the hormone a pregnancy test detects": a clean, brandless test strip slides
// in from the side (screen px, upper hero box). Beneath it the hormone, as
// gold glow dots, doubles 1 -> 2 -> 4 -> 8 (HormoneDots), flows up into the
// result window, and the second line draws itself. No text.
export const Y0 = 412;
export const STRIP_X = 540;
export const STRIP_K = 0.96;
// Screen point of the test line (the dots fly into it).
const TEST_X = 22;
export const LINE_AT: [number, number] = [STRIP_X + TEST_X * STRIP_K, Y0];
const LINE = mix(C.rose, C.heart, 0.45);

const Strip: React.FC<{ line: number; flash: number }> = ({ line, flash }) => (
  <g>
    <defs>
      <linearGradient id="c04s-body" x1={0} y1={0} x2={0} y2={1}>
        <stop offset={0} stopColor={C.text} />
        <stop offset={0.45} stopColor={mix(C.text, C.cell, 0.6)} />
        <stop offset={1} stopColor={mix(C.cell, C.skinShade, 0.34)} />
      </linearGradient>
      <linearGradient id="c04s-pad" x1={0} y1={0} x2={0} y2={1}>
        <stop offset={0} stopColor={mix(C.peach, C.text, 0.45)} />
        <stop offset={0.55} stopColor={C.peach} />
        <stop offset={1} stopColor={mix(C.peach, C.skinShade, 0.6)} />
      </linearGradient>
      <linearGradient id="c04s-win" x1={0} y1={0} x2={0} y2={1}>
        <stop offset={0} stopColor={mix(C.cell, C.skinShade, 0.4)} />
        <stop offset={0.35} stopColor={mix(C.cell, C.cellCyan, 0.08)} />
        <stop offset={1} stopColor={C.cell} />
      </linearGradient>
      <radialGradient id="c04s-bloom">
        <stop offset={0} stopColor={C.rose} stopOpacity={0.75} />
        <stop offset={0.4} stopColor={C.rose} stopOpacity={0.25} />
        <stop offset={1} stopColor={C.rose} stopOpacity={0} />
      </radialGradient>
    </defs>
    {/* warm bounce light under it, so it sits in the womb world */}
    <ellipse cx={10} cy={74} rx={300} ry={20} fill={C.rose} opacity={0.2} style={{ filter: "blur(14px)" }} />
    <rect x={-262} y={-48} width={588} height={96} rx={34} fill="none" stroke={C.rose} strokeOpacity={0.16} strokeWidth={14} style={{ filter: "blur(9px)" }} />
    {/* sample pad */}
    <rect x={-336} y={-31} width={96} height={62} rx={16} fill="url(#c04s-pad)" />
    {[-14, 0, 14].map((dy) => (
      <path key={dy} d={`M-326 ${dy} q20 -4 40 0 t40 0`} fill="none" stroke={C.skinShade} strokeOpacity={0.28} strokeWidth={1.4} />
    ))}
    {/* body */}
    <rect x={-256} y={-44} width={576} height={88} rx={30} fill="url(#c04s-body)" />
    <path d="M-238 -38 H296" stroke={C.text} strokeOpacity={0.95} strokeWidth={2.2} strokeLinecap="round" />
    <path d="M-236 41 H298" stroke={C.rose} strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
    <path d="M-222 -30 V30" stroke={mix(C.cell, C.skinShade, 0.5)} strokeOpacity={0.5} strokeWidth={2} strokeLinecap="round" />
    {/* result window */}
    <rect x={-84} y={-29} width={256} height={58} rx={18} fill="url(#c04s-win)" />
    <rect x={-84} y={-29} width={256} height={58} rx={18} fill="none" stroke={mix(C.cell, C.skinShade, 0.55)} strokeOpacity={0.7} strokeWidth={2} />
    {/* control line (already there) */}
    <rect x={110} y={-21} width={19} height={42} rx={5} fill={LINE} opacity={0.92} />
    {/* test line: soaks in from the middle out, with a soft bloom */}
    {flash > 0.01 && <ellipse cx={TEST_X} cy={0} rx={70} ry={50} fill="url(#c04s-bloom)" opacity={flash} />}
    {line > 0.01 && <rect x={TEST_X - 9.5} y={-21 * line} width={19} height={42 * line} rx={5} fill={LINE} opacity={0.35 + 0.57 * line} />}
    {/* grip ridges */}
    {[238, 254, 270].map((x) => (
      <path key={x} d={`M${x} -15 V15`} stroke={mix(C.cell, C.skinShade, 0.6)} strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
    ))}
  </g>
);

export const TestStrip: React.FC<{ f: number }> = ({ f }) => {
  if (f < B.strip - 1) return null;
  const inP = spring({ frame: f - B.strip, fps: FPS, config: { damping: 16, stiffness: 110, mass: 0.9 } });
  const x = STRIP_X + (1 - inP) * 820;
  const y = Y0 + 3 * Math.sin(f * 0.05) * tween(f, B.strip + 10, B.absorb - 6, [1, 0.3], EASE.inOut);
  const tilt = 4 * (1 - inP);
  // A small "result" pop when the second line lands.
  const bump = 0.035 * Math.sin(Math.PI * tween(f, B.line - 2, B.line + 10, [0, 1], (t) => t)) * tween(f, B.line - 2, B.line + 2);
  // The line soaks in as the dots arrive and is fully drawn on "test".
  const line = tween(f, B.absorb + 4, B.line, [0, 1], EASE.inOut);
  const flash =
    tween(f, B.absorb + 4, B.line, [0, 1], EASE.out) * (1 - 0.6 * tween(f, B.line, B.line + 12, [0, 1], EASE.inOut)) +
    0.55 * tween(f, B.detects - 3, B.detects + 2, [0, 1], EASE.out) * (1 - tween(f, B.detects + 2, B.detects + 18, [0, 1], EASE.inOut));
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tilt.toFixed(2)}) scale(${(STRIP_K * (1 + bump)).toFixed(4)})`}>
      <Strip line={line} flash={Math.min(1, flash)} />
    </g>
  );
};
