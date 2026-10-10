import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../theme/colors";
import { Pt, add, mul, norm, perp, smoothPath, sub } from "./geometry";
import { Ring, ringAlpha, ringRadius } from "./motion";

export const YOLK = { x: 806, y: 902, r: 42 } as const;

export const yolkPos = (frame: number): Pt => ({
  x: YOLK.x + noise2D("s3yx", frame * 0.01, 0) * 6,
  y: YOLK.y + noise2D("s3yy", 0, frame * 0.01) * 8,
});

// Vitelline vessels branching over the yolk sac's surface.
const VESSELS = [
  "M-40,4 C-28,-2 -18,-14 -4,-12 S20,-22 34,-16",
  "M-40,4 C-26,10 -10,20 6,14 S26,10 36,18",
  "M-4,-12 C0,-22 -6,-30 -2,-38",
  "M6,14 C10,24 6,32 12,38",
];

const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
};

// The yolk stalk: a soft tapering tube (thick at the belly, thin at the sac),
// returned as a filled outline plus its centre line.
const stalk = (p0: Pt, p1: Pt, p2: Pt, p3: Pt) => {
  const M = 28;
  const c: Pt[] = [];
  for (let i = 0; i <= M; i++) c.push(bez(p0, p1, p2, p3, i / M));
  const L: Pt[] = [];
  const R: Pt[] = [];
  c.forEach((p, i) => {
    const t = norm(sub(c[Math.min(M, i + 1)], c[Math.max(0, i - 1)]));
    const w = 7.5 - 4 * (i / M) + 1.2 * Math.sin((i / M) * Math.PI);
    L.push(add(p, mul(perp(t), w)));
    R.push(add(p, mul(perp(t), -w)));
  });
  return { body: smoothPath([...L, ...R.reverse()], true), line: smoothPath(c, false) };
};

// The yolk sac: a small glowing membranous sphere tethered to the belly.
type Props = { frame: number; belly: Pt; reveal: number; glow: number; heart: Pt; rs: Ring[] };

export const YolkSac: React.FC<Props> = ({ frame, belly, reveal, glow, heart, rs }) => {
  // each passing pulse ring gives the sac a small outward nudge
  const p0 = yolkPos(frame);
  const away = sub(p0, heart);
  const dist = Math.hypot(away.x, away.y) || 1;
  let push = 0;
  for (const r of rs) push += 5 * r.strength * ringAlpha(r) * Math.exp(-((dist - ringRadius(r)) ** 2) / (2 * 30 * 30));
  const p = add(p0, mul(away, push / dist));
  const { r } = YOLK;
  const end = { x: p.x - r * 0.9, y: p.y + 6 };
  const sway = noise2D("s3stalk", frame * 0.015, 4) * 12;
  // a soft cord that sags under its own weight instead of a straight stick
  const s = stalk(belly, { x: belly.x + 36, y: belly.y + 58 }, { x: end.x - 92, y: end.y + 34 + sway }, end);
  return (
    <g>
      <defs>
        <radialGradient id="s3-yolk" cx="0.4" cy="0.36" r="0.68">
          <stop offset="0" stopColor={C.skin} />
          <stop offset="0.38" stopColor={C.gold} stopOpacity={0.92} />
          <stop offset="0.8" stopColor={C.peach} />
          <stop offset="1" stopColor={C.skinShade} />
        </radialGradient>
        <radialGradient id="s3-yolk-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.4" stopColor={C.gold} stopOpacity={0.16} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="s3-yolk-shade" cx="0.72" cy="0.8" r="0.62">
          <stop offset="0" stopColor={C.womb} stopOpacity={0.42} />
          <stop offset="1" stopColor={C.womb} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="s3-yolk-spec" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.text} stopOpacity={0.8} />
          <stop offset="1" stopColor={C.text} stopOpacity={0} />
        </radialGradient>
        <clipPath id="s3-yolk-clip">
          <circle cx={0} cy={0} r={r} />
        </clipPath>
      </defs>
      <g opacity={Math.max(0, (reveal - 0.35) / 0.65)}>
        <path d={s.body} fill={C.skinShade} opacity={0.9} transform="translate(0.8 1.6)" />
        <path d={s.body} fill={C.peach} />
        <path d={s.line} fill="none" stroke={C.heart} strokeOpacity={0.3 + 0.3 * glow} strokeWidth={1.6} transform="translate(0 1.2)" />
        <path d={s.line} fill="none" stroke={C.skin} strokeOpacity={0.85} strokeWidth={1.8} transform="translate(-0.6 -3)" />
      </g>
      <g transform={`translate(${p.x} ${p.y})`}>
        <circle r={r * 2.1} fill="url(#s3-yolk-glow)" opacity={0.7 + 0.3 * glow} />
        <circle r={r} fill="url(#s3-yolk)" />
        <g clipPath="url(#s3-yolk-clip)">
          {VESSELS.map((v, i) => (
            <path key={i} d={v} fill="none" stroke={C.heart} strokeOpacity={0.22 + 0.12 * glow} strokeWidth={i < 2 ? 1.6 : 1.1} strokeLinecap="round" />
          ))}
          <circle r={r} fill="url(#s3-yolk-shade)" />
        </g>
        <circle r={r - 1} fill="none" stroke={C.skin} strokeOpacity={0.55} strokeWidth={2} />
        <ellipse cx={-r * 0.36} cy={-r * 0.42} rx={r * 0.3} ry={r * 0.18} transform={`rotate(-35 ${-r * 0.36} ${-r * 0.42})`} fill="url(#s3-yolk-spec)" opacity={0.8} />
      </g>
    </g>
  );
};
