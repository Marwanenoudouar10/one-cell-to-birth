// Back half of the amniotic sac (drawn behind the baby): chorion halo, the
// fuzzy chorionic villi fringe (early weeks), the fluid volume (warmth 0 =
// dark glassy Scene3, 0.4 = wine-rose Scene4, 1 = glowing Scene5), caustics, a shade
// for volume and a soft inner rim glow. SVG <g>, world px. Internal.
import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../theme/colors";
import { Pt, smooth, useUid } from "./geom";
import { SacClip, SacState, aspectTf } from "./sacContext";

const fringe = (sac: SacState, seed: string) => {
  const { cx, cy } = sac.shape;
  const t = sac.frame * 0.006;
  const M = 200;
  const pts: Pt[] = [];
  for (let i = 0; i < M; i++) {
    const th = (i / M) * Math.PI * 2;
    const ca = Math.cos(th);
    const sa = Math.sin(th);
    const bump = 0.5 + 0.5 * noise2D(`${seed}v`, ca * 6 + t, sa * 6);
    const r = sac.rAt(th) + 8 + 20 * bump * (0.65 + 0.35 * noise2D(`${seed}v2`, ca * 2, sa * 2 + t));
    pts.push({ x: cx + ca * r, y: cy + sa * r });
  }
  return smooth(pts);
};

export const SacBack: React.FC<{ sac: SacState; villi: number; seed: string }> = ({ sac, villi, seed }) => {
  const id = useUid("sacb");
  const { cx, cy, r: R } = sac.shape;
  const w = sac.warmth;
  const tf = aspectTf(sac.shape);
  // three teaser fluids blended by warmth: 0 Scene3, MID Scene4, 1 Scene5
  const MID = 0.4;
  const wc = Math.max(0, 1 - w / MID);
  const ww = Math.max(0, (w - MID) / (1 - MID));
  const wm = 1 - wc - ww;
  const f = sac.frame;
  const caustics = [0, 1, 2].map((i) => ({
    x: cx + noise2D(`${seed}cx${i}`, f * 0.006, i) * R * 0.45,
    y: cy + noise2D(`${seed}cy${i}`, i, f * 0.006) * R * 0.45 - R * 0.1,
    r: R * (0.42 + 0.1 * i),
  }));
  return (
    <g>
      <defs>
        <SacClip id={`${id}-clip`} sac={sac} />
        <radialGradient id={`${id}-halo`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={R + 150} gradientTransform={tf}>
          <stop offset={(R - 30) / (R + 150)} stopColor={C.rose} stopOpacity={0} />
          <stop offset={(R + 8) / (R + 150)} stopColor={C.rose} stopOpacity={0.24 + 0.1 * w} />
          <stop offset="1" stopColor={C.womb} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-villi`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={R + 40} gradientTransform={tf}>
          <stop offset={R / (R + 40)} stopColor={C.rose} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.womb} stopOpacity={0.05} />
        </radialGradient>
        {/* warmth 0: dark glassy fluid (teaser Scene3) */}
        <radialGradient id={`${id}-cool`} gradientUnits="userSpaceOnUse" cx={cx - 40} cy={cy - 60} r={R + 40} gradientTransform={tf}>
          <stop offset="0" stopColor={C.rose} stopOpacity={0.1} />
          <stop offset="0.55" stopColor={C.womb} stopOpacity={0.12} />
          <stop offset="0.86" stopColor={C.rose} stopOpacity={0.22} />
          <stop offset="0.96" stopColor={C.peach} stopOpacity={0.42} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0.55} />
        </radialGradient>
        {/* warmth 0.4: wine-rose fluid (teaser Scene4) */}
        <radialGradient id={`${id}-mid`} gradientUnits="userSpaceOnUse" cx={cx - R * 0.22} cy={cy - R * 0.3} r={R * 1.35} gradientTransform={tf}>
          <stop offset="0" stopColor={C.womb} stopOpacity={0.5} />
          <stop offset="0.45" stopColor={C.wombDeep} stopOpacity={0.55} />
          <stop offset="0.68" stopColor={C.wombDeep} stopOpacity={0.62} />
          <stop offset="0.85" stopColor={C.womb} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0.55} />
        </radialGradient>
        {/* warmth 1: warm, glowing fluid (teaser Scene5) */}
        <radialGradient id={`${id}-warm`} gradientUnits="userSpaceOnUse" cx={cx - R * 0.1} cy={cy - R * 0.25} r={R * 1.17} gradientTransform={tf}>
          <stop offset="0" stopColor={C.peach} stopOpacity={0.3} />
          <stop offset="0.55" stopColor={C.rose} stopOpacity={0.2} />
          <stop offset="0.84" stopColor={C.rose} stopOpacity={0.32} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0.62} />
        </radialGradient>
        <radialGradient id={`${id}-shade`} gradientUnits="userSpaceOnUse" cx={cx + R * 0.2} cy={cy + R * 0.9} r={R * 1.15}>
          <stop offset="0" stopColor={C.bg0} stopOpacity={0.45} />
          <stop offset="1" stopColor={C.bg0} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-caus`}>
          <stop offset="0" stopColor={C.peach} stopOpacity={0.16} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-rim`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <ellipse cx={cx} cy={cy} rx={R + 150} ry={(R + 150) * (sac.shape.aspect ?? 1)} fill={`url(#${id}-halo)`} />
      {villi > 0.01 && <path d={fringe(sac, seed)} fill={`url(#${id}-villi)`} opacity={0.75 * villi} />}
      {wc > 0.01 && <path d={sac.d} fill={C.bg1} opacity={0.72 * wc} />}
      {wc > 0.01 && <path d={sac.d} fill={`url(#${id}-cool)`} opacity={wc} />}
      {wm > 0.01 && <path d={sac.d} fill={`url(#${id}-mid)`} opacity={wm} />}
      {ww > 0.01 && <path d={sac.d} fill={`url(#${id}-warm)`} opacity={ww} />}
      <g clipPath={`url(#${id}-clip)`}>
        {caustics.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={`url(#${id}-caus)`} />
        ))}
        <circle cx={cx + R * 0.2} cy={cy + R * 0.9} r={R * 1.15} fill={`url(#${id}-shade)`} opacity={1 - 0.5 * w} />
        <path d={sac.d} fill="none" stroke={C.rose} strokeWidth={56} opacity={0.3 + 0.1 * w} filter={`url(#${id}-rim)`} />
      </g>
    </g>
  );
};
