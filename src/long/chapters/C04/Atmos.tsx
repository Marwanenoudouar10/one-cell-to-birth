import React from "react";
import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { CY, WALL } from "./timeline";
import { at03, wallScroll3 } from "./c03";

// Air around the ball: drifting specks with parallax (world px), and the
// warm rose wash of the close-up at the end (screen px).

const SPECKS = Array.from({ length: 40 }, (_, i) => {
  const p = 0.55 + random(`c04sp-p${i}`) * 0.95;
  return {
    x: random(`c04sp-x${i}`) * WIDTH,
    y: CY - 900 + random(`c04sp-y${i}`) * (WALL - CY + 1500),
    p,
    r: 1.6 + (p - 0.5) * 5,
    a: 0.12 + random(`c04sp-a${i}`) * 0.3,
    c: i % 3,
  };
});
const COLS = [C.cell, C.gold, C.peach];

// Parallax: a layer at depth p moves p times as far as the main plane.
export const Specks: React.FC<{ f: number; camY: number; near: boolean }> = ({ f, camY, near }) => (
  <g>
    {!near && (
      <defs>
        {COLS.map((c, i) => (
          <radialGradient key={c} id={`c04a-sp${i}`}>
            <stop offset={0} stopColor={c} stopOpacity={1} />
            <stop offset={0.35} stopColor={c} stopOpacity={0.5} />
            <stop offset={1} stopColor={c} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
    )}
    {SPECKS.map((s, i) => {
      if (s.p > 1 !== near) return null;
      const dy = (camY - CY) * (1 - s.p);
      const x = s.x + noise2D("c04-sp", i * 3.3, f * 0.008) * 40;
      const y = s.y + dy + noise2D("c04-sp", f * 0.008, i * 2.7) * 40 - f * 0.25 * s.p;
      return <circle key={i} cx={x} cy={y} r={s.r * 2.6} fill={`url(#c04a-sp${s.c})`} opacity={s.a} />;
    })}
  </g>
);

// Full-frame warm rose glow that builds through the close-up.
export const WarmWash: React.FC<{ o: number }> = ({ o }) => {
  if (o <= 0.01) return null;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id="c04a-wash" gradientUnits="userSpaceOnUse" cx={540} cy={860} r={1000}>
          <stop offset={0} stopColor={C.rose} stopOpacity={0.24} />
          <stop offset={0.45} stopColor={C.womb} stopOpacity={0.12} />
          <stop offset={1} stopColor={C.wombDeep} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c04a-wash2" gradientUnits="userSpaceOnUse" cx={540} cy={820} r={760}>
          <stop offset={0} stopColor={C.womb} stopOpacity={0.28} />
          <stop offset={0.55} stopColor={C.womb} stopOpacity={0.18} />
          <stop offset={1} stopColor={C.wombDeep} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#c04a-wash)" opacity={o} />
      <rect width={WIDTH} height={HEIGHT} fill="url(#c04a-wash2)" opacity={o * o} />
    </g>
  );
};

// Soft warm light of the buried ball glowing up through the lining.
export const BuriedGlow: React.FC<{ x: number; y: number; r: number; o: number; knot: [number, number] }> = ({ x, y, r, o, knot }) => {
  if (o <= 0.01) return null;
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={o}>
      <defs>
        <radialGradient id="c04a-bur">
          <stop offset={0} stopColor={C.peach} stopOpacity={0.32} />
          <stop offset={0.55} stopColor={C.rose} stopOpacity={0.14} />
          <stop offset={1} stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c04a-burk">
          <stop offset={0} stopColor={C.gold} stopOpacity={0.7} />
          <stop offset={0.5} stopColor={C.gold} stopOpacity={0.2} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 1.5} fill="url(#c04a-bur)" />
      <circle cx={x + knot[0]} cy={y + knot[1]} r={r * 0.62} fill="url(#c04a-burk)" />
      {/* the shell's outline, glowing up through the lining */}
      <circle cx={x} cy={y} r={r - 4} fill="none" stroke={C.rose} strokeOpacity={0.35} strokeWidth={16} style={{ filter: "blur(7px)" }} />
      <circle cx={x} cy={y} r={r - 4} fill="none" stroke={C.peach} strokeOpacity={0.32} strokeWidth={2.4} />
    </g>
  );
};

// C03's tube motes (screen px, copied), carried on C03's clock at the 0.4
// strength C03 ends on, so the fade is seamless; they hand over to the
// specks above once C03 is gone.
const MOTES = Array.from({ length: 34 }, (_, i) => {
  const p = 0.35 + random(`c03m-p${i}`) * 1.25;
  return {
    x: random(`c03m-x${i}`) * WIDTH,
    y: random(`c03m-y${i}`) * 2400 - 200,
    p,
    r: 1.4 + p * 3.2,
    a: 0.1 + random(`c03m-a${i}`) * 0.26,
    c: i % 3,
  };
});
const flow = (a: number, b: number) => noise2D("c03-flow", a, b);

export const TubeMotes: React.FC<{ f: number; near: boolean; op: number }> = ({ f, near, op }) => {
  if (op <= 0.005) return null;
  const f3 = at03(f);
  return (
    <g opacity={op}>
      <defs>
        {COLS.map((c, i) => (
          <radialGradient key={c} id={`c04a-m${near ? "n" : "f"}${i}`}>
            <stop offset={0} stopColor={c} stopOpacity={1} />
            <stop offset={0.35} stopColor={c} stopOpacity={0.5} />
            <stop offset={1} stopColor={c} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      {MOTES.map((m, i) => {
        if (m.p > 1 !== near) return null;
        const span = 2400;
        const raw = m.y - wallScroll3(f3, 0.9 * m.p, flow);
        const y = ((((raw + 200) % span) + span) % span) - 200 + noise2D("c03-m", i * 3.3, f3 * 0.008) * 30;
        const x = m.x + noise2D("c03-m", f3 * 0.008, i * 2.7) * 36;
        const band = Math.min(1, Math.max(0, (y - 300) / 120)) * Math.min(1, Math.max(0, (1290 - y) / 140));
        if (band <= 0.01) return null;
        return <circle key={i} cx={x} cy={y} r={m.r * 2.6} fill={`url(#c04a-m${near ? "n" : "f"}${m.c})`} opacity={m.a * band} />;
      })}
    </g>
  );
};
