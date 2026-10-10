import React from "react";
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { mix } from "./palette";
import { icmBodyPts } from "./morula";
import { Pt, closedPath, openPath, rot2 } from "./geometry";
import { B, cavityOpen, ringRadius, rollAt, tint } from "./timeline";
import { Warp, circlePts, warpPts } from "./warp";

// Light and fluid inside the ball (ball-local px): its warm glow, the fluid
// cavity of the hollow ball, the inner knot's soft body and its highlight.

export const knotCentre = (f: number): Pt => rot2(0, ringRadius(f) * 0.8, rollAt(f));

export const BallGlow: React.FC<{ f: number; buried: number; at: Pt }> = ({ f, buried, at }) => {
  const t = tint(f);
  const col = mix(C.gold, C.rose, t * (1 - 0.4 * buried));
  const hollow = 1 - 0.55 * cavityOpen(f);
  return (
    <g>
      <defs>
        <radialGradient id="c04i-glow">
          <stop offset={0} stopColor={col} stopOpacity={(0.24 + 0.1 * buried) * hollow} />
          <stop offset={0.42} stopColor={col} stopOpacity={0.08 + 0.08 * buried} />
          <stop offset={1} stopColor={col} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={at[0]} cy={at[1]} r={330} fill="url(#c04i-glow)" />
    </g>
  );
};

// C03's warm core behind the packed morula (gaps read as deeper cells); it
// drains away as the fluid cavity opens.
export const CoreFill: React.FC<{ f: number }> = ({ f }) => {
  const o = 1 - cavityOpen(f);
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <defs>
        <radialGradient id="c04i-core">
          <stop offset={0} stopColor={mix(C.gold, C.skinShade, 0.45)} stopOpacity={0.9} />
          <stop offset={0.6} stopColor={mix(C.gold, C.skinShade, 0.6)} stopOpacity={0.6} />
          <stop offset={1} stopColor={C.skinShade} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={118} fill="url(#c04i-core)" />
    </g>
  );
};

// Faint far wall of the hollow ball, seen through the clear fluid.
const BACKWALL = Array.from({ length: 30 }, (_, i) => {
  const a = i * 2.39996;
  const rr = Math.sqrt((i + 0.5) / 30) * 0.86;
  return { x: Math.cos(a) * rr, y: Math.sin(a) * rr, s: 0.16 + 0.04 * random(`c04bw${i}`) };
});

// Fluid gathers on the side away from the knot and pushes it to one side.
export const Cavity: React.FC<{ f: number; warp: Warp }> = ({ f, warp }) => {
  const o = cavityOpen(f);
  if (o <= 0.01) return null;
  const R = ringRadius(f);
  const r = (R - 5) * (0.3 + 0.7 * o);
  const [ox, oy] = rot2(0, -0.3 * R * (1 - o), rollAt(f));
  const t = tint(f);
  const d = closedPath(warpPts(warp, circlePts(r, 72, ox, oy)));
  const hl = r * 0.8;
  const arc: Pt[] = Array.from({ length: 11 }, (_, i) => {
    const a = -2.59 + (0.72 * i) / 10;
    return [ox + Math.cos(a) * hl, oy + Math.sin(a) * hl];
  });
  return (
    <g opacity={o}>
      <defs>
        <radialGradient id="c04i-cav" fx={0.4} fy={0.36}>
          <stop offset={0} stopColor={C.cell} stopOpacity={0.08} />
          <stop offset={0.72} stopColor={C.cell} stopOpacity={0.05} />
          <stop offset={0.93} stopColor={C.cellCyan} stopOpacity={0.16 * (1 - 0.6 * t)} />
          <stop offset={1} stopColor={C.cell} stopOpacity={0.3} />
        </radialGradient>
        <clipPath id="c04i-cavclip">
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={mix(C.bg1, C.wombDeep, t)} opacity={0.46 - 0.1 * t} />
      <g clipPath="url(#c04i-cavclip)" opacity={0.5}>
        {BACKWALL.map((b, i) => (
          <circle key={i} cx={ox + b.x * r} cy={oy + b.y * r} r={b.s * r} fill={C.peach} fillOpacity={0.035} stroke={C.rose} strokeOpacity={0.14} strokeWidth={1.2} />
        ))}
      </g>
      <path d={d} fill="url(#c04i-cav)" />
      <path d={openPath(warpPts(warp, arc))} fill="none" stroke={C.text} strokeOpacity={0.38} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

// The inner knot's shared soft body, under its cells.
export const KnotBody: React.FC<{ f: number; warp: Warp }> = ({ f, warp }) => {
  const o = tween(f, B.cavity + 5, B.cavity + 18, [0, 1], EASE.inOut);
  if (o <= 0.01) return null;
  const R = ringRadius(f);
  const roll = rollAt(f);
  const pts = warpPts(warp, icmBodyPts(R).map(([x, y]) => rot2(x, y, roll)));
  const [kx, ky] = knotCentre(f);
  return (
    <g opacity={o}>
      <defs>
        <radialGradient id="c04i-icm" gradientUnits="userSpaceOnUse" cx={kx} cy={ky} r={R * 0.6}>
          <stop offset={0} stopColor={mix(C.gold, C.text, 0.35)} stopOpacity={0.85} />
          <stop offset={0.6} stopColor={mix(C.gold, C.peach, 0.5)} stopOpacity={0.62} />
          <stop offset={1} stopColor={mix(C.peach, C.skinShade, 0.5)} stopOpacity={0.4} />
        </radialGradient>
      </defs>
      <path d={closedPath(pts)} fill="url(#c04i-icm)" />
      <path d={closedPath(pts)} fill="none" stroke={C.gold} strokeOpacity={0.4} strokeWidth={2} />
    </g>
  );
};

// "ball": the gold knot blooms softly and its outline catches the light,
// then it keeps a warm resting glow.
export const KnotLight: React.FC<{ f: number; warp: Warp }> = ({ f, warp }) => {
  const rest = tween(f, B.cavity + 8, B.knot - 4, [0, 1], EASE.inOut);
  const flash = tween(f, B.knot - 5, B.knot + 3, [0, 1], EASE.out) * (1 - tween(f, B.knot + 3, B.knot + 26, [0, 1], EASE.inOut));
  const o = 0.22 * rest + 0.55 * flash;
  if (o <= 0.01) return null;
  const roll = rollAt(f);
  // Centred a little inside the knot, so its soft light stays in the ball
  // instead of spilling past the zona as a stray halo.
  const kc = knotCentre(f);
  const [kx, ky] = warpPts(warp, [[kc[0] * 0.72, kc[1] * 0.72]])[0];
  const edge = closedPath(warpPts(warp, icmBodyPts(ringRadius(f)).map(([x, y]) => rot2(x, y, roll))));
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id="c04i-knot">
          <stop offset={0} stopColor={C.text} stopOpacity={0.8} />
          <stop offset={0.3} stopColor={C.gold} stopOpacity={0.45} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={kx} cy={ky} r={74 + 26 * flash} fill="url(#c04i-knot)" opacity={o} />
      {flash > 0.01 && (
        <g opacity={flash}>
          <path d={edge} fill="none" stroke={C.gold} strokeOpacity={0.6} strokeWidth={14} style={{ filter: "blur(6px)" }} />
          <path d={edge} fill="none" stroke={mix(C.gold, C.text, 0.5)} strokeOpacity={0.8} strokeWidth={2.2} />
        </g>
      )}
    </g>
  );
};

// "sends": the outer cells light up as they start to release the hormone.
export const ShellPulse: React.FC<{ f: number; r: number }> = ({ f, r }) => {
  const p = tween(f, B.message - 6, B.message + 4, [0, 1], EASE.out) * (1 - tween(f, B.message + 6, B.stream + 14, [0, 1], EASE.inOut));
  const rest = 0.3 * tween(f, B.message, B.stream + 10);
  const o = p + rest;
  if (o <= 0.01) return null;
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={o}>
      <circle r={r} fill="none" stroke={C.rose} strokeOpacity={0.55} strokeWidth={26} style={{ filter: "blur(10px)" }} />
      <circle r={r} fill="none" stroke={mix(C.peach, C.gold, 0.4)} strokeOpacity={0.6} strokeWidth={4} />
    </g>
  );
};
