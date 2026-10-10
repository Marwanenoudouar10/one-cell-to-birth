import React from "react";
import { C } from "../../../theme/colors";
import { closedPath, edgePath, smooth } from "./geometry";
import { cellStops, mix } from "./palette";
import { Prim } from "./prims";
import { nucOff } from "./cells";

// (Adapted from the teaser's Scene2.) Draws the embryo's cells: soft lit
// bodies, back-lit membrane rim, contact faces with a little ambient
// occlusion and soft nuclei. The zygote's two pronuclei, the spindle and
// the first division's chromosomes are drawn by HeroNuclei.
const n1 = (v: number) => Math.round(v * 10) / 10;
const ID = "c03c";

// The root zygote is lit like C02's (its light is NOT squashed by the cell's
// stretch): `un` = [sx, sy] cancels the parent stretch for the root's
// gradient and highlight (1, 1 = no correction). It eases to 1 well before
// the first furrow, so the hand-over to the pair light never jumps.
export type Un = [number, number, number]; // [sx, sy, axis deg]
const unXf = (un: Un) =>
  `rotate(${un[2].toFixed(3)}) scale(${un[0].toFixed(5)} ${un[1].toFixed(5)}) rotate(${(-un[2]).toFixed(3)})`;

const CellDefs: React.FC<{ prims: Prim[]; warm: number; un: Un }> = ({ prims, warm, un }) => (
  <defs>
    {prims.map((p) => {
      const R = Math.max(4, p.gr * 1.3);
      return (
        <radialGradient
          key={p.key}
          id={`${ID}-${p.key}`}
          gradientUnits="userSpaceOnUse"
          gradientTransform={p.root ? unXf(un) : undefined}
          cx={n1(p.gx)}
          cy={n1(p.gy)}
          r={n1(R)}
          fx={n1(p.gx - p.gr * 0.4)}
          fy={n1(p.gy - p.gr * 0.48)}
        >
          {cellStops(warm, p.dark).map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </radialGradient>
      );
    })}
  </defs>
);

// Nucleus: a soft, low-contrast disc (no catchlight: a lit dot in every cell
// read as eyes / a dotted pod). It fades as the cells get small, so the
// morula reads as a smooth mulberry, not a field of dots.
const Nucleus: React.FC<{ p: Prim }> = ({ p }) => {
  if (p.nuc <= 0.01 || p.er < 6) return null;
  const r = p.er * 0.3;
  const small = 0.3 + 0.7 * smooth((p.er - 30) / 42);
  const [ox, oy] = nucOff(p.key);
  return (
    <circle
      cx={p.cx + p.er * ox}
      cy={p.cy + p.er * oy}
      r={r}
      fill={`url(#${ID}-nuc)`}
      opacity={p.nuc * (1 - p.dark) * 0.5 * small}
    />
  );
};

// A furrowing cell still has ONE nucleus: draw it once for the pair, at the
// pair's centre and clipped to both lobes (never cut into crescents).
const PairNucleus: React.FC<{ p: Prim; q: Prim }> = ({ p, q }) => {
  const nuc = Math.max(p.nuc, q.nuc);
  if (nuc <= 0.01) return null;
  const cid = `${ID}-n-${p.key}`;
  const one: Prim = { ...p, key: p.key.slice(0, -1), cx: p.ux, cy: p.uy, er: Math.max(p.er, q.er), nuc }; // parent key: same nucleus spot
  return (
    <g>
      <defs>
        <clipPath id={cid}>
          <path d={closedPath(p.poly.pts)} />
          <path d={closedPath(q.poly.pts)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${cid})`}>
        <Nucleus p={one} />
      </g>
    </g>
  );
};

const Spec: React.FC<{ x: number; y: number; r: number; o: number }> = ({ x, y, r, o }) => (
  <ellipse
    cx={n1(x - r * 0.36)}
    cy={n1(y - r * 0.44)}
    rx={n1(r * 0.26)}
    ry={n1(r * 0.17)}
    transform={`rotate(-38 ${n1(x - r * 0.36)} ${n1(y - r * 0.44)})`}
    fill={`url(#${ID}-spec)`}
    opacity={o}
  />
);

// A young furrow is still one cell: one highlight for the pair.
const PairSpec: React.FC<{ p: Prim; q: Prim }> = ({ p, q }) => {
  const o = 0.75 * (1 - p.dark) * (1 - p.t) * Math.min(1, (p.ur - 20) / 15);
  if (o <= 0.01) return null;
  const cid = `${ID}-u-${p.key}`;
  return (
    <g>
      <defs>
        <clipPath id={cid}>
          <path d={closedPath(p.poly.pts)} />
          <path d={closedPath(q.poly.pts)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${cid})`}>
        <Spec x={p.ux} y={p.uy} r={p.ur} o={o} />
      </g>
    </g>
  );
};

const CellView: React.FC<{ p: Prim; warm: number; un: Un }> = ({ p, warm, un }) => {
  if (p.poly.pts.length < 3) return null;
  const body = closedPath(p.poly.pts);
  const rim = edgePath(p.poly, (t) => t === -1);
  const seam = edgePath(p.poly, (t) => t >= 0 && t !== p.partnerId);
  const furrow = p.partnerId >= 0 ? edgePath(p.poly, (t) => t === p.partnerId) : "";
  const lit = 1 - p.dark;
  const rw = Math.max(1, Math.min(5, p.er * 0.04));
  const glowW = p.er < 18 ? rw * 2 : rw * 3.4;
  const crease = mix(C.skinShade, C.womb, warm * 0.6);
  const membrane = mix(C.text, C.peach, warm * 0.5);
  const seamEl = (d: string, o: number) => (
    <g opacity={o}>
      <path d={d} fill="none" stroke={crease} strokeOpacity={0.32} strokeWidth={Math.max(2, p.er * 0.09)} strokeLinecap="round" />
      <path d={d} fill="none" stroke={membrane} strokeOpacity={0.5 * lit} strokeWidth={Math.max(0.8, rw * 0.32)} strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <path d={body} fill={`url(#${ID}-${p.key})`} />
      {seam && seamEl(seam, 1)}
      {furrow && p.furrow > 0.01 && seamEl(furrow, p.furrow)}
      {!p.partnerKey && <Nucleus p={p} />}
      {p.er > 20 && p.t > 0.01 && (
        <g transform={p.root ? unXf(un) : undefined}>
          <Spec x={p.cx} y={p.cy} r={p.er} o={0.75 * lit * p.t * Math.min(1, (p.er - 20) / 15)} />
        </g>
      )}
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

export const CellLayer: React.FC<{ prims: Prim[]; warm: number; un: Un }> = ({ prims, warm, un }) => {
  const rimC = mix(C.text, C.rose, warm * 0.75);
  const x1 = 0.15 + 0.3 * warm;
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
      <CellDefs prims={prims} warm={warm} un={un} />
      {prims.map((p, i) => {
        const j = p.partnerKey ? prims.findIndex((o) => o.key === p.partnerKey) : -1;
        const hero = p.key.length === 2; // first division: HeroNuclei owns it
        return (
          <React.Fragment key={p.key}>
            <CellView p={p} warm={warm} un={un} />
            {j >= 0 && j < i && !hero && <PairNucleus p={p} q={prims[j]} />}
            {j >= 0 && j < i && p.t < 0.99 && <PairSpec p={p} q={prims[j]} />}
          </React.Fragment>
        );
      })}
    </g>
  );
};
