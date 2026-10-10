import React from "react";
import { interpolateColors, random } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { C } from "../../../theme/colors";
import { B } from "./beats";
import { R, RING_V, ZONA } from "./constants";
import { Vec, add, len, mul, norm, polar, sub } from "./math";

// (Copied from Scene1.) Corona radiata: a crown of small follicle cells radiating out from the
// zona, densest at the shell and thinning outward. Each is a soft oval
// pointing away from the egg with a faint nucleus. At fertilisation the zona
// reaction sweeps them outward and they melt away into the dark.
const N = 104;
const CELLS = Array.from({ length: N }, (_, i) => {
  const rnd = (k: string) => random(`s1c-${i}-${k}`);
  const ring = rnd("d");
  const d = R * (1.22 + ring ** 1.5 * 0.56);
  return {
    i,
    a: i * 2.39996 + (rnd("a") - 0.5) * 0.3, // golden-angle spread
    d,
    r: R * (0.06 + rnd("r") * 0.05) * (1 - ring * 0.3),
    long: 1.25 + rnd("e") * 0.35,
    op: 0.66 - ring * 0.42,
    push: R * (0.22 + rnd("p") * 0.4),
    hit: B.fuse + (d - ZONA) / RING_V,
  };
});

export const Corona: React.FC<{ frame: number; winner: Vec }> = ({ frame, winner }) => {
  const warm = tween(frame, B.fuse, B.fuse + 10, [0, 1]);
  const core = interpolateColors(warm, [0, 1], [C.cell, C.text]);
  const edge = interpolateColors(warm, [0, 1], [C.cellCyan, C.gold]);
  const hazeOp = 1 - tween(frame, B.fuse + 2, B.fuse + 22, [0, 1], EASE.out);
  const t = frame * 0.012;
  return (
    <g>
      <defs>
        <radialGradient id="c01-cnuc">
          <stop offset="0" stopColor={core} stopOpacity={0.55} />
          <stop offset="1" stopColor={edge} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c01-corona" cx="0.42" cy="0.4" r="0.6">
          <stop offset="0" stopColor={core} stopOpacity={0.55} />
          <stop offset="0.5" stopColor={core} stopOpacity={0.3} />
          <stop offset="0.82" stopColor={edge} stopOpacity={0.26} />
          <stop offset="1" stopColor={edge} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c01-haze" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={R * 2.05}>
          <stop offset="0.5" stopColor={C.cellCyan} stopOpacity={0} />
          <stop offset="0.62" stopColor={C.cell} stopOpacity={0.11} />
          <stop offset="0.8" stopColor={C.cellCyan} stopOpacity={0.05} />
          <stop offset="1" stopColor={C.cellCyan} stopOpacity={0} />
        </radialGradient>
      </defs>
      {hazeOp > 0 && <circle r={R * 2.05} fill="url(#c01-haze)" opacity={hazeOp} />}
      {CELLS.map((c) => {
        const a = c.a + noise2D(`s1ca${c.i}`, t, 0) * 0.04;
        const hit = tween(frame, c.hit, c.hit + 30, [0, 1], EASE.out);
        const d = c.d + noise2D(`s1cd${c.i}`, 0, t) * 4 + c.push * hit;
        let p = polar(d, a);
        // cells part as the winner pushes through
        const away = sub(p, winner);
        const dist = len(away);
        if (dist < 30) p = add(p, mul(norm(away), (30 - dist) * 0.9));
        const op = c.op * (1 - tween(frame, c.hit + 1, c.hit + 16, [0, 1], EASE.out));
        if (op < 0.01) return null;
        const rr = c.r * (1 + hit * 0.3);
        const deg = (Math.atan2(p.y, p.x) * 180) / Math.PI;
        return (
          <g key={c.i} transform={`translate(${p.x} ${p.y}) rotate(${deg})`} opacity={op}>
            <ellipse rx={rr * c.long} ry={rr} fill="url(#c01-corona)" />
            <circle cx={-rr * 0.2} r={rr * 0.42} fill="url(#c01-cnuc)" />
          </g>
        );
      })}
    </g>
  );
};
