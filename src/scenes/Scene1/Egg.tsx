import React from "react";
import { interpolateColors, random } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../lib/ease";
import { C } from "../../theme/colors";
import { B, END, R, ZONA } from "./constants";
import { lerp, polar } from "./math";
import { ZygoteDefs, ZygoteFill, exitAt } from "./Zygote";

// The ovum in egg coordinates (centre 0,0, core radius R). Before contact it
// is a cool, glassy, luminous cell; at fertilisation a warm gold front
// spreads from the entry point until the whole zygote glows gold-white.
const BLOBS = Array.from({ length: 16 }, (_, i) => {
  const rnd = (k: string) => random(`s1o-${i}-${k}`);
  const p = polar(R * 0.72 * Math.sqrt(rnd("d")), rnd("a") * Math.PI * 2);
  return { i, x: p.x, y: p.y, r: 12 + rnd("r") * 14, op: 0.05 + rnd("o") * 0.06 };
});
const SPECKS = Array.from({ length: 30 }, (_, i) => {
  const rnd = (k: string) => random(`s1g-${i}-${k}`);
  const p = polar(R * 0.88 * Math.sqrt(rnd("d")), rnd("a") * Math.PI * 2);
  return { i, x: p.x, y: p.y, r: 1 + rnd("r") * 1.4, op: 0.18 + rnd("o") * 0.22 };
});

const F = B.fertilise;

// Breathing: 2% on a 56-frame cycle at the END. Scene2 phase-locks to this
// exact formula (its frame k = our frame END + k), so keep it as is.
export const breathAt = (f: number) =>
  1 + Math.sin((f / 56) * Math.PI * 2) * lerp(0.008, 0.02, tween(f, F, F + 20));

const arc = (r: number, a0: number, a1: number) => {
  const p0 = polar(r, (a0 * Math.PI) / 180);
  const p1 = polar(r, (a1 * Math.PI) / 180);
  return `M${p0.x},${p0.y}A${r},${r} 0 0 1 ${p1.x},${p1.y}`;
};

export const Egg: React.FC<{ frame: number }> = ({ frame }) => {
  const warm = tween(frame, F, F + 26, [0, 1], EASE.inOut);
  const col = (a: string, b: string) => interpolateColors(warm, [0, 1], [a, b]);
  const zEdge = col(C.cell, C.text);
  const zTint = col(C.cellCyan, C.gold);

  // translucent shell + halo fade out under Scene2's matching layers
  const out = exitAt(frame);
  const polarOp = 1 - tween(frame, F + 8, END - 6);
  const t = frame * 0.01;

  return (
    <g transform={`scale(${breathAt(frame)})`}>
      <defs>
        <radialGradient id="s1-zona" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={ZONA}>
          <stop offset={R / ZONA - 0.01} stopColor={zTint} stopOpacity={0} />
          <stop offset={R / ZONA + 0.025} stopColor={zTint} stopOpacity={0.12} />
          <stop offset="0.93" stopColor={zEdge} stopOpacity={0.16} />
          <stop offset="1" stopColor={zEdge} stopOpacity={0.42} />
        </radialGradient>
        <radialGradient id="s1-core" gradientUnits="userSpaceOnUse" cx={-0.24 * R} cy={-0.3 * R} r={R * 1.32}>
          <stop offset="0" stopColor={C.cell} stopOpacity={0.97} />
          <stop offset="0.4" stopColor={C.cell} stopOpacity={0.8} />
          <stop offset="0.75" stopColor={C.cellCyan} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.cell} stopOpacity={0.7} />
        </radialGradient>
        <radialGradient id="s1-membrane" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={R}>
          <stop offset="0.74" stopColor={zEdge} stopOpacity={0} />
          <stop offset="0.94" stopColor={zEdge} stopOpacity={0.55} />
          <stop offset="1" stopColor={zEdge} stopOpacity={0.9} />
        </radialGradient>
        {/* soft core shadow away from the light, kept off the bright rim */}
        <radialGradient id="s1-shade" gradientUnits="userSpaceOnUse" cx={-0.4 * R} cy={-0.5 * R} r={R * 1.75}>
          <stop offset="0.5" stopColor={C.cellBlue} stopOpacity={0} />
          <stop offset="0.8" stopColor={C.cellBlue} stopOpacity={0.2} />
          <stop offset="0.95" stopColor={C.cellBlue} stopOpacity={0.08} />
        </radialGradient>
        <radialGradient id="s1-spec" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.text} stopOpacity={0.8} />
          <stop offset="1" stopColor={C.text} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="s1-halo" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={ZONA * 1.7}>
          <stop offset={0.55} stopColor={C.gold} stopOpacity={0.32} />
          <stop offset={0.7} stopColor={C.gold} stopOpacity={0.12} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <clipPath id="s1-coreclip">
          <circle r={R} />
        </clipPath>
      </defs>

      <ZygoteDefs frame={frame} />
      {/* warm glow hugging the zona once the cell is alive */}
      {warm * out > 0.01 && <circle r={ZONA * 1.7} fill="url(#s1-halo)" opacity={warm * out} />}
      {/* zona pellucida: thick glassy shell */}
      <circle r={ZONA} fill="url(#s1-zona)" opacity={out} />
      {/* polar body tucked into the perivitelline space */}
      <circle cx={polar(R + 8, -0.92).x} cy={polar(R + 8, -0.92).y} r={10} fill={zEdge} opacity={0.45 * polarOp} />
      {/* oocyte cytoplasm with soft organelles */}
      <circle r={R} fill="url(#s1-core)" />
      <g opacity={1 - warm * 0.5}>
        {BLOBS.map((b) => (
          <circle
            key={b.i}
            cx={b.x + noise2D(`s1ox${b.i}`, t, 0) * 5}
            cy={b.y + noise2D(`s1oy${b.i}`, 0, t) * 5}
            r={b.r}
            fill={C.cell}
            opacity={b.op}
          />
        ))}
        {SPECKS.map((g) => (
          <circle
            key={g.i}
            cx={g.x + noise2D(`s1gx${g.i}`, t, 0) * 4}
            cy={g.y + noise2D(`s1gy${g.i}`, 0, t) * 4}
            r={g.r}
            fill={C.cellCyan}
            opacity={g.op}
          />
        ))}
      </g>
      <ZygoteFill frame={frame} />
      <circle r={R} fill="url(#s1-shade)" opacity={1 - warm * 0.85} />
      <circle r={R} fill="url(#s1-membrane)" />
      {/* soft specular glint + rim lights */}
      <ellipse cx={-0.38 * R} cy={-0.44 * R} rx={R * 0.26} ry={R * 0.17} fill="url(#s1-spec)" opacity={0.55} transform={`rotate(-38 ${-0.38 * R} ${-0.44 * R})`} />
      {out > 0.01 && (
        <g opacity={out}>
          <circle r={ZONA} fill="none" stroke={zEdge} strokeOpacity={0.45} strokeWidth={1.1} />
          <path d={arc(ZONA - 2.4, 196, 284)} fill="none" stroke={zEdge} strokeOpacity={0.7} strokeWidth={2.4} strokeLinecap="round" />
          <path d={arc(ZONA - 2.4, 20, 70)} fill="none" stroke={zTint} strokeOpacity={0.35} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};
