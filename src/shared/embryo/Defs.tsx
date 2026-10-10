import React from "react";
import { interpolateColors } from "remotion";
import { C } from "../../theme/colors";
import { Pt } from "./math";
import { HeartDefs } from "./Heart";

// Gradients, clip and filters for one embryo instance (ids = `${uid}-...`).
// Scene3's skin / bud / eye / rim-light recipe, plus germ-layer fills that
// melt into the skin as `germ` goes 1 -> 0.

const mix = (a: string, b: string, t: number) => interpolateColors(t, [0, 1], [a, b]);
const SKIN = [C.skin, C.peach, C.skinShade, C.rose];
// ectoderm (cool, cell-like), mesoderm (rose), endoderm (gold): subtle, lit from the top-left
const ECTO = [C.cell, mix(C.cell, C.cellCyan, 0.4), mix(C.cellCyan, C.cellBlue, 0.35), mix(C.cellBlue, C.wombDeep, 0.4)];
const SIDE = [mix(C.cellCyan, C.cell, 0.3), C.cellCyan, mix(C.cellCyan, C.cellBlue, 0.5), C.cellBlue];
const MESO = [mix(C.rose, C.skin, 0.3), C.rose, mix(C.rose, C.womb, 0.3), C.womb];
const ENDO = [mix(C.gold, C.skin, 0.2), C.gold, mix(C.gold, C.peach, 0.4), mix(C.gold, C.skinShade, 0.6)];
const OFFS = [0, 0.42, 0.8, 1];

const Skinish: React.FC<{ id: string; at: Pt; to: string[]; germ: number }> = ({ id, at, to, germ }) => (
  <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={at.x} cy={at.y} r={240}>
    {OFFS.map((o, i) => (
      <stop key={i} offset={o} stopColor={germ > 0 ? mix(SKIN[i], to[i], germ) : SKIN[i]} />
    ))}
  </radialGradient>
);

type Props = {
  uid: string;
  light: Pt; // skin gradient centre (top-left of the body)
  heart: Pt;
  germ: number;
  pulse: number;
  ignite: number;
  hold: number;
  clip: React.ReactNode; // body silhouette for the inner clip
};

export const Defs: React.FC<Props> = ({ uid, light, heart, germ, pulse, ignite, hold, clip }) => (
  <defs>
    <Skinish id={`${uid}-skin`} at={light} to={ECTO} germ={germ} />
    {germ > 0 && <Skinish id={`${uid}-ecto`} at={light} to={SIDE} germ={germ} />}
    {germ > 0 && <Skinish id={`${uid}-meso`} at={light} to={MESO} germ={germ} />}
    {germ > 0 && <Skinish id={`${uid}-endo`} at={light} to={ENDO} germ={germ} />}
    <radialGradient id={`${uid}-soft`} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor={C.text} stopOpacity={0.85} />
      <stop offset="0.5" stopColor={C.skin} stopOpacity={0.5} />
      <stop offset="1" stopColor={C.skin} stopOpacity={0} />
    </radialGradient>
    <radialGradient id={`${uid}-somite`} cx="0.45" cy="0.4" r="0.6">
      <stop offset="0" stopColor={mix(C.skin, C.rose, germ)} stopOpacity={0.95} />
      <stop offset="0.6" stopColor={mix(C.skin, C.rose, germ)} stopOpacity={0.55} />
      <stop offset="1" stopColor={C.skinShade} stopOpacity={0} />
    </radialGradient>
    <radialGradient id={`${uid}-bud`} cx="0.38" cy="0.35" r="0.7">
      <stop offset="0" stopColor={C.skin} />
      <stop offset="0.6" stopColor={C.peach} />
      <stop offset="1" stopColor={C.skinShade} />
    </radialGradient>
    <radialGradient id={`${uid}-eye`} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor={C.wombDeep} stopOpacity={0.55} />
      <stop offset="0.5" stopColor={C.bg2} stopOpacity={0.85} />
      <stop offset="0.72" stopColor={C.wombDeep} stopOpacity={0.55} />
      <stop offset="1" stopColor={C.wombDeep} stopOpacity={0} />
    </radialGradient>
    <radialGradient id={`${uid}-iris`} cx="0.42" cy="0.4" r="0.6">
      <stop offset="0" stopColor={C.bg1} />
      <stop offset="0.6" stopColor={C.bg2} />
      <stop offset="1" stopColor={C.wombDeep} stopOpacity={0} />
    </radialGradient>
    <radialGradient id={`${uid}-spill`} gradientUnits="userSpaceOnUse" cx={heart.x} cy={heart.y} r={190}>
      <stop offset="0" stopColor={C.heart} stopOpacity={0.9} />
      <stop offset="0.35" stopColor={C.rose} stopOpacity={0.45} />
      <stop offset="1" stopColor={C.rose} stopOpacity={0} />
    </radialGradient>
    <HeartDefs uid={uid} pulse={pulse} ignite={ignite} hold={hold} />
    <clipPath id={`${uid}-body`}>{clip}</clipPath>
    <filter id={`${uid}-budsh`} x="-30%" y="-60%" width="160%" height="220%">
      <feGaussianBlur stdDeviation="2.6" />
    </filter>
    <filter id={`${uid}-halo`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
    <filter id={`${uid}-soften`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.6" />
    </filter>
    {/* directional rim light (top-left), core shade + warm bounce edge (bottom-right) */}
    <filter id={`${uid}-rimfx`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
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
