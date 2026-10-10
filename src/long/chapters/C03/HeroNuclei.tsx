import React from "react";
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { lerp } from "./geometry";
import { mix } from "./palette";
import { Built } from "./prims";
import { Pronuclei, pronPose } from "./Pronuclei";
import { PN } from "./timeline";
import { nucOff } from "./cells";

// The first division's nuclear story, drawn as the real thing: C02's two
// pronuclei (gold, peach) press closer and their envelopes dissolve; their
// chromosomes (small X shapes, both tints) gather on ONE plate across the
// middle, held by a faint spindle of fibres from two poles; each X splits
// and its halves are pulled to opposite poles (centromere first, arms
// trailing), so every daughter gets a full mixed set (never "one parent per
// cell"). The sets condense where the daughters' new nuclei appear.
// Cluster-local px, outside the cell's stretch (`el` maps points into it).
const ID = "c03n";
const TINTS = [C.gold, C.peach] as const;
const EDGE = TINTS.map((t) => mix(t, C.skinShade, 0.38));

// 8 chromosomes, hand-spaced on the plate (uneven gaps), random tilt/size.
const PLATE = [-34, -24, -15, -5, 4, 14, 23, 33];
const TINT_OF = [0, 1, 1, 0, 1, 0, 0, 1];
const CHROMS = PLATE.map((py, i) => {
  const r = (k: string) => random(`c03ch-${i}-${k}`);
  return {
    k: TINT_OF[i],
    py: py + (r("y") - 0.5) * 3,
    px: (r("x") - 0.5) * 6,
    tilt: 90 + (r("t") - 0.5) * 70, // long axis roughly along the plate (vertical)
    h: 7 + r("h") * 3.4, // arm length
    lag: 0.75 + r("l") * 0.5, // anaphase speed (not all in step)
    src: [(r("sx") - 0.5) * 0.9, (r("sy") - 0.5) * 0.9], // start inside its pronucleus
  };
});

type P = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const pl = (pts: P[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("");

// One chromatid: arm end, centromere, arm end (round caps), dark same-hue edge.
const Chromatid: React.FC<{ pts: P[]; k: number; o: number; w: number }> = ({ pts, k, o, w }) => (
  <g opacity={o} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={pl(pts)} stroke={EDGE[k]} strokeOpacity={0.75} strokeWidth={w + 1.8} />
    <path d={pl(pts)} stroke={TINTS[k]} strokeWidth={w} />
  </g>
);

// The spindle and the sets live in the AXIS frame (x along the tilted
// division axis, see timeline TILT) and are drawn rotated by `tilt`; the
// pronuclei stay in cluster space, exactly as C02 hands them over.
export const HeroNuclei: React.FC<{ f: number; hero: Built["hero"]; el: number; tilt: number }> = ({ f, hero, el, tilt }) => {
  const meet = tween(f, PN.meet0, PN.meet1, [0, 1], EASE.inOut);
  const plate = tween(f, PN.plate0, PN.plate1, [0, 1], EASE.out);
  const apart = tween(f, PN.apart0, PN.apart1, [0, 1], EASE.inOut);
  const gone = tween(f, PN.apart1, PN.gone, [0, 1], EASE.inOut);
  const env = 1 - tween(f, PN.meet0 + 2, PN.meet1, [0, 1], EASE.inOut);
  const pronOp = 1 - tween(f, PN.plate0 + 1, PN.plate1 + 1, [0, 1], EASE.inOut);
  const th = rad(tilt);
  const toAx = (x: number, y: number): P => [x * Math.cos(th) + y * Math.sin(th), -x * Math.sin(th) + y * Math.cos(th)];
  const list = pronPose(f, meet).list.map((q) => {
    const [x, y] = toAx(q.x, q.y);
    return { x, y, r: q.r };
  });
  const kx = 1 + el;
  const ky = 1 / (1 + el);
  const plateY = (list[0].y + list[1].y) / 2;
  // Poles: either side of the plate, riding out with the stretch, ending at
  // the daughters' nucleus positions (lobe centre + CellLayer's nucleus offset).
  const lobe = (j: number): P => {
    if (!hero) return [j === 0 ? -72 : 72, plateY];
    const A = toAx(hero.ax, hero.ay);
    const Bp = toAx(hero.bx, hero.by);
    // j = 0 is the pole at the axis' negative end: take that daughter
    const useA = (j === 0) === (A[0] <= Bp[0]);
    const [x, y] = useA ? A : Bp;
    const [ox, oy] = nucOff(useA ? "ca" : "cb");
    const o = toAx(90 * ox, 90 * oy);
    return [x * kx + o[0], y * ky + o[1]];
  };
  // The spindle lengthens on its own (anaphase B), independent of the furrow,
  // then the sets settle where each daughter's nucleus forms.
  const pole = (j: number): P => {
    const s = j === 0 ? -1 : 1;
    const ana: P = [s * lerp(58, 68, apart) * kx, plateY];
    const L = lobe(j);
    return [lerp(ana[0], L[0], gone), lerp(ana[1], L[1], gone)];
  };
  const poles = [pole(0), pole(1)];
  const vis = plate * (1 - Math.max(0, gone * 1.4 - 0.4));
  const spindle = vis * (1 - 0.5 * apart);
  const parts = CHROMS.flatMap((c, i) => {
    // from its own pronucleus onto the shared plate
    const src = list[c.k];
    const mx = lerp(src.x + c.src[0] * src.r, c.px, plate);
    const my = lerp(src.y + c.src[1] * src.r, plateY + c.py, plate);
    const a: P = [Math.cos(rad(c.tilt)), Math.sin(rad(c.tilt))];
    const t = Math.min(1, apart * c.lag);
    const shrink = 1 - 0.35 * gone;
    return [0, 1].map((j) => {
      const s = j === 0 ? -1 : 1;
      const p = poles[j];
      // centromere leads toward its pole; the set bunches up as it goes
      const cx = lerp(mx + s * 1.2, p[0] + (mx - p[0]) * 0.16, t);
      const cy = lerp(my, p[1] + (my - plateY) * 0.42, t);
      const gx = lerp(cx, p[0], gone);
      const gy = lerp(cy, p[1], gone);
      // arms: an X while paired (ends splay away from the partner), a V once pulled
      const trail = c.h * 0.9 * Math.sin(Math.PI * Math.min(1, t * 1.15));
      const h = c.h * shrink;
      const splay = 2.4 * (1 - t) + 1.2;
      const arm = (q: number): P => [gx + q * a[0] * h + s * splay * (1 - t) - s * trail * shrink, gy + q * a[1] * h];
      const o = vis * (j === 0 ? 1 : Math.min(1, 0.85 + apart * 2));
      return { key: `${i}-${j}`, j, cen: [gx, gy] as P, pts: [arm(-1), [gx, gy] as P, arm(1)], k: c.k, o, w: 4 * (1 - 0.3 * gone) };
    });
  });
  return (
    <g>
      <defs>
        <radialGradient id={`${ID}-pole`}>
          <stop offset={0} stopColor={C.text} stopOpacity={0.7} />
          <stop offset={0.35} stopColor={C.gold} stopOpacity={0.3} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${ID}-halo`}>
          <stop offset={0} stopColor={C.gold} stopOpacity={0.35} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <Pronuclei f={f} meet={meet} op={pronOp} env={env} />
      {vis > 0.01 && (
        <g transform={`rotate(${tilt.toFixed(3)})`}>
          {/* soft light behind the plate so the marks lift off the cytoplasm */}
          <ellipse cx={0} cy={plateY} rx={34 + 40 * apart} ry={52} fill={`url(#${ID}-halo)`} opacity={vis} />
          {/* spindle: a fibre from each pole to every centromere (they shorten as
              the halves are pulled), plus 4 polar fibres bowing past the plate */}
          <g fill="none" stroke={C.text} strokeLinecap="round" opacity={spindle}>
            {parts.map((q) => (
              <path key={q.key} d={pl([poles[q.j], q.cen])} strokeOpacity={0.26} strokeWidth={1.2} />
            ))}
            {[-46, -38, 38, 46].map((b, i) => (
              <path
                key={i}
                d={`M${poles[0][0].toFixed(1)} ${poles[0][1].toFixed(1)}Q0 ${(plateY + b * 2).toFixed(1)} ${poles[1][0].toFixed(1)} ${poles[1][1].toFixed(1)}`}
                strokeOpacity={0.18}
                strokeWidth={1.1}
              />
            ))}
          </g>
          {poles.map(([x, y], j) => (
            <circle key={j} cx={x} cy={y} r={9} fill={`url(#${ID}-pole)`} opacity={spindle * 0.7} />
          ))}
          {parts.map((q) => (
            <Chromatid key={q.key} pts={q.pts} k={q.k} o={q.o} w={q.w} />
          ))}
        </g>
      )}
    </g>
  );
};
