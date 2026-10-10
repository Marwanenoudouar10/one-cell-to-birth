// Copied verbatim from src/scenes/Scene1/Zygote.tsx (C00 end = Scene1's opening frame; ids prefixed c00-).
import React from "react";
import { Easing, interpolateColors } from "remotion";
import { EASE, tween } from "../../../../lib/ease";
import { C } from "../../../../theme/colors";
import { TRANSITION } from "../../../../theme/timing";
import { B, CDIR, END, R } from "./constants";
import { clamp, lerp } from "./math";

// The gold wave that floods the cell from the sperm's entry point, then
// settles into the finished zygote. The settled look (white-hot centre lit
// from upper-left, gold body, peach edge) is the END handoff that Scene2
// reproduces on its first frames, so its numbers must not drift.
const F = B.fertilise;
const mix = (a: string, b: string, t: number) => interpolateColors(t, [0, 1], [a, b]);

// settle: the wave's centre glides to its resting place; the white-hot core
// only fades in once it is nearly there (no white patch crossing the cell)
export const settleAt = (f: number) => tween(f, F + 6, END - 12, [0, 1], EASE.inOut);
const hotAt = (f: number) => tween(f, F + 12, END - 6, [0, 1], EASE.inOut);
// Remotion's fade keeps the outgoing scene opaque and lays Scene2 over it, so
// translucent layers outside the core fade out here instead of doubling up
// and popping off at the cut.
export const exitAt = (f: number) => 1 - clamp((f - END) / TRANSITION);

const ENTRY = { x: CDIR.x * R * 0.92, y: CDIR.y * R * 0.92 };
const REST = { x: -0.16 * R, y: -0.2 * R };
// the wave front travels fast, then slows as it reaches the far side
const WAVE = Easing.bezier(0.25, 0.5, 0.35, 1);
const radiusAt = (f: number) => lerp(lerp(6, R * 2.5, tween(f, F - 1, F + 16, [0, 1], WAVE)), R * 1.38, settleAt(f));

// [spreading offset, colour, alpha] -> [settled offset, colour, alpha]
const STOPS: [number, string, number, number, string, number][] = [
  [0, mix(C.gold, C.text, 0.6), 1, 0, C.text, 1],
  [0.22, C.gold, 0.95, 0.22, C.text, 0.96],
  [0.5, C.gold, 0.9, 0.5, C.gold, 0.96],
  [0.74, mix(C.gold, C.text, 0.35), 0.82, 0.8, C.gold, 0.95],
  [0.86, C.gold, 0.42, 0.92, C.peach, 0.85],
  [1, C.gold, 0, 1, C.peach, 0],
];

export const ZygoteDefs: React.FC<{ frame: number }> = ({ frame }) => {
  const st = settleAt(frame);
  const hot = hotAt(frame);
  return (
    <defs>
      <radialGradient
        id="c00-s1-gold"
        gradientUnits="userSpaceOnUse"
        cx={lerp(ENTRY.x, REST.x, st)}
        cy={lerp(ENTRY.y, REST.y, st)}
        r={radiusAt(frame)}
      >
        {STOPS.map(([o0, c0, a0, o1, c1, a1], i) => (
          <stop key={i} offset={lerp(o0, o1, st)} stopColor={mix(c0, c1, i < 2 ? hot : st)} stopOpacity={lerp(a0, a1, st)} />
        ))}
      </radialGradient>
    </defs>
  );
};

// the gold cytoplasm, clipped to the cell
export const ZygoteFill: React.FC<{ frame: number }> = ({ frame }) => {
  const on = tween(frame, F - 1, F + 1);
  if (on <= 0) return null;
  return (
    <g clipPath="url(#c00-s1-coreclip)" opacity={on}>
      <circle r={R} fill="url(#c00-s1-gold)" />
    </g>
  );
};
