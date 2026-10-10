import React from "react";
import { C } from "../../theme/colors";
import { EASE } from "../../lib/ease";
import { Pt, smooth } from "./geom";

// Elegant gold focus marks, drawn in fetus-local space on top of the body.

// A thin gold ring that draws itself on, with a glow and an outward echo.
export const Ring: React.FC<{ c: Pt; r: number; p: number; alpha: number }> = ({ c, r, p, alpha }) => {
  if (alpha <= 0.001 || p <= 0) return null;
  const grow = 0.82 + 0.18 * EASE.back(Math.min(1, p));
  const rr = r * grow;
  const circ = 2 * Math.PI * rr;
  const echo = Math.max(0, (p - 0.55) / 0.45);
  return (
    <g opacity={alpha} transform={`rotate(-110 ${c.x} ${c.y})`}>
      <circle cx={c.x} cy={c.y} r={rr} fill="none" stroke={C.gold} strokeWidth={9} opacity={0.35}
        strokeDasharray={`${circ * p} ${circ}`} filter="url(#s4-glow)" />
      <circle cx={c.x} cy={c.y} r={rr} fill="none" stroke={C.gold} strokeWidth={3}
        strokeDasharray={`${circ * p} ${circ}`} strokeLinecap="round" />
      {echo > 0 && (
        <circle cx={c.x} cy={c.y} r={rr * (1 + 0.35 * EASE.out(echo))} fill="none" stroke={C.gold}
          strokeWidth={2} opacity={0.5 * (1 - echo)} />
      )}
    </g>
  );
};

// Four-point twinkles at fingertips / toes, popping in one after another.
export const Sparkles: React.FC<{ pts: Pt[]; p: number; alpha: number; size: number }> = ({ pts, p, alpha, size }) => {
  if (alpha <= 0.001) return null;
  return (
    <g opacity={alpha}>
      {pts.map((q, i) => {
        const t = Math.max(0, Math.min(1, p * 1.25 - i * 0.07));
        const k = Math.sin(Math.PI * t);
        if (k <= 0.01) return null;
        const s = size * k * (i % 2 ? 0.75 : 1);
        return (
          <g key={i} transform={`rotate(${t * 50} ${q.x} ${q.y})`}>
            <circle cx={q.x} cy={q.y} r={s * 0.9} fill={C.gold} opacity={0.4} filter="url(#s4-glow)" />
            <ellipse cx={q.x} cy={q.y} rx={s} ry={s * 0.16} fill={C.text} />
            <ellipse cx={q.x} cy={q.y} rx={s * 0.16} ry={s} fill={C.text} />
            <circle cx={q.x} cy={q.y} r={s * 0.22} fill={C.text} />
          </g>
        );
      })}
    </g>
  );
};

// Point + unit tangent at fraction t (0..1) along an open polyline.
const along = (pts: Pt[], t: number) => {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y));
  let left = Math.max(0, Math.min(1, t)) * seg.reduce((a, v) => a + v, 0);
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, left / seg[i]) : 0;
      const a = pts[i];
      const b = pts[i + 1];
      return { p: { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }, t: { x: (b.x - a.x) / (seg[i] || 1), y: (b.y - a.y) / (seg[i] || 1) } };
    }
    left -= seg[i];
  }
  return { p: pts[0], t: { x: 0, y: 1 } };
};

// A warm band of light that slides down the face (forehead -> eye -> nose ->
// lips -> chin), clipped to the head so it reads as light ON the skin, and
// leaves a fine gold rim along the profile. Soft gold pool + feature twinkles.
export const FaceSweep: React.FC<{ profile: Pt[]; head: string; eye: Pt; p: number; glow: number }> = ({
  profile, head, eye, p, glow,
}) => {
  if (glow <= 0.001) return null;
  const d = smooth(profile, false);
  const total = 400;
  const trail = `${Math.max(0, total * 1.1 * p)} ${total * 2}`;
  const pool = profile[4];
  // feature twinkles, lit as the band passes: forehead, eye, nose, lips
  const feats = [profile[1], eye, profile[4], profile[7]];
  const band = along(profile, -0.08 + 1.16 * p);
  const nIn = { x: -band.t.y, y: band.t.x }; // into the face (face looks +x)
  const deg = (Math.atan2(nIn.y, nIn.x) * 180) / Math.PI;
  const bandA = Math.sin(Math.PI * Math.max(0, Math.min(1, p))) * glow;
  return (
    <g>
      <defs>
        <radialGradient id="s4-facePool">
          <stop offset={0} stopColor={C.gold} stopOpacity={0.3} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="s4-band">
          <stop offset={0} stopColor={C.text} stopOpacity={0.8} />
          <stop offset={0.35} stopColor={C.gold} stopOpacity={0.6} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <clipPath id="s4-headClip">
          <path d={head} />
        </clipPath>
      </defs>
      <circle cx={pool.x - 30} cy={pool.y - 10} r={160} fill="url(#s4-facePool)" opacity={glow} />
      {bandA > 0.01 && (
        <g clipPath="url(#s4-headClip)">
          <ellipse cx={40} cy={0} rx={120} ry={46} fill="url(#s4-band)" opacity={0.65 * bandA}
            transform={`translate(${band.p.x} ${band.p.y}) rotate(${deg})`} />
        </g>
      )}
      <path d={d} pathLength={total} fill="none" stroke={C.gold} strokeWidth={12} strokeLinecap="round"
        strokeDasharray={trail} opacity={0.55 * glow} filter="url(#s4-glow)" />
      <path d={d} pathLength={total} fill="none" stroke={C.gold} strokeWidth={3.6} strokeLinecap="round"
        strokeDasharray={trail} opacity={0.95 * glow} />
      <Sparkles pts={feats} p={Math.min(1, p * 1.1)} alpha={glow} size={11} />
    </g>
  );
};
