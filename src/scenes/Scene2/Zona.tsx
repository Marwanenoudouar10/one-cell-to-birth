import React from "react";
import { C } from "../../theme/colors";
import { EASE, tween } from "../../lib/ease";
import { HATCH, R0, ZR } from "./timeline";
import { lerp, smooth } from "./geometry";

// The zona pellucida: the same glassy shell Scene1 ends on (a translucent
// band from the cell edge out to r = 175.5 with a bright outer edge). It thins
// as the blastocyst swells, splits open at the side facing the womb wall and
// its pieces drift up and away, left behind as the embryo sinks out of it.
const FRAGS: [number, number][] = [
  [-150, -30], // top
  [-30, 90], // right
  [90, 210], // left
];
const CRACKS = [-150, -30, 90];
const HIGHLIGHT: [number, number] = [196, 284];
const TINT: [number, number] = [20, 70];

const rad = (a: number) => (a * Math.PI) / 180;
const pt = (r: number, a: number) => [Math.cos(rad(a)) * r, Math.sin(rad(a)) * r];

const arc = (r: number, a0: number, a1: number) => {
  const [x0, y0] = pt(r, a0);
  const [x1, y1] = pt(r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};

// Part of span [b0, b1] (degrees) that falls inside fragment [a0, a1].
const overlap = (a0: number, a1: number, b0: number, b1: number): [number, number] | null => {
  for (const k of [-360, 0, 360]) {
    const lo = Math.max(a0, b0 + k);
    const hi = Math.min(a1, b1 + k);
    if (hi - lo > 1) return [lo, hi];
  }
  return null;
};

export const Zona: React.FC<{ f: number }> = ({ f }) => {
  const thin = tween(f, HATCH.swell0, HATCH.crack, [0, 1], EASE.inOut);
  const crack = tween(f, HATCH.crack, HATCH.crack + 22, [0, 1], EASE.out);
  const fade = 1 - tween(f, HATCH.crack + 4, HATCH.crack + 20, [0, 1], EASE.in);
  if (fade <= 0) return null;
  // Band from the cell edge to the outer edge (Scene1's exact stops at start).
  const rin = lerp(R0 * 0.988, 167, thin);
  const rout = lerp(ZR, 178, thin);
  const s0 = rin / rout;
  const stress = smooth((f - (HATCH.crack - 8)) / 8) * (1 - smooth((f - HATCH.crack - 1) / 8));
  const open = smooth(crack * 2.2) * 4;
  const intact = f < HATCH.crack;
  const band = (a0: number, a1: number) => (
    <path
      d={arc((rin + rout) / 2, a0, a1)}
      fill="none"
      stroke="url(#s2z-band)"
      strokeWidth={rout - rin}
    />
  );

  const shard = (a0: number, a1: number, i: number) => {
    const m = (a0 + a1) / 2;
    const [ox, oy] = pt(1, m);
    const L = Math.hypot(ox, oy - 0.9) || 1;
    const d = 130 * crack;
    const dx = (ox / L) * d;
    const dy = ((oy - 0.9) / L) * d;
    const spin = [8, -16, 16][i] * crack;
    const b0 = a0 + open;
    const b1 = a1 - open;
    const hl = overlap(b0, b1, HIGHLIGHT[0], HIGHLIGHT[1]);
    const tn = overlap(b0, b1, TINT[0], TINT[1]);
    return (
      <g
        key={i}
        transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${spin.toFixed(2)})`}
        style={{ filter: crack > 0.02 ? `blur(${(crack * 3).toFixed(2)}px)` : undefined }}
      >
        {band(b0, b1)}
        <path d={arc(rout, b0, b1)} fill="none" stroke={C.text} strokeOpacity={0.45} strokeWidth={1.65} />
        {hl && <path d={arc(rout - 3.6, hl[0], hl[1])} fill="none" stroke={C.text} strokeOpacity={0.7} strokeWidth={3.6} strokeLinecap="round" />}
        {tn && <path d={arc(rout - 3.6, tn[0], tn[1])} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={2.7} strokeLinecap="round" />}
        {/* fresh broken edges catch the light */}
        {!intact &&
          [b0, b1].map((a, k) => {
            const [x0, y0] = pt(rin, a);
            const [x1, y1] = pt(rout, a);
            return <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.text} strokeOpacity={0.6 * (1 - crack)} strokeWidth={2} strokeLinecap="round" />;
          })}
      </g>
    );
  };

  return (
    <g opacity={fade}>
      <defs>
        <radialGradient id="s2z-band" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={rout}>
          <stop offset={s0} stopColor={C.gold} stopOpacity={0} />
          <stop offset={s0 + (1 - s0) * 0.226} stopColor={C.gold} stopOpacity={0.12} />
          <stop offset={s0 + (1 - s0) * 0.55} stopColor={C.text} stopOpacity={0.16} />
          <stop offset={1} stopColor={C.text} stopOpacity={0.42} />
        </radialGradient>
        <radialGradient id="s2z-spark">
          <stop offset={0} stopColor={C.text} stopOpacity={1} />
          <stop offset={0.3} stopColor={C.gold} stopOpacity={0.55} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {intact ? (
        <g>
          <circle r={(rin + rout) / 2} fill="none" stroke="url(#s2z-band)" strokeWidth={rout - rin} />
          <circle r={rout} fill="none" stroke={C.text} strokeOpacity={0.45} strokeWidth={1.65} />
          <path d={arc(rout - 3.6, HIGHLIGHT[0], HIGHLIGHT[1])} fill="none" stroke={C.text} strokeOpacity={0.7} strokeWidth={3.6} strokeLinecap="round" />
          <path d={arc(rout - 3.6, TINT[0], TINT[1])} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={2.7} strokeLinecap="round" />
        </g>
      ) : (
        FRAGS.map(([a0, a1], i) => shard(a0, a1, i))
      )}
      {stress > 0.01 &&
        CRACKS.map((a, i) => {
          const [x, y] = pt((rin + rout) / 2, a);
          const big = a === 90 ? 1.35 : 1;
          return <circle key={i} cx={x} cy={y} r={(16 + 34 * stress) * big} fill="url(#s2z-spark)" opacity={stress} />;
        })}
    </g>
  );
};
