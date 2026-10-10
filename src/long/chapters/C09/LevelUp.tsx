// "The embryo becomes a fetus": a warm band of light sweeps over the body
// from head to toe (clipped to the skin), then a soft gold halo blooms off
// the whole silhouette as the band leaves the toes. Fetus-local px.
import React from "react";
import { C } from "../../../theme/colors";

export const LevelUpDefs: React.FC<{ bandY: number; h: number }> = ({ bandY, h }) => (
  <>
    <linearGradient id="c09-lvl" gradientUnits="userSpaceOnUse" x1={0} y1={bandY - h / 2} x2={0} y2={bandY + h / 2}>
      <stop offset={0} stopColor={C.gold} stopOpacity={0} />
      <stop offset={0.3} stopColor={C.peach} stopOpacity={0.55} />
      <stop offset={0.5} stopColor={C.text} stopOpacity={0.72} />
      <stop offset={0.7} stopColor={C.gold} stopOpacity={0.55} />
      <stop offset={1} stopColor={C.gold} stopOpacity={0} />
    </linearGradient>
    <filter id="c09-halo" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation={20} />
    </filter>
  </>
);

// the band, drawn OVER the body (clipped to the skin)
export const LevelUpBand: React.FC<{ bandY: number; h: number; bandA: number }> = ({ bandY, h, bandA }) =>
  bandA <= 0.01 ? null : (
    <g clipPath="url(#c09-bodyClip)" opacity={bandA}>
      <rect x={-400} y={bandY - h / 2} width={800} height={h} fill="url(#c09-lvl)" />
    </g>
  );

// the halo, drawn BEHIND the body: a blurred gold silhouette that swells out
export const LevelUpHalo: React.FC<{ silhouette: string[]; css: string; halo: number; centre: { x: number; y: number } }> = ({
  silhouette,
  css,
  halo,
  centre,
}) =>
  halo <= 0.01 ? null : (
    <g
      opacity={0.6 * halo}
      filter="url(#c09-halo)"
      transform={`translate(${centre.x} ${centre.y}) scale(${1.02 + 0.08 * (1 - halo)}) translate(${-centre.x} ${-centre.y})`}
    >
      <g transform={css}>
        {silhouette.map((d, i) => (
          <path key={i} d={d} fill={C.gold} />
        ))}
      </g>
    </g>
  );
