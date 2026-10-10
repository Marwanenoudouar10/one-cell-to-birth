import React from "react";
import { C } from "../../../theme/colors";
import { closedPath, edgePath, smooth } from "./geometry";
import { nucOff3 } from "./c03";
import { cellStops, mix } from "./palette";
import { Prim } from "./prims";

// Draws the cells (look copied from the teaser's Scene2): soft lit bodies,
// back-lit membrane rim, contact faces with a little ambient occlusion,
// nuclei and a specular highlight on the big round morula cells.
const ID = "c04c";
const n1 = (v: number) => Math.round(v * 10) / 10;

const CellDefs: React.FC<{ prims: Prim[]; tint: number }> = ({ prims, tint }) => (
  <defs>
    {prims.map((p) => (
      <radialGradient
        key={p.key}
        id={`${ID}-${p.key}`}
        gradientUnits="userSpaceOnUse"
        cx={n1(p.cx)}
        cy={n1(p.cy)}
        r={n1(Math.max(4, p.er * 1.3))}
        fx={n1(p.cx - p.er * 0.4)}
        fy={n1(p.cy - p.er * 0.48)}
      >
        {cellStops(p.ring, tint, p.dark).map(([o, c]) => (
          <stop key={o} offset={o} stopColor={c} />
        ))}
      </radialGradient>
    ))}
  </defs>
);

// Nucleus: a soft, low-contrast disc at a seeded spot (C03's look: no
// catchlight, it fades as cells get small, so nothing reads as eyes).
const Nucleus: React.FC<{ p: Prim }> = ({ p }) => {
  if (p.er < 6) return null;
  const small = 0.3 + 0.7 * smooth((p.er - 30) / 42);
  const o = (1 - p.dark) * 0.5 * small * (1 - 0.5 * p.flat);
  if (o <= 0.01) return null;
  const [ox, oy] = nucOff3(p.key);
  return <circle cx={p.cx + p.er * ox} cy={p.cy + p.er * oy} r={p.er * 0.3} fill={`url(#${ID}-nuc)`} opacity={o} />;
};

const Spec: React.FC<{ p: Prim }> = ({ p }) => {
  const o = 0.75 * (1 - p.dark) * Math.min(1, (p.er - 20) / 15);
  if (o <= 0.01) return null;
  const x = n1(p.cx - p.er * 0.36);
  const y = n1(p.cy - p.er * 0.44);
  return (
    <ellipse cx={x} cy={y} rx={n1(p.er * 0.26)} ry={n1(p.er * 0.17)} transform={`rotate(-38 ${x} ${y})`} fill={`url(#${ID}-spec)`} opacity={o} />
  );
};

const CellView: React.FC<{ p: Prim; tint: number }> = ({ p, tint }) => {
  if (p.poly.pts.length < 3) return null;
  const body = closedPath(p.poly.pts);
  const rim = edgePath(p.poly, (t) => t === -1);
  const seam = edgePath(p.poly, (t) => t >= 0);
  const lit = 1 - p.dark;
  const rw = Math.max(1, Math.min(5, p.er * 0.04));
  const glowW = p.er < 18 ? rw * 2 : rw * 3.4;
  const crease = mix(C.skinShade, C.womb, tint * 0.6);
  const membrane = mix(C.text, C.peach, tint * 0.5);
  return (
    <g>
      <path d={body} fill={`url(#${ID}-${p.key})`} />
      {seam && (
        <g>
          <path d={seam} fill="none" stroke={crease} strokeOpacity={0.32} strokeWidth={Math.max(2, p.er * 0.09)} strokeLinecap="round" />
          <path d={seam} fill="none" stroke={membrane} strokeOpacity={0.5 * lit} strokeWidth={Math.max(0.8, rw * 0.32)} strokeLinecap="round" />
        </g>
      )}
      <Nucleus p={p} />
      <Spec p={p} />
      {rim && (
        <>
          <path d={rim} fill="none" stroke={`url(#${ID}-rim)`} strokeWidth={glowW} strokeLinejoin="round" opacity={0.28 * lit} />
          <path d={rim} fill="none" stroke={membrane} strokeOpacity={0.2 * lit} strokeWidth={Math.max(0.8, rw * 0.35)} />
          <path d={rim} fill="none" stroke={`url(#${ID}-rim)`} strokeWidth={rw} strokeLinejoin="round" opacity={0.3 + 0.7 * lit} />
        </>
      )}
    </g>
  );
};

export const Cells: React.FC<{ prims: Prim[]; tint: number }> = ({ prims, tint }) => {
  const rimC = mix(C.text, C.rose, tint * 0.75);
  // Back-light rim swings from bottom-right toward straight below (womb glow).
  const x1 = 0.15 + 0.3 * tint;
  return (
    <g>
      <defs>
        <linearGradient id={`${ID}-rim`} x1={x1} y1={0.05} x2={1 - x1 * 0.6} y2={1}>
          <stop offset={0} stopColor={rimC} stopOpacity={0} />
          <stop offset={0.55} stopColor={rimC} stopOpacity={0.12} />
          <stop offset={1} stopColor={rimC} stopOpacity={0.95} />
        </linearGradient>
        <radialGradient id={`${ID}-spec`}>
          <stop offset={0} stopColor={C.text} stopOpacity={0.85} />
          <stop offset={1} stopColor={C.text} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${ID}-nuc`}>
          <stop offset={0} stopColor={mix(C.peach, C.text, 0.3)} stopOpacity={0.5} />
          <stop offset={0.6} stopColor={mix(C.peach, C.skinShade, 0.5)} stopOpacity={0.42} />
          <stop offset={0.85} stopColor={C.skinShade} stopOpacity={0.3} />
          <stop offset={1} stopColor={C.skinShade} stopOpacity={0} />
        </radialGradient>
      </defs>
      <CellDefs prims={prims} tint={tint} />
      {prims.map((p) => (
        <CellView key={p.key} p={p} tint={tint} />
      ))}
    </g>
  );
};
