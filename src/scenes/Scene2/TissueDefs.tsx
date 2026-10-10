import React from "react";
import { C } from "../../theme/colors";
import { mix } from "./palette";

// Paint for the womb wall (tissue-local coords: y = 0 at the landing spot).
export const TissueDefs: React.FC = () => (
  <defs>
    <linearGradient id="s2t-body" gradientUnits="userSpaceOnUse" x1={0} y1={-220} x2={0} y2={1150}>
      <stop offset={0} stopColor={mix(C.womb, C.rose, 0.55)} />
      <stop offset={0.13} stopColor={mix(C.womb, C.rose, 0.2)} />
      <stop offset={0.24} stopColor={mix(C.womb, C.wombDeep, 0.45)} />
      <stop offset={0.42} stopColor={C.wombDeep} />
      <stop offset={0.7} stopColor={mix(C.bg2, C.bg1, 0.5)} />
      <stop offset={1} stopColor={C.bg0} />
    </linearGradient>
    <linearGradient id="s2t-front" gradientUnits="userSpaceOnUse" x1={0} y1={-220} x2={0} y2={700}>
      <stop offset={0} stopColor={mix(C.womb, C.rose, 0.55)} stopOpacity={0.9} />
      <stop offset={0.24} stopColor={mix(C.womb, C.rose, 0.2)} stopOpacity={0.88} />
      <stop offset={0.5} stopColor={mix(C.womb, C.wombDeep, 0.5)} stopOpacity={0.95} />
      <stop offset={1} stopColor={C.wombDeep} />
    </linearGradient>
    <linearGradient id="s2t-far" gradientUnits="userSpaceOnUse" x1={0} y1={-380} x2={0} y2={300}>
      <stop offset={0} stopColor={mix(C.womb, C.wombDeep, 0.35)} />
      <stop offset={0.45} stopColor={C.wombDeep} />
      <stop offset={1} stopColor={C.bg2} />
    </linearGradient>
    <linearGradient id="s2t-near" gradientUnits="userSpaceOnUse" x1={0} y1={400} x2={0} y2={900}>
      <stop offset={0} stopColor={mix(C.wombDeep, C.bg1, 0.4)} />
      <stop offset={1} stopColor={C.bg0} />
    </linearGradient>
    <radialGradient id="s2t-lobe">
      <stop offset={0} stopColor={C.rose} stopOpacity={0.16} />
      <stop offset={1} stopColor={C.rose} stopOpacity={0} />
    </radialGradient>
    <linearGradient id="s2t-vcore" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={330}>
      <stop offset={0} stopColor={C.heart} stopOpacity={0.9} />
      <stop offset={0.55} stopColor={C.heart} stopOpacity={0.3} />
      <stop offset={1} stopColor={C.heart} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="s2t-vglow" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={330}>
      <stop offset={0} stopColor={C.heart} stopOpacity={0.28} />
      <stop offset={1} stopColor={C.heart} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="s2t-vhi" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={330}>
      <stop offset={0} stopColor={C.peach} stopOpacity={0.6} />
      <stop offset={0.5} stopColor={C.peach} stopOpacity={0.25} />
      <stop offset={1} stopColor={C.peach} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="s2t-gline" gradientUnits="userSpaceOnUse" x1={0} y1={-60} x2={0} y2={240}>
      <stop offset={0} stopColor={C.rose} stopOpacity={0.3} />
      <stop offset={1} stopColor={C.rose} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="s2t-glum" gradientUnits="userSpaceOnUse" x1={0} y1={-60} x2={0} y2={240}>
      <stop offset={0} stopColor={C.wombDeep} stopOpacity={0.7} />
      <stop offset={1} stopColor={C.wombDeep} stopOpacity={0} />
    </linearGradient>
    <radialGradient id="s2t-epi">
      <stop offset={0} stopColor={C.peach} stopOpacity={0.3} />
      <stop offset={1} stopColor={C.rose} stopOpacity={0.05} />
    </radialGradient>
    <radialGradient id="s2t-glint">
      <stop offset={0} stopColor={C.text} stopOpacity={1} />
      <stop offset={0.3} stopColor={C.peach} stopOpacity={0.6} />
      <stop offset={1} stopColor={C.heart} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="s2t-contact">
      <stop offset={0} stopColor={C.peach} stopOpacity={0.85} />
      <stop offset={0.25} stopColor={C.rose} stopOpacity={0.5} />
      <stop offset={0.6} stopColor={C.womb} stopOpacity={0.18} />
      <stop offset={1} stopColor={C.womb} stopOpacity={0} />
    </radialGradient>
  </defs>
);
