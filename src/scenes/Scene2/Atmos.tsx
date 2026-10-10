import React from "react";
import { noise2D } from "@remotion/noise";
import { random } from "remotion";
import { C } from "../../theme/colors";
import { HEIGHT, WIDTH } from "../../theme/layout";
import { EASE, tween } from "../../lib/ease";
import { mix } from "./palette";
import { smooth } from "./geometry";
import { B, CAV, CY, TISSUE_Y, cavityOpen, ringRadius, warmth } from "./timeline";
import { icmBodyPath } from "./blasto";

// Light and air around the embryo: its glow, the blastocyst's fluid cavity,
// the "hundreds" bloom, drifting specks with parallax, and screen washes.

export const ClusterGlow: React.FC<{ f: number }> = ({ f }) => {
  const warm = warmth(f);
  const bloom = tween(f, B.hundreds - 4, B.hundreds + 1, [0, 1], EASE.out) * (1 - tween(f, B.hundreds + 2, B.hundreds + 20));
  const col = mix(C.gold, C.rose, warm);
  const hollow = 1 - 0.6 * cavityOpen(f);
  return (
    <g>
      <defs>
        <radialGradient id="s2a-glow">
          <stop offset={0} stopColor={col} stopOpacity={(0.24 + 0.18 * bloom) * hollow} />
          <stop offset={0.42} stopColor={col} stopOpacity={0.08 + 0.06 * bloom} />
          <stop offset={1} stopColor={col} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={330 + 60 * bloom} fill="url(#s2a-glow)" />
    </g>
  );
};

// Warm shadow behind the packed cluster: the gaps between round cells read
// as more cells deeper inside, never as holes to the background.
export const CoreFill: React.FC<{ f: number }> = ({ f }) => {
  const o = tween(f, B.four - 8, B.four - 2) * (1 - cavityOpen(f));
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <defs>
        <radialGradient id="s2a-core">
          <stop offset={0} stopColor={mix(C.gold, C.skinShade, 0.45)} stopOpacity={0.9} />
          <stop offset={0.6} stopColor={mix(C.gold, C.skinShade, 0.6)} stopOpacity={0.6} />
          <stop offset={1} stopColor={C.skinShade} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={118} fill="url(#s2a-core)" />
    </g>
  );
};

export const Bloom: React.FC<{ f: number }> = ({ f }) => {
  const t = tween(f, B.hundreds - 3, B.hundreds + 16, [0, 1], EASE.out);
  if (t <= 0 || t >= 1) return null;
  return (
    <circle
      r={178 + 190 * t}
      fill="none"
      stroke={C.gold}
      strokeOpacity={0.26 * smooth((f - B.hundreds + 3) / 6) * (1 - t)}
      strokeWidth={40 * (1 - t) + 6}
      style={{ filter: "blur(14px)" }}
    />
  );
};

// Faint far wall of the hollow ball, seen through the clear fluid.
const BACKWALL = Array.from({ length: 30 }, (_, i) => {
  const a = i * 2.39996;
  const rr = Math.sqrt((i + 0.5) / 30) * 0.86;
  return { x: Math.cos(a) * rr, y: Math.sin(a) * rr, s: 0.16 + 0.04 * random(`bw${i}`) };
});

// Fluid gathers on the side away from the inner cells: the cavity swells from
// the upper side and pushes the inner cell mass down to the embryonic pole.
export const Cavity: React.FC<{ f: number }> = ({ f }) => {
  const o = cavityOpen(f);
  if (o <= 0.01) return null;
  const R = ringRadius(f);
  const r = (R - 5) * (0.3 + 0.7 * o);
  const hl = r * 0.8;
  const icm = tween(f, CAV.start + 5, CAV.start + 16, [0, 1], EASE.inOut);
  const warm = warmth(f);
  return (
    <g>
    <g opacity={o} transform={`translate(0 ${(-0.3 * R * (1 - o)).toFixed(1)})`}>
      <defs>
        <radialGradient id="s2a-cav" fx={0.4} fy={0.36}>
          <stop offset={0} stopColor={C.cell} stopOpacity={0.09} />
          <stop offset={0.72} stopColor={C.cell} stopOpacity={0.06} />
          <stop offset={0.93} stopColor={C.cellCyan} stopOpacity={0.18 * (1 - 0.6 * warmth(f))} />
          <stop offset={1} stopColor={C.cell} stopOpacity={0.34} />
        </radialGradient>
        <clipPath id="s2a-cavclip">
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r} fill={mix(C.bg1, C.wombDeep, warmth(f))} opacity={0.42 - 0.12 * warmth(f)} />
      <g clipPath="url(#s2a-cavclip)" opacity={0.5}>
        {BACKWALL.map((b, i) => (
          <circle
            key={i}
            cx={b.x * r}
            cy={b.y * r}
            r={b.s * r}
            fill={C.peach}
            fillOpacity={0.035}
            stroke={C.peach}
            strokeOpacity={0.12}
            strokeWidth={1.2}
          />
        ))}
      </g>
      <circle r={r} fill="url(#s2a-cav)" />
      <path
        d={`M${(-Math.cos(0.55) * hl).toFixed(1)} ${(-Math.sin(0.55) * hl).toFixed(1)}A${hl} ${hl} 0 0 1 ${(-Math.sin(0.3) * hl).toFixed(1)} ${(-Math.cos(0.3) * hl).toFixed(1)}`}
        fill="none"
        stroke={C.text}
        strokeOpacity={0.4}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </g>
      {icm > 0.01 && (
        <g opacity={icm}>
          <defs>
            <radialGradient id="s2a-icm" gradientUnits="userSpaceOnUse" cx={0} cy={R * 0.95} r={R * 0.75}>
              <stop offset={0} stopColor={mix(C.peach, C.rose, 0.3 * warm)} stopOpacity={0.75} />
              <stop offset={0.6} stopColor={mix(C.skinShade, C.rose, 0.4 * warm)} stopOpacity={0.6} />
              <stop offset={1} stopColor={mix(C.skinShade, C.womb, 0.5 * warm)} stopOpacity={0.35} />
            </radialGradient>
          </defs>
          <path d={icmBodyPath(R)} fill="url(#s2a-icm)" />
          <path d={icmBodyPath(R)} fill="none" stroke={C.peach} strokeOpacity={0.35} strokeWidth={2} />
        </g>
      )}
    </g>
  );
};

const SPECKS = Array.from({ length: 38 }, (_, i) => {
  const p = 0.55 + random(`sp-p${i}`) * 0.95;
  return {
    x: random(`sp-x${i}`) * WIDTH,
    y: CY - 900 + random(`sp-y${i}`) * (TISSUE_Y - CY + 1500),
    p,
    r: 1.6 + (p - 0.5) * 5,
    a: 0.12 + random(`sp-a${i}`) * 0.3,
    c: [C.cell, C.gold, C.peach][i % 3],
  };
});

// Parallax: a layer at depth p moves p times as far as the main plane.
export const Specks: React.FC<{ f: number; camY: number; near: boolean }> = ({ f, camY, near }) => (
  <g>
    <defs>
      {[C.cell, C.gold, C.peach].map((c, i) => (
        <radialGradient key={c} id={`s2a-sp${i}`}>
          <stop offset={0} stopColor={c} stopOpacity={1} />
          <stop offset={0.35} stopColor={c} stopOpacity={0.5} />
          <stop offset={1} stopColor={c} stopOpacity={0} />
        </radialGradient>
      ))}
    </defs>
    {SPECKS.filter((s) => s.p > 1 === near).map((s, i) => {
      const dy = (camY - CY) * (1 - s.p);
      const x = s.x + noise2D("s2-sp", i * 3.3, f * 0.008) * 40;
      const y = s.y + dy + noise2D("s2-sp", f * 0.008, i * 2.7) * 40 - f * 0.25 * s.p;
      return (
        <circle key={i} cx={x} cy={y} r={s.r * 2.6} fill={`url(#s2a-sp${i % 3})`} opacity={s.a} />
      );
    })}
  </g>
);

// Full-frame warm rose wash at the end (the handoff into Scene3's womb).
// It keeps building through the last frames so the dark plum above the wall
// turns womb-rose, matching the sac interior Scene3 opens on.
export const WarmWash: React.FC<{ f: number }> = ({ f }) => {
  const o = tween(f, B.implant - 2, B.implant + 24, [0, 1], EASE.inOut);
  const end = tween(f, B.implant + 2, B.implant + 22, [0, 1], EASE.inOut);
  if (o <= 0.01) return null;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id="s2a-wash" gradientUnits="userSpaceOnUse" cx={540} cy={880} r={1000}>
          <stop offset={0} stopColor={C.rose} stopOpacity={0.26} />
          <stop offset={0.45} stopColor={C.womb} stopOpacity={0.12} />
          <stop offset={1} stopColor={C.wombDeep} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="s2a-wash2" gradientUnits="userSpaceOnUse" cx={540} cy={820} r={760}>
          <stop offset={0} stopColor={C.womb} stopOpacity={0.3} />
          <stop offset={0.55} stopColor={C.womb} stopOpacity={0.2} />
          <stop offset={1} stopColor={C.wombDeep} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#s2a-wash)" opacity={o} />
      {end > 0.01 && <rect width={WIDTH} height={HEIGHT} fill="url(#s2a-wash2)" opacity={end} />}
    </g>
  );
};

// Keeps the caption band calm. The base layer is Scene1's own caption shade
// (so the crossfade matches); a second layer deepens it once the bright womb
// wall sits behind the words.
export const CaptionShade: React.FC<{ o: number }> = ({ o }) => (
  <g>
    <defs>
      <linearGradient id="s2a-cap0" x1={0} y1={0} x2={0} y2={1}>
        <stop offset={0.57} stopColor={C.bg0} stopOpacity={0} />
        <stop offset={0.69} stopColor={C.bg0} stopOpacity={0.5} />
        <stop offset={0.81} stopColor={C.bg0} stopOpacity={0.62} />
        <stop offset={1} stopColor={C.bg0} stopOpacity={0.5} />
      </linearGradient>
      <linearGradient id="s2a-cap" gradientUnits="userSpaceOnUse" x1={0} y1={1150} x2={0} y2={HEIGHT}>
        <stop offset={0} stopColor={C.bg0} stopOpacity={0} />
        <stop offset={0.19} stopColor={C.bg0} stopOpacity={0.5} />
        <stop offset={0.54} stopColor={C.bg0} stopOpacity={0.5} />
        <stop offset={1} stopColor={C.bg0} stopOpacity={0.15} />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#s2a-cap0)" />
    {o > 0.01 && <rect x={0} y={1150} width={WIDTH} height={HEIGHT - 1150} fill="url(#s2a-cap)" opacity={o} />}
  </g>
);
