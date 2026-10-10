// Week-18/19 skin details, in fetus-local px:
// - Lanugo: a glint runs crown -> bottom along the backlit outline and lights
//   the fine hair fuzz as it passes (the kit draws the fuzz; this reveals it).
// - Vernix: a thin waxy sheen band slides across the body (clipped to it).
// - Ear: a soft glow + one ring when the low sound ring reaches the ear.
import React from "react";
import { C } from "../../../theme/colors";
import { Guides, cut, lengths, toD } from "./guides";

const HAIR_GAP = 6.5;

export const Lanugo: React.FC<{ g: Guides; p: number; a: number }> = ({ g, p, a }) => {
  if (a < 0.01) return null;
  const pts = g.skinPts;
  const L = lengths(pts);
  const total = L[L.length - 1];
  const glint = (-0.12 + 1.24 * p) * total;
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
    const h = 8 + 5 * Math.abs(Math.sin(s * 1.7)); // uneven fine hairs
    const d = { x: n.x + 0.5 * t.x, y: n.y + 0.5 * t.y }; // lying back along the flow
    const o = Math.exp(-(((s - glint) / 80) ** 2));
    if (o < 0.04) continue;
    hairs.push({ d: `M${(q.x - n.x * 2).toFixed(1)},${(q.y - n.y * 2).toFixed(1)}l${(d.x * h).toFixed(1)},${(d.y * h).toFixed(1)}`, o });
  }
  const g0 = Math.max(0, glint - 90) / total;
  const g1 = Math.min(total, glint + 90) / total;
  const seg = g1 > g0 ? cut(pts, g1).pts.filter((_, j) => L[Math.min(j, L.length - 1)] >= g0 * total) : [];
  return (
    <g opacity={a} fill="none" strokeLinecap="round">
      <defs>
        <filter id="c11-lglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {seg.length > 1 && (
        <g filter="url(#c11-lglow)">
          <path d={toD(seg)} stroke={C.peach} strokeWidth={24} strokeOpacity={0.55} />
          <path d={toD(seg)} stroke={C.text} strokeWidth={7} strokeOpacity={0.7} />
        </g>
      )}
      <g stroke={C.text} strokeWidth={1.6}>
        {hairs.map((h, j) => (
          <path key={j} d={h.d} strokeOpacity={0.75 * h.o} />
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
  const x = b.x0 - 0.5 * w + 2 * w * p;
  const cy = (b.y0 + b.y1) / 2;
  return (
    <g opacity={a}>
      <defs>
        <clipPath id="c11-body">
          {g.silhouette.map((d, i) => (
            <path key={i} d={d} transform={g.css} />
          ))}
        </clipPath>
        <linearGradient id="c11-sheenG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.text} stopOpacity={0} />
          <stop offset="0.5" stopColor={C.text} stopOpacity={0.4} />
          <stop offset="1" stopColor={C.text} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g clipPath="url(#c11-body)">
        <rect x={b.x0 - 50} y={b.y0 - 50} width={w + 100} height={h + 100} fill={C.text} opacity={0.07} />
        <rect x={x - 90} y={cy - h} width={180} height={2 * h} fill="url(#c11-sheenG)" transform={`rotate(24 ${x} ${cy})`} />
      </g>
    </g>
  );
};

// The ear catches the low sound: a warm glow and two soft rings.
export const EarGlow: React.FC<{ g: Guides; a: number; age: number }> = ({ g, a, age }) => {
  if (a < 0.01) return null;
  const e = g.a.ear;
  const rings = [0, 7].map((d) => ({ age: age - d })).filter((r) => r.age > 0 && r.age < 40);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id="c11-earG">
          <stop offset="0" stopColor={C.text} stopOpacity={0.75} />
          <stop offset="0.22" stopColor={C.gold} stopOpacity={0.5} />
          <stop offset="0.6" stopColor={C.peach} stopOpacity={0.22} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={e.x} cy={e.y} r={78} fill="url(#c11-earG)" opacity={a} />
      {rings.map((r, i) => (
        <circle key={i} cx={e.x} cy={e.y} r={18 + r.age * 2.6} fill="none" stroke={C.peach} strokeWidth={3 - 1.4 * (r.age / 40)}
          opacity={0.9 * Math.exp(-r.age / 13) * Math.min(1, r.age / 2) * a} />
      ))}
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
        <radialGradient id="c11-tipG">
          <stop offset="0" stopColor={C.gold} stopOpacity={0.7} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {g.a.fingertips.slice(0, 4).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={9} fill="url(#c11-tipG)" />
      ))}
    </g>
  );
};
