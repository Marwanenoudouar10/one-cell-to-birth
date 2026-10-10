import React from "react";
import { C } from "../../theme/colors";
import { closedPath, edgePath } from "./geometry";
import { cellStops, mix } from "./palette";
import { Prim, buildPrims } from "./prims";
import { warmth } from "./timeline";

// Draws the embryo's cells: soft lit bodies, back-lit membrane rim, contact
// faces with a little ambient occlusion, nuclei, and the spindle hint.
const n1 = (v: number) => Math.round(v * 10) / 10;

const CellDefs: React.FC<{ prims: Prim[]; warm: number; id: string }> = ({ prims, warm, id }) => (
  <defs>
    {prims.map((p) => {
      const R = Math.max(4, p.gr * 1.3);
      return (
        <radialGradient
          key={p.key}
          id={`${id}-${p.key}`}
          gradientUnits="userSpaceOnUse"
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

const Nucleus: React.FC<{ p: Prim; id: string }> = ({ p, id }) => {
  if (p.nuc <= 0.01 || p.er < 6) return null;
  if (p.root) {
    // Zygote: two pronuclei pressed together (diagonal, just before syngamy).
    const r = p.er * 0.2;
    const o = r * 0.62;
    return (
      <g opacity={p.nuc * 0.75}>
        {[-1, 1].map((s) => (
          <g key={s}>
            <circle cx={p.cx + s * o * 0.9} cy={p.cy + 6 - s * o * 0.55} r={r} fill={`url(#${id}-nuc)`} />
            <circle cx={p.cx + s * o * 0.9 - r * 0.2} cy={p.cy + 6 - s * o * 0.55 - r * 0.15} r={r * 0.2} fill={C.text} opacity={0.35} />
          </g>
        ))}
      </g>
    );
  }
  const r = p.er * 0.3;
  return (
    <g opacity={p.nuc * (1 - p.dark) * 0.8}>
      <circle cx={p.cx + p.er * 0.05} cy={p.cy + p.er * 0.04} r={r} fill={`url(#${id}-nuc)`} />
      <circle cx={p.cx - r * 0.15} cy={p.cy - r * 0.1} r={r * 0.24} fill={C.text} opacity={0.35} />
    </g>
  );
};

// A furrowing cell still has ONE nucleus: draw it once for the pair, at the
// pair's centre and clipped to both lobes, so a lobe drawn later never cuts
// it into crescents. The first split keeps the zygote's two pronuclei.
const PairNucleus: React.FC<{ p: Prim; q: Prim; id: string }> = ({ p, q, id }) => {
  const nuc = Math.max(p.nuc, q.nuc);
  if (nuc <= 0.01) return null;
  const cid = `${id}-n-${p.key}`;
  const one: Prim = { ...p, cx: p.ux, cy: p.uy, er: Math.max(p.er, q.er), nuc, root: p.key.length === 2 };
  return (
    <g>
      <defs>
        <clipPath id={cid}>
          <path d={closedPath(p.poly.pts)} />
          <path d={closedPath(q.poly.pts)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${cid})`}>
        <Nucleus p={one} id={id} />
      </g>
    </g>
  );
};

const Spec: React.FC<{ x: number; y: number; r: number; o: number; id: string }> = ({ x, y, r, o, id }) => (
  <ellipse
    cx={n1(x - r * 0.36)}
    cy={n1(y - r * 0.44)}
    rx={n1(r * 0.26)}
    ry={n1(r * 0.17)}
    transform={`rotate(-38 ${n1(x - r * 0.36)} ${n1(y - r * 0.44)})`}
    fill={`url(#${id}-spec)`}
    opacity={o}
  />
);

// A young furrow is still one cell: one highlight for the pair, clipped to the
// union of both lobes, drawn right after the later of the two.
const PairSpec: React.FC<{ p: Prim; q: Prim; id: string }> = ({ p, q, id }) => {
  const o = 0.75 * (1 - p.dark) * (1 - p.t) * Math.min(1, (p.ur - 20) / 15);
  if (o <= 0.01) return null;
  const cid = `${id}-u-${p.key}`;
  return (
    <g>
      <defs>
        <clipPath id={cid}>
          <path d={closedPath(p.poly.pts)} />
          <path d={closedPath(q.poly.pts)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${cid})`}>
        <Spec x={p.ux} y={p.uy} r={p.ur} o={o} id={id} />
      </g>
    </g>
  );
};

const CellView: React.FC<{ p: Prim; id: string; warm: number }> = ({ p, id, warm }) => {
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
      <path d={body} fill={`url(#${id}-${p.key})`} />
      {seam && seamEl(seam, 1)}
      {furrow && p.furrow > 0.01 && seamEl(furrow, p.furrow)}
      {!p.partnerKey && <Nucleus p={p} id={id} />}
      {p.er > 20 && p.t > 0.01 && <Spec x={p.cx} y={p.cy} r={p.er} o={0.75 * lit * p.t * Math.min(1, (p.er - 20) / 15)} id={id} />}
      {rim && (
        <>
          <path d={rim} fill="none" stroke={`url(#${id}-rim)`} strokeWidth={glowW} strokeLinejoin="round" opacity={0.28 * lit} />
          <path d={rim} fill="none" stroke={membrane} strokeOpacity={0.2 * lit} strokeWidth={Math.max(0.8, rw * 0.35)} />
          <path d={rim} fill="none" stroke={`url(#${id}-rim)`} strokeWidth={rw} strokeLinejoin="round" opacity={0.3 + 0.7 * lit} />
        </>
      )}
    </g>
  );
};

export const CellLayer: React.FC<{ f: number }> = ({ f }) => {
  const id = "s2c";
  const { prims, spindles } = buildPrims(f);
  const warm = warmth(f);
  const rimC = mix(C.text, C.rose, warm * 0.75);
  // Back-light rim swings from bottom-right toward straight below (womb glow).
  const x1 = 0.15 + 0.3 * warm;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-rim`} x1={x1} y1={0.05} x2={1 - x1 * 0.6} y2={1}>
          <stop offset={0} stopColor={rimC} stopOpacity={0} />
          <stop offset={0.55} stopColor={rimC} stopOpacity={0.12} />
          <stop offset={1} stopColor={rimC} stopOpacity={0.95} />
        </linearGradient>
        <radialGradient id={`${id}-spec`}>
          <stop offset={0} stopColor={C.text} stopOpacity={0.85} />
          <stop offset={1} stopColor={C.text} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-nuc`}>
          <stop offset={0} stopColor={mix(C.peach, C.text, 0.3)} stopOpacity={0.5} />
          <stop offset={0.6} stopColor={mix(C.peach, C.skinShade, 0.5)} stopOpacity={0.42} />
          <stop offset={0.85} stopColor={C.skinShade} stopOpacity={0.3} />
          <stop offset={1} stopColor={C.skinShade} stopOpacity={0} />
        </radialGradient>
      </defs>
      <CellDefs prims={prims} warm={warm} id={id} />
      {prims.map((p, i) => {
        const j = p.partnerKey ? prims.findIndex((o) => o.key === p.partnerKey) : -1;
        return (
          <React.Fragment key={p.key}>
            <CellView p={p} id={id} warm={warm} />
            {j >= 0 && j < i && <PairNucleus p={p} q={prims[j]} id={id} />}
            {j >= 0 && j < i && p.t < 0.99 && <PairSpec p={p} q={prims[j]} id={id} />}
          </React.Fragment>
        );
      })}
      {spindles.map((s, i) => (
        <g key={i} opacity={s.o}>
          {[
            [s.x1, s.y1],
            [s.x2, s.y2],
          ].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={11} fill={`url(#${id}-star)`} opacity={0.8} />
          ))}
        </g>
      ))}
      <defs>
        <radialGradient id={`${id}-star`}>
          <stop offset={0} stopColor={C.text} stopOpacity={0.95} />
          <stop offset={0.3} stopColor={C.gold} stopOpacity={0.5} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
    </g>
  );
};
