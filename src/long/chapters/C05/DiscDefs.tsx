import React from "react";
import { interpolateColors } from "remotion";
import { C } from "../../../theme/colors";
import { View } from "./view";

// Gradients + filters for the hand-drawn disc. Same colour recipe as the embryo
// kit's germ-layer disc (ectoderm cool, mesoderm rose, endoderm gold, lit from
// the top-left), so the swap to the kit at the end reads as one object.
export const mix = (a: string, b: string, t: number) => interpolateColors(t, [0, 1], [a, b]);

const TOP = [C.cell, mix(C.cell, C.cellCyan, 0.4), mix(C.cellCyan, C.cellBlue, 0.35), mix(C.cellBlue, C.wombDeep, 0.4)];
const ECTO = [mix(C.cellCyan, C.cell, 0.3), C.cellCyan, mix(C.cellCyan, C.cellBlue, 0.5), C.cellBlue];
const MESO = [mix(C.rose, C.skin, 0.3), C.rose, mix(C.rose, C.womb, 0.3), C.womb];
const ENDO = [mix(C.gold, C.text, 0.3), C.gold, mix(C.gold, C.peach, 0.25), mix(C.gold, C.skinShade, 0.5)];
const OFFS = [0, 0.42, 0.8, 1];
export const BAND_FILLS = ["c05-endo", "c05-meso", "c05-ecto"] as const;
// the light each layer gives off when it glows (endo, meso, ecto)
export const LAYER_LIGHT = [mix(C.gold, C.text, 0.45), mix(C.rose, C.skin, 0.5), C.cell] as const;
export const LAYER_TINT = [C.gold, C.rose, C.cellCyan] as const;
// multiply tone that dims a layer while another one speaks (same hue, darker). The
// ectoderm's is a near-neutral grey: a blue multiply over cyan turned it royal blue.
export const LAYER_DIM = [mix(C.skinShade, C.womb, 0.35), mix(C.womb, C.wombDeep, 0.3), mix(C.cell, C.bg1, 0.55)] as const;

const Lit: React.FC<{ id: string; stops: string[]; at: { x: number; y: number }; r: number }> = ({ id, stops, at, r }) => (
  <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={at.x} cy={at.y} r={r}>
    {OFFS.map((o, i) => (
      <stop key={i} offset={o} stopColor={stops[i]} />
    ))}
  </radialGradient>
);

const CellGrad: React.FC<{ id: string; hi: string; body: string }> = ({ id, hi, body }) => (
  <radialGradient id={id} cx="0.4" cy="0.36" r="0.64">
    <stop offset="0" stopColor={hi} stopOpacity={0.5} />
    <stop offset="0.6" stopColor={body} stopOpacity={0.32} />
    <stop offset="1" stopColor={body} stopOpacity={0} />
  </radialGradient>
);

export const DiscDefs: React.FC<{ v: View }> = ({ v }) => {
  const s = Math.sin((v.phi * Math.PI) / 180);
  const at = { x: v.cx - 0.55 * v.A, y: v.cy - v.B * s - 40 };
  const r = 1.45 * v.A + 60;
  return (
    <defs>
      <Lit id="c05-top" stops={TOP} at={at} r={r} />
      <Lit id="c05-ecto" stops={ECTO} at={at} r={r} />
      <Lit id="c05-meso" stops={MESO} at={at} r={r} />
      <Lit id="c05-endo" stops={ENDO} at={at} r={r} />
      <CellGrad id="c05-cell-2" hi={C.text} body={C.cell} />
      <CellGrad id="c05-cell-1" hi={C.skin} body={C.rose} />
      <CellGrad id="c05-cell-0" hi={C.text} body={C.gold} />
      <radialGradient id="c05-soft" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={C.text} stopOpacity={0.85} />
        <stop offset="0.5" stopColor={C.cell} stopOpacity={0.45} />
        <stop offset="1" stopColor={C.cell} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="c05-under" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={C.rose} stopOpacity={0.7} />
        <stop offset="0.6" stopColor={C.rose} stopOpacity={0.35} />
        <stop offset="1" stopColor={C.rose} stopOpacity={0} />
      </radialGradient>
      <filter id="c05-halo" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="18" />
      </filter>
      <filter id="c05-soften" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
      {/* the kit's directional rim light (top-left), core shade + warm bounce (bottom-right) */}
      <filter id="c05-rimfx" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feOffset in="SourceAlpha" dx="5" dy="6" result="o1" />
        <feGaussianBlur in="o1" stdDeviation="3" result="b1" />
        <feComposite in="SourceAlpha" in2="b1" operator="out" result="rimL" />
        <feFlood floodColor={C.text} floodOpacity={0.72} result="c1" />
        <feComposite in="c1" in2="rimL" operator="in" result="rimLc" />
        <feOffset in="SourceAlpha" dx="-13" dy="-12" result="o2" />
        <feGaussianBlur in="o2" stdDeviation="10" result="b2" />
        <feComposite in="SourceAlpha" in2="b2" operator="out" result="sh" />
        <feFlood floodColor={C.womb} floodOpacity={0.55} result="c2" />
        <feComposite in="c2" in2="sh" operator="in" result="shc" />
        <feOffset in="SourceAlpha" dx="-3" dy="-3" result="o3" />
        <feGaussianBlur in="o3" stdDeviation="1.2" result="b3" />
        <feComposite in="SourceAlpha" in2="b3" operator="out" result="bo" />
        <feFlood floodColor={C.rose} floodOpacity={0.9} result="c3" />
        <feComposite in="c3" in2="bo" operator="in" result="boc" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="shc" />
          <feMergeNode in="boc" />
          <feMergeNode in="rimLc" />
        </feMerge>
      </filter>
    </defs>
  );
};
