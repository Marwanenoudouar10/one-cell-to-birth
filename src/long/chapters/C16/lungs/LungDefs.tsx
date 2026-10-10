import React from "react";
import { C } from "../../../../theme/colors";
import { LOBES, TRACHEA } from "./lungTree";

// Gradients, clips and the windpipe fade for the lungs insert.
export const LungDefs: React.FC = () => (
  <defs>
    <radialGradient id="c16-sacFluid" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stopColor={C.rose} stopOpacity={0.7} />
      <stop offset="0.5" stopColor={C.womb} />
      <stop offset="1" stopColor={C.wombDeep} />
    </radialGradient>
    <radialGradient id="c16-sacAir" cx="0.38" cy="0.32" r="0.75">
      <stop offset="0" stopColor={C.skin} />
      <stop offset="0.45" stopColor={C.peach} />
      <stop offset="0.85" stopColor={C.rose} />
      <stop offset="1" stopColor={C.womb} />
    </radialGradient>
    <radialGradient id="c16-lobeFluid" gradientUnits="userSpaceOnUse" cx={420} cy={640} r={720}>
      <stop offset="0" stopColor={C.womb} stopOpacity={0.42} />
      <stop offset="0.55" stopColor={C.wombDeep} stopOpacity={0.55} />
      <stop offset="1" stopColor={C.wombDeep} stopOpacity={0.85} />
    </radialGradient>
    <radialGradient id="c16-lobeAir" gradientUnits="userSpaceOnUse" cx={430} cy={620} r={760}>
      <stop offset="0" stopColor={C.peach} stopOpacity={0.6} />
      <stop offset="0.5" stopColor={C.rose} stopOpacity={0.45} />
      <stop offset="1" stopColor={C.womb} stopOpacity={0.45} />
    </radialGradient>
    <clipPath id="c16-lobeClipL">
      <path d={LOBES.L} />
    </clipPath>
    <clipPath id="c16-lobeClipR">
      <path d={LOBES.R} />
    </clipPath>
    {/* the windpipe rises out of the dark: faded out toward the top */}
    <linearGradient id="c16-trachFade" gradientUnits="userSpaceOnUse" x1={0} y1={TRACHEA.top[1] - 10} x2={0} y2={TRACHEA.top[1] + 190}>
      <stop offset="0" stopColor="#000" />
      <stop offset="1" stopColor="#fff" />
    </linearGradient>
    <mask id="c16-trachMask" maskUnits="userSpaceOnUse" x={380} y={0} width={320} height={760}>
      <rect x={380} y={0} width={320} height={760} fill="url(#c16-trachFade)" />
    </mask>
  </defs>
);
