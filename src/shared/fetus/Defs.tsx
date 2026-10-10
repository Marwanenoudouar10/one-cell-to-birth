// Per-instance <defs> for one fetus: blurs, skin gradients and masks. Every
// id is prefixed with the instance id, so many fetuses can share an <svg>.
// All lengths are rig units (the defs live inside the rig transform); light
// positions are converted from screen space so the key light always sits
// upper-left and the warm rim lower-right, whatever headDown/mirror does.
import React from "react";
import { C } from "../../theme/colors";
import { Pt, add, mul } from "./geom";
import { OutFrame } from "./frame";
import { FetusGeom } from "./rig";

export type Ids = ReturnType<typeof makeIds>;
export const makeIds = (u: string) => {
  const k = (s: string) => `${u}-${s}`;
  return {
    rimSoft: k("rimSoft"), halo: k("halo"), wide: k("wide"), soft: k("soft"), sh: k("sh"), glow: k("glow"), fine: k("fine"),
    body: k("body"), head: k("head"), far: k("far"), hand: k("hand"), foot: k("foot"), rimG: k("rimG"),
    joint: k("joint"), cTorso: k("cTorso"), cBody: k("cBody"), cHead: k("cHead"), cTH: k("cTH"),
    cArm: k("cArm"), cLeg: k("cLeg"), cFar: k("cFar"), hipS: k("hipS"), shS: k("shS"), rimM: k("rimM"), heartG: k("heartG"),
    vernixG: k("vernixG"), blush: k("blush"),
  };
};
export const url = (id: string) => `url(#${id})`;

const blur = (id: string, sd: number, pad = 30) => (
  <filter id={id} x={`-${pad}%`} y={`-${pad}%`} width={`${100 + 2 * pad}%`} height={`${100 + 2 * pad}%`}>
    <feGaussianBlur stdDeviation={sd} />
  </filter>
);

const Radial: React.FC<{ id: string; c: Pt; f: Pt; r: number; stops: [number, string][] }> = ({ id, c, f, r, stops }) => (
  <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={c.x} cy={c.y} r={r} fx={f.x} fy={f.y}>
    {stops.map(([o, col], i) => (
      <stop key={i} offset={o} stopColor={col} />
    ))}
  </radialGradient>
);

const centroid = (pts: Pt[]) => mul(pts.reduce((a, q) => add(a, q), { x: 0, y: 0 }), 1 / pts.length);

export const FetusDefs: React.FC<{ ids: Ids; geo: FetusGeom; fr: OutFrame }> = ({ ids, geo, fr }) => {
  const V = (x: number, y: number, k: number) => mul(fr.vecToRig({ x, y }), k);
  const tc = centroid(geo.sp.outline);
  const D = 1.15 * geo.g.L;
  const hc = geo.headO;
  const H = 250 * geo.headS;
  const h = geo.arm.hand;
  const ft = geo.leg.foot;
  const HS = 62 * h.s;
  const FS = 70 * ft.s;
  const skin: [number, string][] = [[0, C.skin], [0.28, C.skin], [0.66, C.peach], [1, C.skinShade]];
  const big = { x: fr.c.x - 1000, y: fr.c.y - 1000, width: 2000, height: 2000 };
  const rimOff = V(-9, -10, 1);
  return (
    <defs>
      {blur(ids.rimSoft, 5, 20)}
      {blur(ids.halo, 26, 40)}
      {blur(ids.soft, 3, 50)}
      {blur(ids.sh, 7, 30)}
      {blur(ids.glow, 9, 30)}
      {blur(ids.fine, 0.8, 10)}
      {blur(ids.wide, 16, 40)}
      <Radial id={ids.body} c={add(tc, V(-0.2, -0.3, D))} f={add(tc, V(-0.28, -0.4, D))} r={1.08 * D} stops={skin} />
      <Radial id={ids.head} c={add(hc, V(-0.1, -0.16, H))} f={add(hc, V(-0.18, -0.26, H))} r={0.8 * H}
        stops={[[0, C.skin], [0.32, C.skin], [0.72, C.peach], [1, C.skinShade]]} />
      <Radial id={ids.far} c={add(tc, V(-0.1, -0.2, D))} f={add(tc, V(-0.1, -0.2, D))} r={0.95 * D}
        stops={[[0, C.skin], [0.45, C.peach], [1, C.skinShade]]} />
      <Radial id={ids.hand} c={add(h.center, V(-0.12, -0.2, HS))} f={add(h.center, V(-0.2, -0.3, HS))} r={0.9 * HS} stops={skin} />
      <Radial id={ids.foot} c={add(ft.center, V(-0.12, -0.2, FS))} f={add(ft.center, V(-0.2, -0.3, FS))} r={0.9 * FS} stops={skin} />
      <radialGradient id={ids.joint}>
        <stop offset="0" stopColor="black" />
        <stop offset="1" stopColor="white" />
      </radialGradient>
      <radialGradient id={ids.heartG}>
        <stop offset="0" stopColor={C.heart} stopOpacity={0.55} />
        <stop offset="0.5" stopColor={C.rose} stopOpacity={0.22} />
        <stop offset="1" stopColor={C.heart} stopOpacity={0} />
      </radialGradient>
      <radialGradient id={ids.vernixG}>
        <stop offset="0" stopColor={C.text} stopOpacity={0.9} />
        <stop offset="1" stopColor={C.text} stopOpacity={0} />
      </radialGradient>
      <radialGradient id={ids.blush}>
        <stop offset="0" stopColor={C.rose} stopOpacity={0.5} />
        <stop offset="1" stopColor={C.rose} stopOpacity={0} />
      </radialGradient>
      <linearGradient id={ids.rimG} gradientUnits="userSpaceOnUse"
        x1={tc.x + V(-0.5, -0.5, D).x} y1={tc.y + V(-0.5, -0.5, D).y} x2={tc.x + V(0.5, 0.5, D).x} y2={tc.y + V(0.5, 0.5, D).y}>
        <stop offset="0" stopColor={C.skin} />
        <stop offset="1" stopColor={C.gold} />
      </linearGradient>
      <clipPath id={ids.cTorso}>
        <path d={geo.torso} />
      </clipPath>
      <clipPath id={ids.cHead}>
        <path d={geo.head} />
      </clipPath>
      <clipPath id={ids.cTH}>
        <path d={geo.torso} />
        <path d={geo.head} />
      </clipPath>
      <clipPath id={ids.cBody}>
        <path d={geo.torso} />
        <path d={geo.head} />
        <path d={geo.leg.path} />
      </clipPath>
      <clipPath id={ids.cArm}>
        <path d={geo.arm.path} />
      </clipPath>
      <clipPath id={ids.cLeg}>
        <path d={geo.leg.path} />
      </clipPath>
      <clipPath id={ids.cFar}>
        <path d={geo.farLeg.path} />
      </clipPath>
      <mask id={ids.hipS} maskUnits="userSpaceOnUse" {...big}>
        <rect {...big} fill="white" />
        <circle cx={geo.leg.hip.x} cy={geo.leg.hip.y} r={geo.leg.r[0] * 2.6} fill={url(ids.joint)} />
      </mask>
      <mask id={ids.shS} maskUnits="userSpaceOnUse" {...big}>
        <rect {...big} fill="white" />
        <circle cx={geo.arm.shoulder.x} cy={geo.arm.shoulder.y} r={geo.arm.r[0] * 2.6} fill={url(ids.joint)} />
      </mask>
      <mask id={ids.rimM} maskUnits="userSpaceOnUse" {...big}>
        <g fill="white">
          {geo.silhouette.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g fill="black" transform={`translate(${rimOff.x} ${rimOff.y})`} filter={url(ids.rimSoft)}>
          {geo.silhouette.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </mask>
    </defs>
  );
};
