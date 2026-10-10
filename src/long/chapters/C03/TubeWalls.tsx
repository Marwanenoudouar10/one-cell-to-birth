import React from "react";
import { C } from "../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { mix } from "./palette";
import { CX, CY, wallScroll, wallsOp, wallsOpen } from "./timeline";
import { Row, ciliaPaths, creasePaths, edgePaths, flankPaths, row } from "./wallShape";

// The uterine tube around the cluster: rounded folds of lining at the left
// and right edges, a lit band of epithelium, and a fur of cilia beating in a
// metachronal wave (power stroke down). The walls slide up: the cilia carry
// the cluster down the tube toward the womb. Three parallax planes (deep
// folds, the lit ciliated edge, a soft near blur); the cluster's glow lights
// them and they fall off well before the tracker and caption bands.
type Plane = {
  key: string; r: Row; speed: number; blur: number; cilia: boolean;
  body: string; band: [number, string][]; rim: string; rimO: number; ell: [number, number];
};

const TOP = 240;
const BOT = 1440;
const PLANES: Plane[] = [
  {
    key: "deep", r: row("deep", 58, 40, [50, 80], [85, 95], 56), speed: 0.5, blur: 6, cilia: false,
    body: mix(C.bg1, C.bg2, 0.6),
    band: [[110, mix(C.bg2, C.wombDeep, 0.55)], [46, mix(C.bg2, C.womb, 0.32)]],
    rim: mix(C.rose, C.peach, 0.3), rimO: 0.16, ell: [1000, 560],
  },
  {
    key: "edge", r: row("edge", 22, 14, [34, 74], [44, 70], 46), speed: 0.75, blur: 1.1, cilia: true,
    body: mix(C.bg1, C.bg2, 0.75),
    band: [[160, mix(C.bg2, C.wombDeep, 0.6)], [92, mix(C.bg2, C.womb, 0.38)], [44, mix(C.wombDeep, C.womb, 0.5)], [14, mix(C.womb, C.rose, 0.2)]],
    rim: mix(C.rose, C.peach, 0.6), rimO: 0.62, ell: [1000, 560],
  },
  {
    key: "near", r: row("near", -80, 20, [60, 110], [150, 120], 40), speed: 1.9, blur: 18, cilia: false,
    body: mix(C.bg0, C.bg1, 0.6),
    band: [[130, mix(C.bg1, C.wombDeep, 0.5)], [56, mix(C.wombDeep, C.womb, 0.3)]],
    rim: C.rose, rimO: 0.24, ell: [1100, 640],
  },
];

const PlaneSvg: React.FC<{ p: Plane; f: number }> = ({ p, f }) => {
  const scroll = wallScroll(f, p.speed);
  const id = `c03w-${p.key}`;
  const open = wallsOpen(f) * 150 * p.speed;
  const sides = [-1, 1].map((side) => ({
    side,
    ...edgePaths(p.r, side, scroll, f, TOP - 80, BOT + 80),
    crease: p.cilia ? creasePaths(p.r, side, scroll, f, TOP, BOT) : "",
    ...flankPaths(p.r, side, scroll, f, TOP - 40, BOT + 40),
    ...(p.cilia ? ciliaPaths(p.r, side, scroll, f, TOP, BOT, 5.5, 34) : { hairs: "", tips: "" }),
  }));
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", filter: `blur(${p.blur}px)` }}>
      <defs>
        <radialGradient id={`${id}-lit`} gradientUnits="userSpaceOnUse" cx={CX} cy={CY - 30} r={1}
          gradientTransform={`translate(${CX} ${CY - 30}) scale(${p.ell[0]} ${p.ell[1]}) translate(${-CX} ${-(CY - 30)})`}>
          <stop offset={0} stopColor="#fff" stopOpacity={1} />
          <stop offset={0.42} stopColor="#fff" stopOpacity={0.9} />
          <stop offset={0.68} stopColor="#fff" stopOpacity={0.5} />
          <stop offset={0.86} stopColor="#fff" stopOpacity={0.14} />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={0} y={0} width={WIDTH} height={HEIGHT}>
          <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-lit)`} />
        </mask>
        {/* tips catch the cluster's gold light, cooler away from it */}
        <radialGradient id={`${id}-tip`} gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r={560}>
          <stop offset={0.35} stopColor={mix(C.gold, C.text, 0.4)} />
          <stop offset={1} stopColor={mix(C.peach, C.text, 0.5)} />
        </radialGradient>
        {sides.map((s) => (
          <clipPath key={s.side} id={`${id}-clip${s.side}`}>
            <path d={s.body} />
          </clipPath>
        ))}
      </defs>
      <g mask={`url(#${id}-mask)`}>
        {sides.map((s) => (
          <g key={s.side} transform={open > 0.05 ? `translate(${(s.side * open).toFixed(1)} 0)` : undefined}>
            <path d={s.line} fill="none" stroke={C.rose} strokeOpacity={0.07} strokeWidth={60} />
            <path d={s.body} fill={p.body} />
            {/* soft lit band + fold volume, blurred, then clipped to the tissue */}
            <g clipPath={`url(#${id}-clip${s.side})`}>
              <g style={{ filter: `blur(${p.cilia ? 9 : 6}px)` }}>
                {p.band.map(([w, c], i) => (
                  <path key={i} d={s.line} fill="none" stroke={c} strokeWidth={w} strokeOpacity={0.9} strokeLinejoin="round" />
                ))}
                {s.shade && <path d={s.shade} fill="none" stroke={C.bg1} strokeOpacity={0.5} strokeWidth={34} strokeLinecap="round" />}
                {s.crease && <path d={s.crease} fill="none" stroke={C.bg1} strokeOpacity={0.6} strokeWidth={12} strokeLinecap="round" />}
                {s.lit && <path d={s.lit} fill="none" stroke={mix(C.rose, C.peach, 0.5)} strokeOpacity={0.4} strokeWidth={22} strokeLinecap="round" />}
              </g>
            </g>
            {s.lit && p.cilia && <path d={s.lit} fill="none" stroke={mix(C.peach, C.text, 0.4)} strokeOpacity={0.45} strokeWidth={3} strokeLinecap="round" />}
            <path d={s.line} fill="none" stroke={p.rim} strokeOpacity={p.rimO} strokeWidth={p.cilia ? 2.4 : 5} strokeLinejoin="round" />
            {s.hairs && (
              <>
                <path d={s.hairs} fill="none" stroke={C.rose} strokeOpacity={0.09} strokeWidth={7} strokeLinecap="round" />
                <path d={s.hairs} fill="none" stroke={mix(C.peach, C.rose, 0.35)} strokeOpacity={0.6} strokeWidth={1.9} strokeLinecap="round" />
                <path d={s.tips} fill="none" stroke={`url(#${id}-tip)`} strokeOpacity={0.55} strokeWidth={1.3} strokeLinecap="round" />
              </>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
};

// near = false: the planes behind the cluster; true: the soft foreground blur.
export const TubeWalls: React.FC<{ f: number; near: boolean }> = ({ f, near }) => {
  const o = wallsOp(f);
  if (o <= 0.01) return null;
  const planes = near ? PLANES.slice(2) : PLANES.slice(0, 2);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      {planes.map((p) => (
        <PlaneSvg key={p.key} p={p} f={f} />
      ))}
    </div>
  );
};
