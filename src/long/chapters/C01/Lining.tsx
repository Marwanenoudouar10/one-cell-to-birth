import React from "react";
import { EASE, tween } from "../../../lib/ease";
import { C } from "../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { B, END } from "./beats";
import { camAt, layerXf, scroll, xfAttr } from "./camera";
import { captionMask } from "./constants";
import { LINE_X, LINING_U0, liningX } from "./corridor";
import { n2 } from "./math";

// The tube above the throat (egg plane, in focus): two velvety rose walls with
// a fringe of cilia beating in a travelling (metachronal) wave toward the womb.
// Survivors rest here with their heads in the cilia.
const STEP = 7; // cilia spacing along the wall

export const Lining: React.FC<{ frame: number }> = ({ frame }) => {
  const fade = 1 - tween(frame, B.fuse + 4, END - 4, [0, 1], EASE.inOut);
  if (fade <= 0.01) return null;
  const L = layerXf(frame, 1);
  const sc = scroll(frame);
  const yLo = -L.oy / L.zL - 40;
  const yHi = Math.min((HEIGHT - L.oy) / L.zL + 40, LINING_U0 + sc);
  if (yHi <= yLo) return null;
  const cam = camAt(frame);

  const sideGeo = (side: number) => {
    const surf: string[] = [];
    let cilia = "";
    const y0 = Math.floor((yLo - sc) / STEP) * STEP + sc; // lock cilia to the wall
    for (let y = y0; y <= yHi; y += STEP) {
      const u = y - sc;
      const x = liningX(u, side);
      if ((Math.round(u / STEP) & 1) === 0) surf.push(`${n2(x)},${n2(y)}`);
      // beat: a wave running down the wall; slight bias toward the womb (down)
      const th = 0.5 * Math.sin(frame * 0.32 + u * 0.05) + 0.2;
      const len = 22 + 6 * Math.sin(u * 0.37);
      const dx = -side * Math.cos(th);
      const dy = Math.sin(th);
      const mx = x + -side * Math.cos(th * 0.4) * len * 0.55;
      const my = y + Math.sin(th * 0.4) * len * 0.55;
      cilia += `M${n2(x)} ${n2(y)}Q${n2(mx)} ${n2(my)} ${n2(x + dx * len)} ${n2(y + dy * len)}`;
    }
    const body = `M${side * 1800},${n2(yLo)}L${surf.join("L")}L${side * 1800},${n2(yHi)}Z`;
    const rim = `M${surf.join("L")}`;
    return { body, rim, cilia };
  };
  const geo = [-1, 1].map(sideGeo);

  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", opacity: fade, filter: "blur(0.6px)", ...captionMask }}>
      <defs>
        {[-1, 1].map((side) => (
          <linearGradient key={side} id={`c01-lining${side}`} gradientUnits="userSpaceOnUse" x1={side * LINE_X} y1={0} x2={side * (LINE_X + 420)} y2={0}>
            <stop offset="0" stopColor={C.rose} stopOpacity={0.42} />
            <stop offset="0.06" stopColor={C.womb} stopOpacity={0.5} />
            <stop offset="0.3" stopColor={C.wombDeep} stopOpacity={0.88} />
            <stop offset="1" stopColor={C.bg1} stopOpacity={0.96} />
          </linearGradient>
        ))}
        {/* lit by the egg: brightest beside it */}
        <radialGradient id="c01-lining-lit" gradientUnits="userSpaceOnUse" cx={cam.ex} cy={cam.ey} r={1000}>
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.55" stopColor="#fff" stopOpacity={0.7} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.35} />
        </radialGradient>
        <mask id="c01-lining-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={WIDTH} height={HEIGHT}>
          <rect width={WIDTH} height={HEIGHT} fill="url(#c01-lining-lit)" />
        </mask>
      </defs>
      <g mask="url(#c01-lining-mask)">
        <g transform={xfAttr(L)}>
          {geo.map((g, i) => (
            <g key={i}>
              <path d={g.body} fill={`url(#c01-lining${i === 0 ? -1 : 1})`} />
              <path d={g.cilia} fill="none" stroke={C.peach} strokeOpacity={0.38} strokeWidth={1.7} strokeLinecap="round" />
              <path d={g.rim} fill="none" stroke={C.rose} strokeOpacity={0.14} strokeWidth={14} strokeLinejoin="round" />
              <path d={g.rim} fill="none" stroke={C.rose} strokeOpacity={0.55} strokeWidth={2.4} strokeLinejoin="round" />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
};
