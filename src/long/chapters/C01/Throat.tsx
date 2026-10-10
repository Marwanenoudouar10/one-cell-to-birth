import React from "react";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { C } from "../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { B } from "./beats";
import { layerXf, xfAttr } from "./camera";
import { captionMask } from "./constants";
import { GAP, GATE_U, gateY, liningX } from "./corridor";

// Gate 3, the tube entrance: the ciliated tube walls bend in to a narrow neck,
// then flare out into the womb below (an hourglass, not two lobes). The upper
// faces catch the egg's light; the lower faces fall into shadow. Egg plane,
// gently soft, drawn IN FRONT of the distant egg. Local coordinates: gate line
// y = 0, gap centre x = 0; each side is built against its own tube wall x.
const D = GAP - 95; // the lower flare was drawn for a 95-unit gap; wider gaps shift it out
const TOP = -260; // where the funnel leaves the tube wall (above it the lining takes over)
const wallX = (side: number) => Math.abs(liningX(GATE_U + TOP, side));
const upper = (lw: number) => `L${-lw} ${TOP}C${-lw + 4} ${TOP + 130} ${-GAP - 64} -112 -${GAP} 0`;
const LOWER_C = `C${-84 - D} 82 ${-190 - D} 172 ${-330 - D * 0.6} 252C-540 352 -820 412 -1500 442`;
const LOWER = `M-${GAP} 0${LOWER_C}`;
const shapeFor = (lw: number) => `M-1500 ${TOP - 300}L${-lw} ${TOP - 300}${upper(lw)}${LOWER_C}Z`;
const rimFor = (lw: number) => `M${-lw} ${TOP - 160}${upper(lw)}`;
const FOLDS = [
  "M-1200 -120C-800 -110 -420 -90 -230 -20",
  "M-1250 40C-860 40 -520 60 -300 120",
  "M-1300 230C-980 240 -700 260 -480 310",
];

export const Throat: React.FC<{ frame: number }> = ({ frame }) => {
  const fade = 1 - tween(frame, B.oneOut - 6, B.touch, [0, 1], EASE.inOut);
  const L = layerXf(frame, 1);
  const gy = gateY(frame);
  const top = -L.oy / L.zL;
  const bottom = (HEIGHT - L.oy) / L.zL;
  if (fade <= 0.01 || gy + 460 < top || gy - 240 > bottom) return null;
  const breathe = 1 + noise2D("c01-throat", frame * 0.02, 0) * 0.02;
  const half = (side: number) => {
    const lw = wallX(side);
    const shape = shapeFor(lw);
    const rim = rimFor(lw);
    return (
      <g transform={`scale(${side} 1)`} mask="url(#c01-throat-top)">
        <path d={shape} fill="url(#c01-throat-fill)" />
        <path d={shape} fill="url(#c01-throat-shade)" />
        {FOLDS.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={C.womb} strokeOpacity={0.09} strokeWidth={22} strokeLinecap="round" />
        ))}
        <path d={LOWER} fill="none" stroke={C.womb} strokeOpacity={0.26} strokeWidth={2.2} />
        <path d={rim} fill="none" stroke={C.rose} strokeOpacity={0.14} strokeWidth={16} strokeLinecap="round" />
        <path d={rim} fill="none" stroke={C.rose} strokeOpacity={0.55} strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={-GAP - 14} cy={-6} r={46} fill="url(#c01-throat-tip)" />
      </g>
    );
  };
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", opacity: fade, filter: "blur(1.6px)", ...captionMask }}>
      <defs>
        <radialGradient id="c01-throat-fill" gradientUnits="userSpaceOnUse" cx={-150} cy={-40} r={950} fx={-110} fy={-30}>
          <stop offset="0" stopColor={C.womb} stopOpacity={0.8} />
          <stop offset="0.12" stopColor={C.wombDeep} stopOpacity={0.95} />
          <stop offset="0.45" stopColor={C.bg2} stopOpacity={0.98} />
          <stop offset="1" stopColor={C.bg1} stopOpacity={1} />
        </radialGradient>
        {/* volume: the upper face catches the egg's light; the underside, facing the
            womb and away from the egg, is a dark silhouette with a thin rim */}
        <linearGradient id="c01-throat-shade" gradientUnits="userSpaceOnUse" x1={0} y1={TOP} x2={0} y2={440}>
          <stop offset="0" stopColor={C.rose} stopOpacity={0.16} />
          <stop offset="0.3" stopColor={C.rose} stopOpacity={0} />
          <stop offset="0.5" stopColor={C.bg0} stopOpacity={0.3} />
          <stop offset="1" stopColor={C.bg0} stopOpacity={0.72} />
        </linearGradient>
        {/* the funnel melts into the tube wall above it (the lining is drawn behind) */}
        <linearGradient id="c01-throat-topg" gradientUnits="userSpaceOnUse" x1={0} y1={TOP - 110} x2={0} y2={TOP + 40}>
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#fff" stopOpacity={1} />
        </linearGradient>
        <mask id="c01-throat-top" maskUnits="userSpaceOnUse" x={-1600} y={TOP - 400} width={3200} height={1400}>
          <rect x={-1600} y={TOP - 400} width={3200} height={1400} fill="url(#c01-throat-topg)" />
        </mask>
        <radialGradient id="c01-throat-tip">
          <stop offset="0" stopColor={C.peach} stopOpacity={0.32} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={xfAttr(L)}>
        <g transform={`translate(0 ${gy.toFixed(2)}) scale(${breathe.toFixed(4)} 1)`}>
          {half(1)}
          {half(-1)}
        </g>
      </g>
    </svg>
  );
};
