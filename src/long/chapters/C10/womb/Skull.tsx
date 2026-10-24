// The skull in the X-ray: membrane bones growing as islands inside a soft membrane (the
// vault forms from membrane, not cartilage). Real features, side view:
//   - three vault plates from their own ossification centres (frontal, parietal,
//     occipital) on a diagonal arc round the dome
//     (the small temporal plate is left out: a blob mid-head made the plates a face)
//   - a vault plate is a curved shell: seen side-on on an X-ray it is densest where it
//     turns edge-on, so each plate is a bright arc along the dome over a faint plate,
//     with faint radiating trabeculae inside (rays from a hub read as stars, spikes past
//     the edge as sea urchins, full-size plates as a helmet: all tried at 270 px)
//   - soft gaps stay between them: sutures, the anterior fontanelle at the top, the
//     posterior one at the back, where only the faint cool membrane shows
//   - no jaw bone: a bright curve under the face read as a smile at phone size (rule 11)
// Plates differ in size and height, so no pair reads as eyes (rule 11).
// Plate shape: rays from the centre stop at the growth radius, the inset head outline,
// the suture bisector to each neighbour and the plate's own extra limits.
import React from "react";
import { random } from "remotion";
import { C } from "../../../../theme/colors";
import { buildFetus } from "../../../../shared/fetus";
import { P, Pt, add, lerp, mul, smoothPath, sub } from "../geom";

type Geo = ReturnType<typeof buildFetus>;
type Half = { o: Pt; n: Pt }; // keep n.(p - o) <= 0
type Plate = { c: Pt; r: number; lim: Half[]; w: number };

// head-local units (head ~250 tall, face toward +x, crown up)
const PLATES: Plate[] = [
  // frontal: the forehead, low and forward (its eminence sits above the brow)
  { c: P(84, -40), r: 80, w: 1, lim: [{ o: P(70, -12), n: P(0.25, 1) }] },
  // parietal: the big dome plate, high and back (largest)
  { c: P(-30, -76), r: 96, w: 1, lim: [] },
  // occipital squama: the back of the head, low, above the neck
  { c: P(-100, 18), r: 66, w: 0.95, lim: [{ o: P(-60, 70), n: P(0.2, 1) }] },
];
const GAP = 9; // suture half-width (the gaps must read at 270 px)
const INSET = 3; // membrane margin inside the head outline (the shell lies just under the skin)
const RAYS = 56;

// distance along ray (c, u) to the polygon boundary (c inside)
const rayToPoly = (c: Pt, u: Pt, poly: Pt[]) => {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const e = sub(b, a);
    const den = u.x * e.y - u.y * e.x;
    if (Math.abs(den) < 1e-9) continue;
    const w = sub(a, c);
    const t = (w.x * e.y - w.y * e.x) / den;
    const s = (w.x * u.y - w.y * u.x) / den;
    if (t > 0 && s >= 0 && s <= 1) best = Math.min(best, t);
  }
  return best;
};
// distance along ray to the half-plane edge n.(p - o) = 0 (Infinity if never crossed)
const rayToHalf = (c: Pt, u: Pt, h: Half) => {
  const dn = u.x * h.n.x + u.y * h.n.y;
  const s0 = (c.x - h.o.x) * h.n.x + (c.y - h.o.y) * h.n.y;
  if (dn <= 1e-9) return Infinity;
  return Math.max(0, -s0 / dn);
};

const platePts = (i: number, grow: number, head: Pt[]): Pt[] => {
  const p = PLATES[i];
  const ds: number[] = [];
  for (let k = 0; k < RAYS; k++) {
    const a = (k / RAYS) * Math.PI * 2;
    const u = P(Math.cos(a), Math.sin(a));
    // a slightly irregular growing front (spicules reach out unevenly)
    const wob = 1 + 0.07 * Math.sin(3 * a + i * 1.7) + 0.04 * Math.sin(7 * a + i);
    let d = p.r * grow * wob;
    d = Math.min(d, rayToPoly(p.c, u, head) - INSET);
    PLATES.forEach((q, j) => {
      if (j === i) return;
      const n = sub(q.c, p.c);
      const l = Math.hypot(n.x, n.y);
      const nn = mul(n, 1 / l);
      d = Math.min(d, rayToHalf(p.c, u, { o: add(p.c, mul(nn, l / 2 - GAP)), n: nn }));
    });
    p.lim.forEach((h) => (d = Math.min(d, rayToHalf(p.c, u, { o: h.o, n: mul(h.n, 1 / Math.hypot(h.n.x, h.n.y)) }))));
    ds.push(Math.max(2, d));
  }
  // round the corners: a few passes of a small circular blur that never grows the plate
  let r = ds;
  for (let pass = 0; pass < 3; pass++) {
    r = r.map((d, k) => Math.min(d, 0.25 * r[(k + RAYS - 1) % RAYS] + 0.5 * d + 0.25 * r[(k + 1) % RAYS]));
  }
  return r.map((d, k) => {
    const a = (k / RAYS) * Math.PI * 2;
    return add(p.c, mul(P(Math.cos(a), Math.sin(a)), d));
  });
};

// dense, smooth head outline (Catmull-Rom through the kit's 20 points)
const densify = (pts: Pt[], n = 6): Pt[] => {
  const out: Pt[] = [];
  const m = pts.length;
  for (let i = 0; i < m; i++) {
    const p0 = pts[(i + m - 1) % m], p1 = pts[i], p2 = pts[(i + 1) % m], p3 = pts[(i + 2) % m];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push(P(f(p0.x, p1.x, p2.x, p3.x), f(p0.y, p1.y, p2.y, p3.y)));
    }
  }
  return out;
};

// trabeculae: faint uneven rays inside each plate (seeded angles, lengths, weights),
// starting half-way out so no bright hub forms
const N_SPIC = 26;
const SPIC = PLATES.map((_, i) => Array.from({ length: N_SPIC }, (_, k) => ({
  a: ((k + 0.6 * random(`c10-sp-a${i}-${k}`)) / N_SPIC) * Math.PI * 2,
  l: 0.8 + 0.15 * random(`c10-sp-l${i}-${k}`),
  o: 0.3 + 0.7 * random(`c10-sp-o${i}-${k}`),
})));

// head outline in head-local units (inverse of the kit's headPt)
const toLocal = (geo: Geo, q: Pt): Pt => {
  const d = sub(q, geo.headO);
  const a = (-geo.headRot * Math.PI) / 180;
  return mul(P(d.x * Math.cos(a) - d.y * Math.sin(a), d.x * Math.sin(a) + d.y * Math.cos(a)), 1 / geo.headS);
};

export const Skull: React.FC<{ geo: Geo; oss: number }> = ({ geo, oss }) => {
  const H = (q: Pt) => geo.headPt(q);
  const head = densify(geo.headPts.map((q) => toLocal(geo, q)));
  // islands: even fully grown they leave wide soft gaps (sutures, fontanelles) at 13-14 wk
  // radii above are the grown size; the arcs lengthen along the dome as the plates grow
  const grow = lerp(0.55, 1, oss);
  const sw = geo.headS;
  return (
    <g>
      <defs>
        <clipPath id="c10-skull-head">
          <path d={geo.head} />
        </clipPath>
      </defs>
      <g clipPath="url(#c10-skull-head)">
        {/* the soft membrane the plates grow in: a faint cool film, no hard ring */}
        <path d={geo.head} fill={C.cellCyan} opacity={0.07} />
        <path d={geo.head} fill="none" stroke={C.cellCyan} strokeWidth={sw * 16} opacity={0.08} />
        {PLATES.map((p, i) => {
          const gr = grow * p.w + (1 - p.w) * 0.85;
          const pts = platePts(i, gr, head).map(H);
          const c = H(p.c);
          const d = smoothPath(pts, true);
          const id = `c10-skull-plate${i}`;
          const reach = p.r * gr * geo.headS;
          return (
            <g key={i}>
              <defs>
                <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={c.x} cy={c.y} r={reach}>
                  <stop offset={0} stopColor={C.text} stopOpacity={0.5} />
                  <stop offset={0.6} stopColor={C.cell} stopOpacity={0.36} />
                  <stop offset={1} stopColor={C.cellCyan} stopOpacity={0.2} />
                </radialGradient>
                <clipPath id={`${id}-clip`}>
                  <path d={d} />
                </clipPath>
              </defs>
              <path d={d} fill={`url(#${id})`} />
              <g clipPath={`url(#${id}-clip)`}>
                {/* the shell edge-on along the dome: a soft wide band, then the dense rim */}
                <path d={geo.head} fill="none" stroke={C.cell} strokeWidth={sw * 52} opacity={0.3} />
                <path d={geo.head} fill="none" stroke={C.text} strokeWidth={sw * 24} opacity={0.88} />
                {SPIC[i].map((q, k) => {
                  const kk = Math.round((q.a / (Math.PI * 2)) * RAYS) % RAYS;
                  const e = sub(pts[kk], c);
                  const n = mul(P(-e.y, e.x), (sw * (0.6 + 0.8 * q.o)) / Math.max(1e-6, Math.hypot(e.x, e.y)));
                  const b0 = add(c, mul(e, 0.42 + 0.12 * q.o));
                  const tip = add(c, mul(e, q.l));
                  const f = (v: Pt) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`;
                  return <path key={k} d={`M${f(add(b0, n))} L${f(tip)} L${f(sub(b0, n))}Z`} fill={C.text} opacity={0.08 + 0.16 * q.o} />;
                })}
              </g>
            </g>
          );
        })}
      </g>
    </g>
  );
};
