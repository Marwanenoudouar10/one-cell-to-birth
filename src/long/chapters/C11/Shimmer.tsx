// Week-18/19 skin details, in fetus-local px:
// - Lanugo: a bright glint runs crown -> bottom along the backlit outline and
//   lights the fine hair fuzz as it passes; the fuzz it reveals stays faintly
//   lit behind it for a moment (the kit draws the fuzz; this reveals it).
// - Vernix: a thin waxy sheen band slides across the body (clipped to it); no
//   all-over tint (screening peach onto peach skin washes it out pale).
// - Ear: the low sound wraps into the ear (two short arcs converge on it from
//   the mother's side) and the ear blooms warm. No full rings or dots: a ring
//   round a dot on the head would read as a second eye.
// - TipGlow: C10's glowing fingertips linger while the focus pulls back.
import React from "react";
import { C } from "../../../theme/colors";
import { Guides, lengths, segment, toD } from "./guides";

const HAIR_GAP = 7;

export const Lanugo: React.FC<{ g: Guides; p: number; a: number; rest: number }> = ({ g, p, a, rest }) => {
  if (a < 0.01) return null;
  const pts = g.skinPts;
  const L = lengths(pts);
  const total = L[L.length - 1];
  const glint = (-0.1 + 1.2 * p) * total;
  const hairs: { d: string; o: number }[] = [];
  let i = 1;
  for (let s = 4; s < total - 4; s += HAIR_GAP) {
    while (i < pts.length - 1 && L[i] < s) i++;
    const A = pts[i - 1];
    const B = pts[i];
    const k = (s - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    const q = { x: A.x + (B.x - A.x) * k, y: A.y + (B.y - A.y) * k };
    const l = Math.hypot(B.x - A.x, B.y - A.y) || 1;
    const t = { x: (B.x - A.x) / l, y: (B.y - A.y) / l };
    let n = { x: -t.y, y: t.x };
    if (n.x * q.x + n.y * q.y < 0) n = { x: -n.x, y: -n.y }; // point away from the body
    const h = 11 + 7 * Math.abs(Math.sin(s * 1.7)); // uneven fine hairs
    const d = { x: n.x + 0.55 * t.x, y: n.y + 0.55 * t.y }; // lying back along the flow
    const lit = Math.exp(-(((s - glint) / 70) ** 2));
    // behind the glint the revealed fuzz keeps a soft glow for a moment
    const behind = rest * Math.max(0, Math.min(1, (glint - s) / 60));
    const o = Math.max(lit, 0.38 * behind);
    if (o < 0.03) continue;
    hairs.push({ d: `M${(q.x - n.x * 2).toFixed(1)},${(q.y - n.y * 2).toFixed(1)}l${(d.x * h).toFixed(1)},${(d.y * h).toFixed(1)}`, o });
  }
  // the glint: three tapered passes of light along the outline
  const pass = (half: number) => toD(segment(pts, glint - half, glint + half));
  const on = glint > -120 && glint < total + 120;
  return (
    <g opacity={a} fill="none" strokeLinecap="round" style={{ mixBlendMode: "screen" }}>
      <defs>
        <filter id="c11-lanugo-glow" filterUnits="userSpaceOnUse" x="-700" y="-700" width="1400" height="1400">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="c11-lanugo-soft" filterUnits="userSpaceOnUse" x="-700" y="-700" width="1400" height="1400">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      {on && (
        <>
          <g filter="url(#c11-lanugo-glow)">
            <path d={pass(170)} stroke={C.peach} strokeWidth={48} strokeOpacity={0.42} />
            <path d={pass(100)} stroke={C.gold} strokeWidth={22} strokeOpacity={0.5} />
          </g>
          <path d={pass(55)} stroke={C.text} strokeWidth={9} strokeOpacity={0.85} filter="url(#c11-lanugo-soft)" />
        </>
      )}
      <g stroke={C.text} strokeWidth={2.4}>
        {hairs.map((h, j) => (
          <path key={j} d={h.d} strokeOpacity={0.9 * h.o} />
        ))}
      </g>
    </g>
  );
};

export const Vernix: React.FC<{ g: Guides; p: number; a: number }> = ({ g, p, a }) => {
  if (a < 0.01) return null;
  const b = g.a.bounds;
  const w = b.x1 - b.x0;
  const h = b.y1 - b.y0;
  const x = b.x0 - 0.45 * w + 1.9 * w * p;
  const cy = (b.y0 + b.y1) / 2;
  return (
    <g opacity={a} style={{ mixBlendMode: "screen" }}>
      <defs>
        <clipPath id="c11-vernix-body">
          {g.silhouette.map((d, i) => (
            <path key={i} d={d} transform={g.css} />
          ))}
        </clipPath>
        <linearGradient id="c11-vernix-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.text} stopOpacity={0} />
          <stop offset="0.4" stopColor={C.text} stopOpacity={0.16} />
          <stop offset="0.5" stopColor={C.text} stopOpacity={0.36} />
          <stop offset="0.6" stopColor={C.text} stopOpacity={0.16} />
          <stop offset="1" stopColor={C.text} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g clipPath="url(#c11-vernix-body)">
        <rect x={x - 130} y={cy - h} width={260} height={2 * h} fill="url(#c11-vernix-band)" transform={`rotate(24 ${x} ${cy})`} />
      </g>
    </g>
  );
};

// The ear catches the low sound: two short arcs (open toward the ear, on the
// mother's side) close in on it, then a small warm, slightly tall bloom (kept
// tight: a big screen glow over the skin washes the whole head out pale).
export const EarGlow: React.FC<{ g: Guides; a: number; age: number; from: number }> = ({ g, a, age, from }) => {
  const arcs = [-12, -6]
    .map((d) => ({ u: (age - d) / 12 }))
    .filter((r) => r.u > 0 && r.u < 1);
  if (a < 0.01 && arcs.length === 0) return null;
  const e = g.a.ear;
  const arc = (r: number) => {
    const a0 = ((from - 48) * Math.PI) / 180;
    const a1 = ((from + 48) * Math.PI) / 180;
    return `M${(e.x + Math.cos(a0) * r).toFixed(1)},${(e.y + Math.sin(a0) * r).toFixed(1)}A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${(e.x + Math.cos(a1) * r).toFixed(1)},${(e.y + Math.sin(a1) * r).toFixed(1)}`;
  };
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id="c11-ear-bloom">
          <stop offset="0" stopColor={C.text} stopOpacity={0.85} />
          <stop offset="0.2" stopColor={C.gold} stopOpacity={0.6} />
          <stop offset="0.55" stopColor={C.gold} stopOpacity={0.16} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
        <filter id="c11-ear-glow" filterUnits="userSpaceOnUse" x="-700" y="-700" width="1400" height="1400">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      {a > 0.01 && <ellipse cx={e.x - 3} cy={e.y} rx={50} ry={64} fill="url(#c11-ear-bloom)" opacity={a} />}
      {arcs.map((r, i) => {
        const rad = 120 - 92 * r.u;
        const o = Math.sin(Math.PI * Math.min(1, r.u * 1.15));
        return (
          <g key={i} fill="none" strokeLinecap="round" opacity={0.9 * o}>
            <path d={arc(rad)} stroke={C.peach} strokeWidth={20} strokeOpacity={0.5} filter="url(#c11-ear-glow)" />
            <path d={arc(rad)} stroke={C.text} strokeWidth={6} strokeOpacity={0.85} />
          </g>
        );
      })}
    </g>
  );
};

// C10 ends on two glowing fingertips: the glow lingers on the near hand's
// fingertips while the focus pulls back, then fades.
export const TipGlow: React.FC<{ g: Guides; a: number }> = ({ g, a }) => {
  if (a < 0.01) return null;
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={a}>
      <defs>
        <radialGradient id="c11-tip-glow">
          <stop offset="0" stopColor={C.gold} stopOpacity={0.7} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {g.a.fingertips.slice(0, 4).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={9} fill="url(#c11-tip-glow)" />
      ))}
    </g>
  );
};
