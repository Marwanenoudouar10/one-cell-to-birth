import React from "react";
import { C } from "../../../theme/colors";
import { mix } from "./palette";
import { WALL } from "./timeline";

// Paint for the womb wall (world px; WALL = surface under the landing spot).
const Y = (v: number) => WALL + v;

export const WallDefs: React.FC = () => (
  <defs>
    <linearGradient id="c04w-body" gradientUnits="userSpaceOnUse" x1={0} y1={Y(-220)} x2={0} y2={Y(1250)}>
      <stop offset={0} stopColor={mix(C.womb, C.rose, 0.55)} />
      <stop offset={0.13} stopColor={mix(C.womb, C.rose, 0.22)} />
      <stop offset={0.26} stopColor={mix(C.womb, C.wombDeep, 0.42)} />
      <stop offset={0.44} stopColor={C.wombDeep} />
      <stop offset={0.7} stopColor={mix(C.bg2, C.bg1, 0.5)} />
      <stop offset={1} stopColor={C.bg0} />
    </linearGradient>
    <linearGradient id="c04w-veil" gradientUnits="userSpaceOnUse" x1={0} y1={Y(-260)} x2={0} y2={Y(520)}>
      <stop offset={0} stopColor={mix(C.womb, C.rose, 0.62)} stopOpacity={0.86} />
      <stop offset={0.32} stopColor={mix(C.womb, C.rose, 0.3)} stopOpacity={0.84} />
      <stop offset={0.62} stopColor={mix(C.womb, C.wombDeep, 0.45)} stopOpacity={0.9} />
      <stop offset={1} stopColor={C.wombDeep} stopOpacity={0.95} />
    </linearGradient>
    <linearGradient id="c04w-far" gradientUnits="userSpaceOnUse" x1={0} y1={Y(-420)} x2={0} y2={Y(300)}>
      <stop offset={0} stopColor={mix(C.womb, C.wombDeep, 0.35)} />
      <stop offset={0.45} stopColor={C.wombDeep} />
      <stop offset={1} stopColor={C.bg2} />
    </linearGradient>
    <linearGradient id="c04w-near" gradientUnits="userSpaceOnUse" x1={0} y1={Y(560)} x2={0} y2={Y(1100)}>
      <stop offset={0} stopColor={mix(C.wombDeep, C.bg1, 0.4)} />
      <stop offset={1} stopColor={C.bg0} />
    </linearGradient>
    <radialGradient id="c04w-lobe">
      <stop offset={0} stopColor={C.rose} stopOpacity={0.16} />
      <stop offset={1} stopColor={C.rose} stopOpacity={0} />
    </radialGradient>
    <linearGradient id="c04w-vcore" gradientUnits="userSpaceOnUse" x1={0} y1={Y(0)} x2={0} y2={Y(820)}>
      <stop offset={0} stopColor={C.heart} stopOpacity={0.9} />
      <stop offset={0.5} stopColor={C.heart} stopOpacity={0.32} />
      <stop offset={1} stopColor={C.heart} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="c04w-vglow" gradientUnits="userSpaceOnUse" x1={0} y1={Y(0)} x2={0} y2={Y(820)}>
      <stop offset={0} stopColor={C.heart} stopOpacity={0.3} />
      <stop offset={1} stopColor={C.heart} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="c04w-vhi" gradientUnits="userSpaceOnUse" x1={0} y1={Y(0)} x2={0} y2={Y(820)}>
      <stop offset={0} stopColor={C.peach} stopOpacity={0.6} />
      <stop offset={0.5} stopColor={C.peach} stopOpacity={0.22} />
      <stop offset={1} stopColor={C.peach} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="c04w-main" gradientUnits="userSpaceOnUse" x1={520} y1={0} x2={1300} y2={0}>
      <stop offset={0} stopColor={C.heart} stopOpacity={0.95} />
      <stop offset={0.6} stopColor={C.heart} stopOpacity={0.7} />
      <stop offset={1} stopColor={C.heart} stopOpacity={0.35} />
    </linearGradient>
    <linearGradient id="c04w-gline" gradientUnits="userSpaceOnUse" x1={0} y1={Y(-60)} x2={0} y2={Y(260)}>
      <stop offset={0} stopColor={C.rose} stopOpacity={0.3} />
      <stop offset={1} stopColor={C.rose} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="c04w-glum" gradientUnits="userSpaceOnUse" x1={0} y1={Y(-60)} x2={0} y2={Y(260)}>
      <stop offset={0} stopColor={C.wombDeep} stopOpacity={0.7} />
      <stop offset={1} stopColor={C.wombDeep} stopOpacity={0} />
    </linearGradient>
    <radialGradient id="c04w-epi">
      <stop offset={0} stopColor={C.peach} stopOpacity={0.3} />
      <stop offset={1} stopColor={C.rose} stopOpacity={0.05} />
    </radialGradient>
    <radialGradient id="c04w-glint">
      <stop offset={0} stopColor={C.text} stopOpacity={1} />
      <stop offset={0.3} stopColor={C.peach} stopOpacity={0.6} />
      <stop offset={1} stopColor={C.heart} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="c04w-contact">
      <stop offset={0} stopColor={C.peach} stopOpacity={0.85} />
      <stop offset={0.25} stopColor={C.rose} stopOpacity={0.5} />
      <stop offset={0.6} stopColor={C.womb} stopOpacity={0.18} />
      <stop offset={1} stopColor={C.womb} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="c04w-hole">
      <stop offset={0} stopColor={C.bg0} stopOpacity={1} />
      <stop offset={0.86} stopColor={C.bg0} stopOpacity={1} />
      <stop offset={1} stopColor={C.bg0} stopOpacity={0} />
    </radialGradient>
  </defs>
);
