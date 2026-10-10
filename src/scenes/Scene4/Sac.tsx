import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../theme/colors";
import { dir, mul } from "./geom";
import { PLACENTA_DEG, PLACENTA_HALF } from "./Placenta";

// Amniotic sac in world space (centre 0,0): halo, fluid, caustic light,
// inner glow, membrane edge and a glassy specular. `d` is the live membrane
// outline, so every layer bends together when the foot hits the wall.

export const SacBack: React.FC<{ d: string; R: number; f: number }> = ({ d, R, f }) => {
  const caustics = [0, 1, 2].map((i) => ({
    x: noise2D(`cx${i}`, f * 0.006, i) * R * 0.45,
    y: noise2D(`cy${i}`, i, f * 0.006) * R * 0.45 - R * 0.1,
    r: R * (0.42 + 0.1 * i),
  }));
  // slow light shafts slanting in from the upper left
  const beams = [0, 1, 2].map((i) => {
    const off = (i - 1) * R * 0.42 + noise2D(`bm${i}`, f * 0.005, 0) * R * 0.12;
    const w = R * (0.16 + 0.07 * i);
    const ang = 58 * (Math.PI / 180);
    const ux = Math.cos(ang);
    const uy = Math.sin(ang);
    const nx = -uy;
    const ny = ux;
    const cx = nx * off - ux * R * 1.1;
    const cy = ny * off - uy * R * 1.1;
    const L = R * 2.4;
    return `M${cx + nx * w},${cy + ny * w} L${cx - nx * w},${cy - ny * w} L${cx - nx * w * 1.6 + ux * L},${cy - ny * w * 1.6 + uy * L} L${cx + nx * w * 1.6 + ux * L},${cy + ny * w * 1.6 + uy * L}Z`;
  });
  return (
    <g>
      <defs>
        <linearGradient id="s4-beam" gradientUnits="userSpaceOnUse" x1={-R * 0.6} y1={-R} x2={R * 0.4} y2={R * 0.6}>
          <stop offset={0} stopColor={C.peach} stopOpacity={0.16} />
          <stop offset={1} stopColor={C.peach} stopOpacity={0} />
        </linearGradient>
        <filter id="s4-beamBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <radialGradient id="s4-sacHalo" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={R + 160}>
          <stop offset={(R - 40) / (R + 160)} stopColor={C.rose} stopOpacity={0} />
          <stop offset={(R + 6) / (R + 160)} stopColor={C.rose} stopOpacity={0.2} />
          <stop offset={1} stopColor={C.womb} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="s4-fluid" gradientUnits="userSpaceOnUse" cx={-R * 0.22} cy={-R * 0.3} r={R * 1.35}>
          <stop offset={0} stopColor={C.womb} stopOpacity={0.5} />
          <stop offset={0.45} stopColor={C.wombDeep} stopOpacity={0.55} />
          <stop offset={0.68} stopColor={C.wombDeep} stopOpacity={0.62} />
          <stop offset={0.85} stopColor={C.womb} stopOpacity={0.5} />
          <stop offset={1} stopColor={C.rose} stopOpacity={0.55} />
        </radialGradient>
        <radialGradient id="s4-caustic">
          <stop offset={0} stopColor={C.peach} stopOpacity={0.16} />
          <stop offset={1} stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
        <clipPath id="s4-sacClip">
          <path d={d} />
        </clipPath>
        <filter id="s4-rimBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <circle r={R + 160} fill="url(#s4-sacHalo)" />
      <path d={d} fill="url(#s4-fluid)" />
      <g clipPath="url(#s4-sacClip)">
        {caustics.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="url(#s4-caustic)" />
        ))}
        <g filter="url(#s4-beamBlur)">
          {beams.map((p, i) => (
            <path key={i} d={p} fill="url(#s4-beam)" opacity={0.8 - i * 0.18} />
          ))}
        </g>
        <path d={d} fill="none" stroke={C.rose} strokeWidth={56} opacity={0.32} filter="url(#s4-rimBlur)" />
      </g>
    </g>
  );
};

export const SacFront: React.FC<{ d: string; R: number; flash: number }> = ({ d, R, flash }) => {
  const hl = (a0: number, a1: number, r: number) => {
    const p0 = mul(dir(a0), r);
    const p1 = mul(dir(a1), r);
    return `M${p0.x},${p0.y} A${r},${r} 0 0 1 ${p1.x},${p1.y}`;
  };
  // the membrane line hands over to the placenta's own surface line there
  const wedge = (() => {
    const a0 = PLACENTA_DEG - PLACENTA_HALF + 6;
    const a1 = PLACENTA_DEG + PLACENTA_HALF - 6;
    const p = (r: number, a: number) => mul(dir(a), r);
    const pts = [p(R - 160, a0), p(R + 70, a0), p(R + 70, (a0 + a1) / 2), p(R + 70, a1), p(R - 160, a1)];
    return `M${pts.map((q) => `${q.x},${q.y}`).join(" L")}Z`;
  })();
  return (
    <g>
      <defs>
        <mask id="s4-memMask" maskUnits="userSpaceOnUse" x={-R - 400} y={-R - 400} width={2 * R + 800} height={2 * R + 800}>
          <rect x={-R - 400} y={-R - 400} width={2 * R + 800} height={2 * R + 800} fill="white" />
          <path d={wedge} fill="black" filter="url(#s4-glow)" />
        </mask>
        <linearGradient id="s4-memG" gradientUnits="userSpaceOnUse" x1={-R} y1={-R} x2={R} y2={R}>
          <stop offset={0} stopColor={C.skin} stopOpacity={0.85} />
          <stop offset={0.5} stopColor={C.rose} stopOpacity={0.35} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0.5} />
        </linearGradient>
      </defs>
      <g mask="url(#s4-memMask)">
        <path d={d} fill="none" stroke="url(#s4-memG)" strokeWidth={3} />
        <path d={d} fill="none" stroke={C.gold} strokeWidth={4} opacity={0.22 * flash} />
      </g>
      {/* glassy bubble specular, upper left */}
      <path d={hl(196, 238, R - 24)} fill="none" stroke={C.text} strokeOpacity={0.32} strokeWidth={7} strokeLinecap="round" filter="url(#s4-sh)" />
      <path d={hl(204, 226, R - 24)} fill="none" stroke={C.text} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
      <circle cx={dir(244).x * (R - 24)} cy={dir(244).y * (R - 24)} r={3.5} fill={C.text} opacity={0.5} />
    </g>
  );
};
