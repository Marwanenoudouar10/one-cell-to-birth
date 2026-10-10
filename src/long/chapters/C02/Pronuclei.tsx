// The two pronuclei, one from each parent, in neutral tints (gold, peach):
// glassy bubbles with a few nucleolar beads inside. Once they press together
// they share a flat wall like two soap bubbles — side by side, never merged.
// Cell-local px; drawn inside the zygote body (above the cytoplasm).
import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { mix } from "./palette";
import { Pron, crispAt, meetGlow, polar, pronuclei } from "./motion";

type Look = { core: string; body: string; rim: string; bead: string; halo: string };
// C03's recipe (its START handoff draws these same bubbles), so the crossfade
// into C03 shows one pair, not two overlapping looks. Rims are darker shades
// of each bubble's own hue (no salmon outline that reads as pink). While the
// story needs them (crispAt = 1) rims, shadow and beads are a bit stronger so
// the pair reads at phone size; they soften to C03's exact values by END.
const LOOKS: Look[] = [
  // gold: the lighter, luminous one
  { core: mix(C.gold, C.text, 0.82), body: mix(C.gold, C.text, 0.4), rim: mix(C.gold, C.skinShade, 0.45), bead: mix(C.gold, C.skinShade, 0.5), halo: mix(C.gold, C.text, 0.5) },
  // peach: the warmer one
  { core: mix(C.peach, C.text, 0.55), body: mix(C.peach, C.gold, 0.12), rim: mix(mix(C.peach, C.skinShade, 0.4), C.gold, 0.2), bead: mix(C.peach, C.skinShade, 0.55), halo: C.peach },
];

// Nucleolar precursor bodies (NPBs): a small lumpy cluster per pronucleus,
// gathered toward the shared wall, as in healthy human zygotes. Hand-placed:
// the old random triangle of three equal beads read as a smiley face at
// phone size. [along the pair axis toward the partner, across it, radius],
// all x the pronucleus radius. HANDOFF: C03 must draw these same beads.
export const BEAD_LAYOUT: [number, number, number][][] = [
  [[0.36, -0.02, 0.17], [0.5, 0.18, 0.1], [0.28, 0.25, 0.075], [0.58, -0.15, 0.055], [0.15, -0.18, 0.045]], // gold
  [[0.38, 0.03, 0.16], [0.27, -0.21, 0.095], [0.53, -0.17, 0.07], [0.22, 0.2, 0.05]], // peach
];
// pronucleus-local px offset of a bead, given the pair axis (deg, gold -> peach)
const beadAt = (i: number, b: [number, number, number], axis: number, r: number) => {
  const a = axis + (i === 0 ? 0 : 180);
  const u = polar(1, a);
  return { x: (u.x * b[0] - u.y * b[1]) * r, y: (u.y * b[0] + u.x * b[1]) * r, r: b[2] * r };
};

const One: React.FC<{ p: Pron; i: number; f: number; clip?: string }> = ({ p, i, f, clip }) => {
  const L = LOOKS[i];
  const k = crispAt(f);
  const id = `c02-pn${i}`;
  const n = f * 0.02;
  return (
    <g opacity={p.op} clipPath={clip}>
      <defs>
        <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={p.x} cy={p.y} r={p.r} fx={p.x - p.r * 0.3} fy={p.y - p.r * 0.36}>
          <stop offset={0} stopColor={L.core} stopOpacity={0.85 + 0.1 * k} />
          <stop offset={0.5} stopColor={L.body} stopOpacity={0.62} />
          <stop offset={0.82} stopColor={L.body} stopOpacity={0.55} />
          <stop offset={1} stopColor={L.rim} stopOpacity={0.8 + 0.15 * k} />
        </radialGradient>
        <radialGradient id={`${id}-h`} gradientUnits="userSpaceOnUse" cx={p.x} cy={p.y} r={p.r * 1.45}>
          <stop offset={0.62} stopColor={L.halo} stopOpacity={0.3} />
          <stop offset={1} stopColor={L.halo} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-s`} gradientUnits="userSpaceOnUse" cx={p.x + p.r * 0.18} cy={p.y + p.r * 0.24} r={p.r * 1.25}>
          <stop offset={0.6} stopColor={C.skinShade} stopOpacity={0.3 + 0.2 * k} />
          <stop offset={1} stopColor={C.skinShade} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* soft shadow on the cytoplasm (away from the key light) + soft glow */}
      <circle cx={p.x + p.r * 0.18} cy={p.y + p.r * 0.24} r={p.r * 1.25} fill={`url(#${id}-s)`} />
      <circle cx={p.x} cy={p.y} r={p.r * 1.45} fill={`url(#${id}-h)`} />
      <circle cx={p.x} cy={p.y} r={p.r} fill={`url(#${id})`} />
      {BEAD_LAYOUT[i].map((b, k) => {
        const o = beadAt(i, b, p.axis, p.r);
        return (
          <circle
            key={k}
            cx={p.x + o.x + noise2D(`c02-bx${i}${k}`, n, 0) * 0.04 * p.r}
            cy={p.y + o.y + noise2D(`c02-by${i}${k}`, 0, n) * 0.04 * p.r}
            r={o.r}
            fill={L.bead}
            opacity={k === 0 ? 0.62 : 0.5}
          />
        );
      })}
      <circle cx={p.x} cy={p.y} r={p.r - 0.8} fill="none" stroke={L.rim} strokeOpacity={0.5 + 0.45 * k} strokeWidth={1.5 + 1.3 * k} />
      {/* glassy highlight toward the key light (upper left) */}
      <path
        d={arcD(p.x, p.y, p.r * 0.74, 198, 258)}
        fill="none"
        stroke={C.text}
        strokeOpacity={0.5 + 0.2 * k}
        strokeWidth={Math.max(1.4, p.r * 0.1)}
        strokeLinecap="round"
      />
    </g>
  );
};

const arcD = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p0 = polar(r, a0);
  const p1 = polar(r, a1);
  return `M${(cx + p0.x).toFixed(2)} ${(cy + p0.y).toFixed(2)}A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${(cx + p1.x).toFixed(2)} ${(cy + p1.y).toFixed(2)}`;
};

export const Pronuclei: React.FC<{ f: number }> = ({ f }) => {
  const [g, pc] = pronuclei(f);
  if (g.op <= 0.005) return null;
  const dx = pc.x - g.x;
  const dy = pc.y - g.y;
  const D = Math.hypot(dx, dy) || 1;
  const ux = dx / D;
  const uy = dy / D;
  const mx = (g.x + pc.x) / 2;
  const my = (g.y + pc.y) / 2;
  const pressed = D < g.r + pc.r;
  // half-planes either side of the shared wall (+0.6 px overlap, no hairline)
  const side = (s: number, o: number) => {
    const ax = mx + ux * o * s;
    const ay = my + uy * o * s;
    const pts = [
      [ax - uy * 300, ay + ux * 300],
      [ax + uy * 300, ay - ux * 300],
      [ax + uy * 300 + ux * 300 * s, ay - ux * 300 + uy * 300 * s],
      [ax - uy * 300 + ux * 300 * s, ay + ux * 300 + uy * 300 * s],
    ];
    return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  };
  const chord = pressed ? Math.sqrt(Math.max(0, g.r * g.r - (D / 2) ** 2)) : 0;
  const glow = meetGlow(f);
  return (
    <g>
      <defs>
        <clipPath id="c02-pc0">
          <polygon points={side(-1, -0.6)} />
        </clipPath>
        <clipPath id="c02-pc1">
          <polygon points={side(1, -0.6)} />
        </clipPath>
        <radialGradient id="c02-meet">
          <stop offset={0} stopColor={C.text} stopOpacity={0.9} />
          <stop offset={0.35} stopColor={C.gold} stopOpacity={0.45} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <One p={g} i={0} f={f} clip={pressed ? "url(#c02-pc0)" : undefined} />
      <One p={pc} i={1} f={f} clip={pressed ? "url(#c02-pc1)" : undefined} />
      {chord > 0.5 && (
        <line
          x1={mx - uy * chord}
          y1={my + ux * chord}
          x2={mx + uy * chord}
          y2={my - ux * chord}
          stroke={C.text}
          strokeOpacity={0.5 * g.op}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      )}
      {glow > 0.01 && <circle cx={mx} cy={my} r={18 + 26 * glow} fill="url(#c02-meet)" opacity={glow * 0.8} />}
    </g>
  );
};
