// The magnified inset: a glassy lens grows out of one lung tip on a soft
// tether and shows a bronchiole ending in grape-like air sacs (fluid-filled,
// muted rose: no air, no bubbles). A shimmering golden film (surfactant) coats
// each bunch, one practice pulse runs through, the sacs swell softly and stay
// round. World px; render inside a <WombLayer>.
import React from "react";
import { C } from "../../../theme/colors";
import { EASE, pop } from "../../../lib/ease";
import { BEATS as B } from "./beats";
import { BRANCHES, LENS_R, MAX_D, Pt, SACS, rotPt } from "./lensArt";
import { lensFade, lensOpen, pulseProg, sacSwell, shimmerAt, surfProg } from "./motion";

export const LENS = { x: 250, y: 590, r: LENS_R } as const;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const f1 = (n: number) => n.toFixed(1);

// outer tangents of two circles -> a soft cone polygon
const tether = (a: Pt, ra: number, b: Pt, rb: number) => {
  const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const t = Math.atan2(b.y - a.y, b.x - a.x);
  const be = Math.acos(Math.max(-1, Math.min(1, (ra - rb) / L)));
  const P = (c: Pt, r: number, ang: number) => ({ x: c.x + r * Math.cos(ang), y: c.y + r * Math.sin(ang) });
  return [P(a, ra, t + be), P(b, rb, t + be), P(b, rb, t - be), P(a, ra, t - be)];
};

export const LungLens: React.FC<{ f: number; source: Pt }> = ({ f, source }) => {
  const open = lensOpen(f);
  const fade = lensFade(f);
  if (open <= 0.005 || fade <= 0.005) return null;
  const s = Math.max(0.001, open);
  const pos = EASE.out(clamp01(open));
  const cx = lerp(source.x, LENS.x, pos);
  const cy = lerp(source.y, LENS.y, pos);
  // canonical art enters from the bottom; turn it to face the source
  const deg = (Math.atan2(-(source.x - LENS.x), source.y - LENS.y) * 180) / Math.PI;
  const m = (p: Pt) => rotPt(p, deg);
  const D = clamp01((f - B.sacsBloom + 9) / 18) * MAX_D * 1.02;
  const surf = surfProg(f);
  const pp = pulseProg(f);
  const pulseA = pp > 0 && pp < 1.3 ? Math.sin(clamp01(pp / 1.3) * Math.PI) : 0;
  const sh = shimmerAt(f);
  const sacs = SACS.map((q, i) => {
    // each sac buds from its twig end and swells out to its place in the bunch
    const born = pop(f, B.sacsBloom + 2 + Math.round((q.d / MAX_D) * 8) + (q.order ? 0 : 2 + (i % 7)));
    const r = q.r * born * (1 + 0.1 * sacSwell(f, (q.d / MAX_D) * 8 + (i % 7) * 0.6));
    const u = Math.min(1, born);
    const p = { x: q.c.x + (q.p.x - q.c.x) * u, y: q.c.y + (q.p.y - q.c.y) * u };
    return { p: m(p), r, order: q.order };
  });
  const film = 3.2 * surf;
  const cone = tether(source, 20 * Math.min(1, s * 1.4), { x: cx, y: cy }, LENS.r * s);
  const ring = clamp01(open * 1.6);
  const qpath = (b: (typeof BRANCHES)[number]) => {
    const a = m(b.a), c = m(b.c), e = m(b.b);
    return `M${f1(a.x)},${f1(a.y)} Q${f1(c.x)},${f1(c.y)} ${f1(e.x)},${f1(e.y)}`;
  };
  return (
    <g opacity={fade}>
      <defs>
        <clipPath id="c14-lclip">
          <circle cx={0} cy={0} r={LENS.r - 2} />
        </clipPath>
        <clipPath id="c14-sclip">
          {sacs.map((q, i) => (
            <circle key={i} cx={q.p.x} cy={q.p.y} r={q.r + film} />
          ))}
        </clipPath>
        <radialGradient id="c14-lbg" cx="42%" cy="36%" r="72%">
          <stop offset="0%" stopColor={C.womb} stopOpacity={0.62} />
          <stop offset="58%" stopColor={C.wombDeep} stopOpacity={0.97} />
          <stop offset="100%" stopColor={C.bg2} />
        </radialGradient>
        <radialGradient id="c14-sacg" cx="36%" cy="32%" r="72%">
          <stop offset="0%" stopColor={C.rose} />
          <stop offset="50%" stopColor={C.womb} />
          <stop offset="100%" stopColor={C.wombDeep} />
        </radialGradient>
        <linearGradient id="c14-shim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.gold} stopOpacity={0} />
          <stop offset="50%" stopColor={C.text} stopOpacity={0.75} />
          <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
        </linearGradient>
        <filter id="c14-lglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>
      {/* tether cone + source ring on the lung tip */}
      <polygon points={cone.map((p) => `${f1(p.x)},${f1(p.y)}`).join(" ")} fill={C.peach} opacity={0.1 * ring} />
      <line x1={cone[0].x} y1={cone[0].y} x2={cone[1].x} y2={cone[1].y} stroke={C.text} strokeOpacity={0.4 * ring} strokeWidth={1.6} />
      <line x1={cone[3].x} y1={cone[3].y} x2={cone[2].x} y2={cone[2].y} stroke={C.text} strokeOpacity={0.4 * ring} strokeWidth={1.6} />
      <circle cx={source.x} cy={source.y} r={20 * Math.min(1, s * 1.4)} fill="none" stroke={C.text} strokeOpacity={0.8 * ring} strokeWidth={2.2} />
      {/* soft halo around the lens */}
      <circle cx={cx} cy={cy} r={LENS.r * s + 8} fill="none" stroke={C.peach} strokeOpacity={0.4} strokeWidth={16} filter="url(#c14-lglow)" />
      <g transform={`translate(${f1(cx)} ${f1(cy)}) scale(${s.toFixed(4)})`}>
        <g clipPath="url(#c14-lclip)">
          <circle cx={0} cy={0} r={LENS.r} fill="url(#c14-lbg)" />
          {/* bronchiole: glow, body, light edge; revealed from the edge inward */}
          <g filter="url(#c14-lglow)" opacity={0.6}>
            {BRANCHES.map((b, i) => {
              const k = clamp01((D - b.d0) / (b.d1 - b.d0));
              return k > 0 ? <path key={i} d={qpath(b)} pathLength={1} strokeDasharray={`${k} 2`} stroke={C.rose} strokeWidth={b.w * 2} strokeLinecap="round" fill="none" /> : null;
            })}
          </g>
          {BRANCHES.map((b, i) => {
            const k = clamp01((D - b.d0) / (b.d1 - b.d0));
            return k > 0 ? (
              <g key={i}>
                <path d={qpath(b)} pathLength={1} strokeDasharray={`${k} 2`} stroke={C.skinShade} strokeWidth={b.w} strokeLinecap="round" fill="none" />
                <path d={qpath(b)} pathLength={1} strokeDasharray={`${k} 2`} stroke={C.peach} strokeOpacity={0.8} strokeWidth={b.w * 0.32} strokeLinecap="round" fill="none" transform={`translate(${-b.w * 0.18} ${-b.w * 0.18})`} />
              </g>
            ) : null;
          })}
          {pulseA > 0.01 &&
            BRANCHES.map((b, i) => {
              const k = (pp * MAX_D - b.d0) / (b.d1 - b.d0);
              if (k < -0.3 || k > 1.3) return null;
              return (
                <g key={i}>
                  <path d={qpath(b)} pathLength={1} strokeDasharray="0.3 2" strokeDashoffset={-(k - 0.15)} stroke={C.gold} strokeOpacity={0.6 * pulseA} strokeWidth={b.w * 1.8} strokeLinecap="round" fill="none" filter="url(#c14-lglow)" />
                  <path d={qpath(b)} pathLength={1} strokeDasharray="0.22 2" strokeDashoffset={-(k - 0.11)} stroke={C.text} strokeOpacity={0.85 * pulseA} strokeWidth={b.w * 0.5} strokeLinecap="round" fill="none" />
                </g>
              );
            })}
          {/* surfactant film: gold glow + a solid coat under the sacs, so only
              the bunch's outer surface shows gold (a coating, not rings) */}
          {film > 0.05 && (
            <>
              <g filter="url(#c14-lglow)" opacity={0.7 * surf}>
                {sacs.map((q, i) => (q.r > 0.5 ? <circle key={i} cx={q.p.x} cy={q.p.y} r={q.r + film * 1.6} fill={C.gold} /> : null))}
              </g>
              {sacs.map((q, i) => (q.r > 0.5 ? <circle key={i} cx={q.p.x} cy={q.p.y} r={q.r + film} fill={C.gold} opacity={0.95} /> : null))}
            </>
          )}
          {/* the sacs: round, fluid-filled, lit from the upper left */}
          {sacs.map((q, i) => {
            if (q.r < 0.5) return null;
            const hx = q.p.x - q.r * 0.34;
            const hy = q.p.y - q.r * 0.38;
            return (
              <g key={i}>
                <circle cx={q.p.x} cy={q.p.y} r={q.r} fill="url(#c14-sacg)" stroke={C.wombDeep} strokeOpacity={0.75} strokeWidth={1.6} />
                <circle cx={q.p.x} cy={q.p.y} r={q.r * 0.86} fill="none" stroke={C.gold} strokeOpacity={0.35 * surf} strokeWidth={1.4} />
                <ellipse cx={hx} cy={hy} rx={q.r * 0.34} ry={q.r * 0.2} transform={`rotate(-32 ${f1(hx)} ${f1(hy)})`} fill={C.text} opacity={0.38} />
              </g>
            );
          })}
          {/* the shimmer sweeping across the coated bunches */}
          {surf > 0.05 && sh > -0.2 && sh < 1.3 && (
            <g clipPath="url(#c14-sclip)">
              <rect x={lerp(-LENS.r * 1.7, LENS.r * 0.9, sh)} y={-LENS.r * 1.6} width={LENS.r * 0.7} height={LENS.r * 3.2} fill="url(#c14-shim)" transform="rotate(22)" opacity={0.75} />
            </g>
          )}
        </g>
        {/* glass rim + house-light highlight (upper left) */}
        <circle cx={0} cy={0} r={LENS.r} fill="none" stroke={C.text} strokeOpacity={0.85} strokeWidth={3} />
        <path d={`M${-LENS.r * 0.82},${-LENS.r * 0.3} A${LENS.r * 0.88},${LENS.r * 0.88} 0 0 1 ${-LENS.r * 0.3},${-LENS.r * 0.82}`} stroke={C.text} strokeOpacity={0.4} strokeWidth={5} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
};
