// Skull plates as growing islands of bone-white inside a soft, cartilage-blue
// membrane (the vault forms from membrane, not cartilage). Each plate grows
// from its own centre and stops short of its neighbours, so soft gaps
// (sutures and fontanelles) remain. Head-local layout (cranium centre 0,0,
// face toward +x), mapped to rig coords by the kit's headPt.
import React from "react";
import { C } from "../../../../theme/colors";
import { buildFetus } from "../../../../shared/fetus";
import { P, Pt, clipHalf, lerp, mul, norm, smoothPath, sub } from "../geom";

type Geo = ReturnType<typeof buildFetus>;

// plate centres + max reach (head-local units, head ~234 tall)
const PLATES: { c: Pt; r: number; k: number }[] = [
  { c: P(66, -58), r: 74, k: 1 }, // frontal
  { c: P(-30, -68), r: 86, k: 1 }, // parietal
  { c: P(-96, 6), r: 60, k: 0.95 }, // occipital
  { c: P(-14, 16), r: 40, k: 0.9 }, // temporal squama (above the ear)
];
// gaps that stay soft: anterior + posterior fontanelles, the ear, the eye and face
const HOLES: Pt[] = [P(18, -118), P(-82, -92), P(-6, 52), P(44, 12), P(104, 40), P(96, 84)];
const GAP = 7; // suture half-width

// Chaikin corner-cutting: rounds the clipped polygon into a soft island
const chaikin = (pts: Pt[], n = 3): Pt[] => {
  let p = pts;
  for (let k = 0; k < n; k++) {
    const q: Pt[] = [];
    p.forEach((a, i) => {
      const b = p[(i + 1) % p.length];
      q.push(P(a.x * 0.75 + b.x * 0.25, a.y * 0.75 + b.y * 0.25), P(a.x * 0.25 + b.x * 0.75, a.y * 0.25 + b.y * 0.75));
    });
    p = q;
  }
  return p;
};

const plateGeom = (i: number, grow: number): Pt[] => {
  const { c, r } = PLATES[i];
  const rad = r * grow;
  let poly: Pt[] = Array.from({ length: 20 }, (_, k) => {
    const a = (k / 20) * Math.PI * 2;
    return P(c.x + Math.cos(a) * rad, c.y + Math.sin(a) * rad);
  });
  const others = [...PLATES.filter((_, j) => j !== i).map((p) => p.c), ...HOLES];
  for (const o of others) {
    const n = norm(sub(o, c));
    const mid = P((c.x + o.x) / 2 - n.x * GAP, (c.y + o.y) / 2 - n.y * GAP);
    poly = clipHalf(poly, mid, n);
    if (poly.length < 3) return [];
  }
  return chaikin(poly);
};

export const Skull: React.FC<{ geo: Geo; oss: number }> = ({ geo, oss }) => {
  const H = (q: Pt) => geo.headPt(q);
  const grow = lerp(0.5, 1, oss);
  return (
    <g>
      <defs>
        <clipPath id="c10-head">
          <path d={geo.head} />
        </clipPath>
        <radialGradient id="c10-plate" cx="0.5" cy="0.5" r="0.62">
          <stop offset={0} stopColor={C.text} stopOpacity={0.95} />
          <stop offset={0.7} stopColor={C.cell} stopOpacity={0.7} />
          <stop offset={1} stopColor={C.cellCyan} stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <g clipPath="url(#c10-head)">
        {/* the soft membrane the plates grow in */}
        <path d={geo.head} fill={C.cellCyan} opacity={0.12} />
        <path d={geo.head} fill="none" stroke={C.cellCyan} strokeWidth={geo.headS * 22} opacity={0.13} />
        {PLATES.map((p, i) => {
          const poly = plateGeom(i, grow * p.k + (1 - p.k) * 0.9);
          if (poly.length < 3) return null;
          const pts = poly.map(H);
          const c = H(p.c);
          return (
            <g key={i}>
              <path d={smoothPath(pts, true)} fill="url(#c10-plate)" opacity={0.62} />
              <path d={smoothPath(pts, true)} fill="none" stroke={C.cell} strokeWidth={geo.headS * 2.2} opacity={0.5} />
              {/* radiating spicules: membrane bone grows outward from its centre */}
              {pts.filter((_, k) => k % 8 === 0).map((q, k) => {
                const e = mul(sub(q, c), 0.78);
                return <line key={k} x1={c.x} y1={c.y} x2={c.x + e.x} y2={c.y + e.y} stroke={C.text} strokeWidth={geo.headS * 1.3} opacity={0.3} />;
              })}
            </g>
          );
        })}
      </g>
    </g>
  );
};
