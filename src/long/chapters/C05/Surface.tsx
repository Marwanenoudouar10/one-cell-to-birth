import React from "react";
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { EASE, pop, tween } from "../../../lib/ease";
import { smoothPath } from "../../../shared/embryo/math";
import { BEATS as B } from "./beats";
import { MESO_ORIGIN, STREAK, project } from "./geo";
import { View, clamp01, lerp } from "./view";
import { mix } from "./DiscDefs";

// Details on the dorsal (ectoderm) face, drawn clipped to it:
// a faint cell speckle, the primitive streak drawing itself tail -> middle,
// cells pouring into it, and the rose glow of the new middle layer spreading
// underneath the translucent top layer.

const SPECKLE = Array.from({ length: 46 }, (_, i) => ({
  x: (random(`c05-sx${i}`) * 2 - 1) * 0.86,
  vf: (random(`c05-sv${i}`) * 2 - 1) * 0.78,
  r: 3 + random(`c05-sr${i}`) * 3.6,
}));

const POUR = Array.from({ length: 44 }, (_, i) => {
  const side = i % 2 === 0 ? 1 : -1;
  return {
    x: -0.95 + random(`c05-px${i}`) * 1.45,
    vf: side * (0.25 + random(`c05-pv${i}`) * 0.6),
    t0: B.pourStart + Math.round(random(`c05-pt${i}`) * 16),
    dur: 11 + Math.round(random(`c05-pd${i}`) * 5),
    r: 9 + random(`c05-pr${i}`) * 5,
  };
});

export const streakProgress = (f: number) => tween(f, B.streakStart, B.streakEnd, [0, 1], EASE.inOut);

const pourPos = (v: View, c: (typeof POUR)[number], p: number) => {
  const xT = Math.max(STREAK.x0 + 0.04, Math.min(STREAK.x1 - 0.02, c.x));
  const k = p * p * p; // pulled in: slow start, fast dive
  return project(v, lerp(c.x, xT, k), lerp(c.vf, 0, k), 1);
};

export const Surface: React.FC<{ v: View; f: number }> = ({ v, f }) => {
  const flat = 1 - v.side; // details fade as the face turns edge-on
  const sp = streakProgress(f);
  // the new middle layer seen glowing through the top layer while it spreads
  const under = v.meso * (1 - tween(f, B.pourEnd - 4, B.tiltEnd, [0, 1], EASE.inOut));
  const uc = project(v, MESO_ORIGIN, 0, 1);
  const ux = Math.min(1.4, v.meso * 2.1 * 0.62) * v.A;
  const uy = ux * (v.B / v.A) * Math.sin((v.phi * Math.PI) / 180);
  // "Week four": one slow light sweep across the face, peaking on the word
  const sw = tween(f, B.sheen - 14, B.sheen + 22, [-1.5, 1.5], EASE.inOut);
  const swO = tween(f, B.sheen - 14, B.sheen - 4, [0, 1]) * tween(f, B.sheen + 12, B.sheen + 22, [1, 0]);
  const sx = v.cx + sw * v.A;
  return (
    <g>
      {swO > 0.01 && (
        <>
          <defs>
            <linearGradient id="c05-sheen" gradientUnits="userSpaceOnUse" x1={sx - 120} y1={v.cy - 60} x2={sx + 120} y2={v.cy + 60}>
              <stop offset="0" stopColor={C.text} stopOpacity={0} />
              <stop offset="0.5" stopColor={C.text} stopOpacity={0.55} />
              <stop offset="1" stopColor={C.text} stopOpacity={0} />
            </linearGradient>
          </defs>
          <rect x={v.cx - v.A - 20} y={v.cy - v.B - 20} width={2 * v.A + 40} height={2 * v.B + 40} fill="url(#c05-sheen)" opacity={swO * flat} />
        </>
      )}
      <g opacity={0.5 * flat}>
        {SPECKLE.map((c, i) => {
          const p = project(v, c.x, c.vf, 1);
          return <circle key={i} cx={p.x} cy={p.y} r={c.r} fill="url(#c05-soft)" />;
        })}
      </g>
      {under > 0.01 && <ellipse cx={uc.x} cy={uc.y} rx={ux} ry={Math.max(1, uy)} fill="url(#c05-under)" opacity={under * 0.85} />}
      {POUR.map((c, i) => {
        const p = clamp01((f - c.t0) / c.dur);
        if (f < c.t0 - 4 || p >= 1) return null;
        const a = pourPos(v, c, p);
        const b = pourPos(v, c, Math.min(1, p + 0.06));
        const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        const speed = Math.min(1, Math.hypot(b.x - a.x, b.y - a.y) / 14);
        const o = clamp01((f - c.t0 + 4) / 5) * (1 - clamp01((p - 0.82) / 0.18)) * flat;
        const r = c.r * (1 - 0.7 * p * p);
        return (
          <g key={i} opacity={o}>
            <ellipse cx={a.x} cy={a.y} rx={r * (1.6 + 1.4 * speed)} ry={r * 1.2} transform={`rotate(${ang} ${a.x} ${a.y})`} fill="url(#c05-soft)" />
            <circle cx={a.x} cy={a.y} r={r * 0.55} fill={C.text} opacity={0.9} />
          </g>
        );
      })}
      {sp > 0.001 && <Streak v={v} f={f} p={sp} />}
    </g>
  );
};

// The primitive streak: a groove with bright lips, drawn from the tail end
// forward, a spark at its tip; the node pops at its head end when it is done.
const Streak: React.FC<{ v: View; f: number; p: number }> = ({ v, f, p }) => {
  const n = 24;
  const x1 = lerp(STREAK.x0, STREAK.x1, p);
  const line = (vf: number) => {
    const pts = Array.from({ length: n + 1 }, (_, i) => project(v, lerp(STREAK.x0, x1, i / n), vf, 1));
    return smoothPath(pts, false);
  };
  const tip = project(v, x1, 0, 1);
  const drawing = p < 1 ? 1 : 1 - tween(f, B.streakEnd, B.streakEnd + 8, [0, 1]);
  const node = pop(f, B.streakEnd - 2);
  // cells arriving make the streak flare
  const fed = tween(f, B.pourStart + 4, B.pourStart + 12, [0, 1]) * tween(f, B.pourEnd - 4, B.tiltEnd, [1, 0]);
  const fade = 1 - 0.8 * v.side;
  return (
    <g opacity={fade}>
      {/* a soft shaded trench gives the bright core contrast on the pale face */}
      <path d={line(0.05)} fill="none" stroke={mix(C.cellBlue, C.wombDeep, 0.25)} strokeOpacity={0.5} strokeWidth={30} strokeLinecap="round" filter="url(#c05-halo-s)" />
      {/* wide soft bloom + tight glow: it must read as a bright line at phone size */}
      <path d={line(0)} fill="none" stroke={C.cellCyan} strokeOpacity={0.32 + 0.3 * fed} strokeWidth={54 + 18 * fed} strokeLinecap="round" filter="url(#c05-halo)" />
      <path d={line(0)} fill="none" stroke={C.cell} strokeOpacity={0.55 + 0.3 * fed} strokeWidth={18 + 10 * fed} strokeLinecap="round" filter="url(#c05-halo-s)" />
      {/* the groove: a shaded far lip, a bright core, a lit near lip */}
      <path d={line(0.16)} fill="none" stroke={mix(C.cellBlue, C.wombDeep, 0.4)} strokeOpacity={0.45} strokeWidth={4.5} strokeLinecap="round" />
      <path d={line(0)} fill="none" stroke={C.text} strokeOpacity={0.98} strokeWidth={9 + 3 * fed} strokeLinecap="round" />
      <path d={line(-0.17)} fill="none" stroke={C.cell} strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
      {drawing > 0.01 && (
        <g opacity={drawing}>
          <circle cx={tip.x} cy={tip.y} r={50} fill="url(#c05-soft)" />
          <circle cx={tip.x} cy={tip.y} r={11} fill={C.text} />
        </g>
      )}
      {node > 0.01 && (
        <g transform={`translate(${tip.x} ${tip.y}) scale(${node})`}>
          <circle r={34} fill="url(#c05-soft)" opacity={0.8} />
          <circle r={15} fill={C.cell} opacity={0.95} filter="url(#c05-soften)" />
          <circle r={5.5} cy={1} fill={mix(C.cellBlue, C.wombDeep, 0.4)} opacity={0.55} />
        </g>
      )}
    </g>
  );
};
