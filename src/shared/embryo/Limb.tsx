import React from "react";
import { C } from "../../theme/colors";
import { Pt, add, lerp, mul, norm, perp, ramp, smoothPath } from "./math";
import { Limb as LimbStage } from "./stage";

// One limb, bud -> paddle -> jointed limb with a hand/foot plate and digits.
// Drawn in limb-local coords: origin = root on the flank, +x = growth direction.
// At week 6 the outline is exactly Scene3's bud ellipse (cosine-spaced samples
// of an elliptical width profile along a straight axis).

const M = 22;
const TS = Array.from({ length: M + 1 }, (_, k) => (1 - Math.cos((Math.PI * k) / M)) / 2);

export type LimbGeo = { body: string; hi: string; palm: Pt; palmR: number; endDir: number; tip: Pt; joint: Pt };

export const limbGeo = (L: LimbStage, paddle: number): LimbGeo => {
  const l1 = L.len * 0.5;
  const b = (L.bend * Math.PI) / 180;
  const J1 = { x: l1, y: 0 };
  const J2 = add(J1, { x: Math.cos(b) * L.len * 0.5, y: Math.sin(b) * L.len * 0.5 });
  const at = (t: number): Pt => add(mul(J1, 2 * (1 - t) * t), mul(J2, t * t));
  const tan = (t: number): Pt => norm(add(mul(J1, 2 * (1 - 2 * t)), mul(J2, 2 * t)));
  // bud = ellipse profile; limb = a stalk that stays broad at the shoulder
  const prof = (t: number) => {
    const bud = Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
    const end = Math.sqrt(Math.max(0, 1 - ((t - 0.8) / 0.2) ** 2));
    const stalk = (t < 0.8 ? 1.05 - 0.25 * t : 0.85 * end) * (t < 0.12 ? 0.6 + 0.4 * Math.sin((t / 0.12) * (Math.PI / 2)) : 1);
    return lerp(bud, stalk, paddle);
  };
  const edge = (k: number, ofs: number, t0 = 0, t1 = 1) => {
    const pts: Pt[] = [];
    for (const tr of TS) {
      const t = lerp(t0, t1, tr);
      const n = perp(tan(t));
      pts.push(add(at(t), mul(n, ofs + k * L.width * prof(t))));
    }
    return pts;
  };
  const outline = (scale: number, ofs: number, t0 = 0, t1 = 1) =>
    smoothPath([...edge(scale, ofs, t0, t1), ...edge(-scale, ofs, t0, t1).reverse()], true);
  const e = tan(1);
  const endDir = (Math.atan2(e.y, e.x) * 180) / Math.PI + L.turn;
  const pd = { x: Math.cos((endDir * Math.PI) / 180), y: Math.sin((endDir * Math.PI) / 180) };
  const back = add(J2, mul(e, -L.plate * 0.55));
  return {
    body: outline(1, 0),
    hi: outline(0.38, -0.3 * L.width, 0.2, 0.8),
    palm: add(back, mul(pd, L.plate * 0.55)),
    palmR: L.plate,
    endDir,
    tip: add(back, mul(pd, L.plate * 1.6)),
    joint: J1,
  };
};

// Digits fanning from the palm; `digits` grows them, `web` keeps them joined.
const Digits: React.FC<{ g: LimbGeo; L: LimbStage; foot: boolean; fill: string }> = ({ g, L, foot, fill }) => {
  const d = L.digits;
  if (d <= 0.01 || g.palmR < 1) return null;
  const r = g.palmR;
  const spread = foot ? 70 : 96;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (((i / 4 - 0.5) * spread + g.endDir) * Math.PI) / 180;
    const len = r * (0.55 + 0.5 * d * (foot ? 0.7 : 1) * (1 - 0.18 * Math.abs(i - 2)));
    const base = add(g.palm, { x: Math.cos(a) * r * 0.25, y: Math.sin(a) * r * 0.25 });
    const tipP = add(g.palm, { x: Math.cos(a) * (r * 0.25 + len), y: Math.sin(a) * (r * 0.25 + len) });
    const w = r * (foot ? 0.2 : 0.21) * (0.6 + 0.4 * d);
    out.push(<line key={i} x1={base.x} y1={base.y} x2={tipP.x} y2={tipP.y} stroke={fill} strokeWidth={w * 2} strokeLinecap="round" />);
  }
  return <g>{out}</g>;
};

type Props = { L: LimbStage; foot?: boolean; uid: string; paddle: number };

export const Limb: React.FC<Props> = ({ L, foot = false, uid, paddle }) => {
  if (L.grow <= 0.01) return null;
  const id = `${uid}-${foot ? "leg" : "arm"}`;
  const g = limbGeo(L, paddle);
  const fade = 0.425 * (foot ? 42 : 54);
  const big = L.len * 2 + 60;
  const palmK = 1 - 0.28 * (1 - L.web) * L.digits;
  const rays = ramp(L.digits, 0, 0.5) * (1 - ramp(L.digits, 0.6, 1));
  return (
    <g transform={`scale(${L.grow})`}>
      <defs>
        <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={fade} y2={0}>
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#fff" stopOpacity={1} />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={-big} y={-big} width={big * 2} height={big * 2}>
          <rect x={-big} y={-big} width={big * 2} height={big * 2} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <g transform={`translate(1.5 ${L.width * 0.35})`} opacity={0.4} filter={`url(#${uid}-budsh)`}>
          <path d={g.body} fill={C.womb} />
          {g.palmR > 1 && <ellipse cx={g.palm.x} cy={g.palm.y} rx={g.palmR * palmK} ry={g.palmR * 0.82 * palmK} transform={`rotate(${g.endDir} ${g.palm.x} ${g.palm.y})`} fill={C.womb} />}
        </g>
        <g>
          <path d={g.body} fill={`url(#${uid}-bud)`} />
          {g.palmR > 1 && (
            <>
              {/* soft crease where the plate meets the stalk */}
              <ellipse cx={g.palm.x} cy={g.palm.y} rx={g.palmR * palmK * 1.12} ry={g.palmR * 0.9 * palmK} transform={`rotate(${g.endDir} ${g.palm.x} ${g.palm.y})`} fill={C.womb} opacity={0.22 * ramp(paddle, 0.3, 1)} filter={`url(#${uid}-budsh)`} />
              <Digits g={g} L={L} foot={foot} fill={C.peach} />
              <ellipse cx={g.palm.x} cy={g.palm.y} rx={g.palmR * palmK} ry={g.palmR * 0.82 * palmK} transform={`rotate(${g.endDir} ${g.palm.x} ${g.palm.y})`} fill={`url(#${uid}-bud)`} />
            </>
          )}
        </g>
        <path d={g.hi} fill={`url(#${uid}-soft)`} opacity={0.75} />
        {rays > 0.01 && <Rays g={g} foot={foot} o={rays} />}
      </g>
    </g>
  );
};

// Digital rays: faint condensations inside the plate before the notches cut in.
const Rays: React.FC<{ g: LimbGeo; foot: boolean; o: number }> = ({ g, foot, o }) => {
  const spread = foot ? 70 : 96;
  const r = g.palmR;
  return (
    <g opacity={o * 0.55}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (((i / 4 - 0.5) * spread + g.endDir) * Math.PI) / 180;
        const p0 = add(g.palm, { x: Math.cos(a) * r * 0.15, y: Math.sin(a) * r * 0.15 });
        const p1 = add(g.palm, { x: Math.cos(a) * r * 0.85, y: Math.sin(a) * r * 0.85 });
        return <line key={i} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={C.skin} strokeWidth={r * 0.16} strokeLinecap="round" />;
      })}
    </g>
  );
};

export const limbTip = (L: LimbStage, paddle: number): Pt => {
  const g = limbGeo(L, paddle);
  return mul(g.tip, L.grow);
};
export const limbPalm = (L: LimbStage, paddle: number): Pt => mul(limbGeo(L, paddle).palm, L.grow);
