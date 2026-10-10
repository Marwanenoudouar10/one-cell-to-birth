import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { blob, Pt, smoothOpen } from "../geometry";

export const SAC = { cx: 540, cy: 860, r: 400 };

const sacPath = (frame: number, extra = 0) => {
  const breathe = 1 + 0.009 * Math.sin((frame / 84) * Math.PI * 2 + 0.6);
  return blob(SAC.cx, SAC.cy, (t) => (SAC.r + extra) * breathe * (1 + 0.012 * noise2D("s5-sac", Math.cos(t) * 1.2 + frame * 0.008, Math.sin(t) * 1.2)), 32);
};

const arc = (r: number, a0: number, a1: number, n = 12): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [SAC.cx + r * Math.cos(a), SAC.cy + r * Math.sin(a)] as Pt;
  });

// Dark warm cavity the sac floats in (sits behind the womb walls' lips).
export const Cavity: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", opacity }}>
    <defs>
      <radialGradient id="s5-cavity" gradientUnits="userSpaceOnUse" cx={540} cy={820} r={470}>
        <stop offset="0" stopColor={C.womb} />
        <stop offset="0.7" stopColor={C.wombDeep} />
        <stop offset="1" stopColor={C.bg2} />
      </radialGradient>
    </defs>
    <circle cx={540} cy={860} r={470} fill="url(#s5-cavity)" />
  </svg>
);

// Amniotic sac, back half: the glowing fluid volume behind the baby.
export const SacBack: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
    <defs>
      <radialGradient id="s5-sacFill" gradientUnits="userSpaceOnUse" cx={500} cy={760} r={470}>
        <stop offset="0" stopColor={C.peach} stopOpacity={0.3} />
        <stop offset="0.55" stopColor={C.rose} stopOpacity={0.2} />
        <stop offset="0.84" stopColor={C.rose} stopOpacity={0.32} />
        <stop offset="1" stopColor={C.rose} stopOpacity={0.62} />
      </radialGradient>
    </defs>
    <path d={sacPath(frame, 26)} fill={C.rose} opacity={0.18} style={{ filter: "blur(22px)" }} />
    <path d={sacPath(frame)} fill="url(#s5-sacFill)" />
  </svg>
);

// Amniotic sac, front half: membrane sheen and rim light over the baby.
export const SacFront: React.FC<{ frame: number }> = ({ frame }) => {
  const d = sacPath(frame);
  const shimmer = 0.75 + 0.25 * Math.sin(frame * 0.05);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
      <defs>
        <radialGradient id="s5-sacSheen" gradientUnits="userSpaceOnUse" cx={540} cy={860} r={404}>
          <stop offset="0.78" stopColor={C.rose} stopOpacity={0} />
          <stop offset="0.96" stopColor={C.rose} stopOpacity={0.22} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <path d={d} fill={C.rose} opacity={0.05} />
      <path d={d} fill="url(#s5-sacSheen)" />
      <path d={d} fill="none" stroke={C.rose} strokeOpacity={0.35} strokeWidth={22} style={{ filter: "blur(9px)" }} />
      <path d={d} fill="none" stroke={C.peach} strokeOpacity={0.85} strokeWidth={3} />
      <path d={smoothOpen(arc(368, 196, 252))} fill="none" stroke={C.text} strokeOpacity={0.42 * shimmer} strokeWidth={11} strokeLinecap="round" style={{ filter: "blur(1.5px)" }} />
      <path d={smoothOpen(arc(368, 260, 270, 3))} fill="none" stroke={C.text} strokeOpacity={0.4 * shimmer} strokeWidth={9} strokeLinecap="round" />
      <path d={smoothOpen(arc(380, 20, 70))} fill="none" stroke={C.peach} strokeOpacity={0.22} strokeWidth={7} strokeLinecap="round" />
    </svg>
  );
};
