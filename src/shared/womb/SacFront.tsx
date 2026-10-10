// Front half of the amniotic sac (drawn over the baby): rim sheen, a soft
// glowing membrane edge, the crisp pearly membrane line and glassy
// specular highlights (upper left, like every womb shot in the teaser).
// `gaps` hides the membrane line where a placenta sits, so the amnion line
// hands over to the placenta's own surface line. SVG <g>, world px. Internal.
import React from "react";
import { C } from "../../theme/colors";
import { Pt, polar, useUid } from "./geom";
import { SacState, aspectTf, shapeArc } from "./sacContext";

export type SacGap = { at: number; spread: number; size: number };

const wedge = (sac: SacState, g: SacGap) => {
  const c = { x: sac.shape.cx, y: sac.shape.cy };
  const R = sac.rAt((g.at * Math.PI) / 180);
  const s = (R / 360) * g.size;
  const a0 = g.at - g.spread + 6;
  const a1 = g.at + g.spread - 6;
  const pts: Pt[] = [polar(c, R - 160 * s, a0), polar(c, R + 70 * s, a0), polar(c, R + 70 * s, (a0 + a1) / 2), polar(c, R + 70 * s, a1), polar(c, R - 160 * s, a1)];
  return `M${pts.map((q) => `${q.x},${q.y}`).join(" L")}Z`;
};

export const SacFront: React.FC<{ sac: SacState; sheen: number; gaps: SacGap[]; flash: number }> = ({ sac, sheen, gaps, flash }) => {
  const id = useUid("sacf");
  const { cx, cy, r: R } = sac.shape;
  const w = sac.warmth;
  const shimmer = 0.85 + 0.15 * Math.sin(sac.frame * 0.05);
  const big = { x: cx - R * 2, y: cy - R * 2.4, width: R * 4, height: R * 4.8 };
  const dot = (() => {
    const th = (248 * Math.PI) / 180;
    return polar({ x: cx, y: cy }, sac.rAt(th) - 18, 248);
  })();
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-sheen`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={R + 4} gradientTransform={aspectTf(sac.shape)}>
          <stop offset="0.78" stopColor={C.rose} stopOpacity={0} />
          <stop offset="0.96" stopColor={C.rose} stopOpacity={0.22} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0.35} />
        </radialGradient>
        <linearGradient id={`${id}-mem`} gradientUnits="userSpaceOnUse" x1={cx - R} y1={cy - R} x2={cx + R} y2={cy + R}>
          <stop offset="0" stopColor={C.skin} stopOpacity={0.9} />
          <stop offset="0.5" stopColor={C.rose} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0.55} />
        </linearGradient>
        <filter id={`${id}-b9`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={`${id}-b5`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        {gaps.length > 0 && (
          <mask id={`${id}-gap`} maskUnits="userSpaceOnUse" {...big}>
            <rect {...big} fill="white" />
            {gaps.map((g, i) => (
              <path key={i} d={wedge(sac, g)} fill="black" filter={`url(#${id}-b9)`} />
            ))}
          </mask>
        )}
      </defs>
      <g mask={gaps.length > 0 ? `url(#${id}-gap)` : undefined}>
        <path d={sac.d} fill={`url(#${id}-sheen)`} opacity={0.35 + 0.65 * Math.pow(w, 1.5)} />
        <path d={sac.d} fill="none" stroke={C.rose} strokeOpacity={0.22 + 0.13 * w} strokeWidth={22} filter={`url(#${id}-b9)`} />
        <path d={sac.d} fill="none" stroke={`url(#${id}-mem)`} strokeWidth={3} />
        <path d={sac.d} fill="none" stroke={C.peach} strokeOpacity={0.35 + 0.35 * w} strokeWidth={1.6} />
        {flash > 0.01 && <path d={sac.d} fill="none" stroke={C.gold} strokeWidth={4} opacity={0.3 * flash} />}
      </g>
      {sheen > 0.01 && (
        <g opacity={sheen} fill="none" strokeLinecap="round" mask={gaps.length > 0 ? `url(#${id}-gap)` : undefined}>
          <path d={shapeArc(sac.shape, 24, 196, 250)} stroke={C.text} strokeOpacity={0.3 * shimmer} strokeWidth={15} filter={`url(#${id}-b5)`} />
          <path d={shapeArc(sac.shape, 18, 204, 238)} stroke={C.text} strokeOpacity={0.55 * shimmer} strokeWidth={3.5} />
          <circle cx={dot.x} cy={dot.y} r={3.5} fill={C.text} opacity={0.6 * shimmer} />
          <path d={shapeArc(sac.shape, 12, 22, 70)} stroke={C.rose} strokeOpacity={0.38} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};
