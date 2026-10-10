// <LightShafts />: soft beams of warm light slanting into the womb from the
// upper left (the house light direction, matching the sac specular), slowly
// swaying and breathing. Inside an <AmnioticSac> they are clipped to the sac
// by default (light seen through the fluid), outside they wash the cavity.
//   from       {x,y} world px the beams fan out from (default {x:200,y:320})
//   angle      degrees of the central beam (default 60 = down-right)
//   fan        degrees between neighbouring beams (default 8)
//   count      beams (default 3)
//   intensity  0..1.5 (default 1)
//   length     px (default 1100)
//   width      multiplier on beam widths (default 1)
//   color      default C.skin (any palette C colour)
//   clip       "sac" (default when inside a sac) | "none"
//   depth      parallax plane (default 1)
//   blend      CSS mix-blend-mode (default "screen")
//   seed
import React from "react";
import { noise2D } from "@remotion/noise";
import { useCurrentFrame } from "remotion";
import { C } from "../../theme/colors";
import { WombLayer } from "./Camera";
import { Pt, useUid } from "./geom";
import { SacClip, useSac } from "./sacContext";

export type LightShaftsProps = {
  from?: Pt;
  angle?: number;
  fan?: number;
  count?: number;
  intensity?: number;
  length?: number;
  width?: number;
  color?: string;
  clip?: "sac" | "none";
  depth?: number;
  blend?: React.CSSProperties["mixBlendMode"];
  seed?: string;
};

export const LightShafts: React.FC<LightShaftsProps> = ({
  from = { x: 200, y: 320 },
  angle = 60,
  fan = 8,
  count = 3,
  intensity = 1,
  length = 1100,
  width = 1,
  color = C.skin,
  clip,
  depth = 1,
  blend = "screen",
  seed = "wb-ls",
}) => {
  const f = useCurrentFrame();
  const sac = useSac();
  const id = useUid("shaft");
  const useClip = (clip ?? (sac ? "sac" : "none")) === "sac" && !!sac;
  if (intensity <= 0.001) return null;
  const rays = Array.from({ length: count }, (_, i) => {
    const k = i - (count - 1) / 2;
    const sway = noise2D(`${seed}a`, f * 0.008, i) * 4;
    const a = ((angle + k * fan + sway) * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const nx = -dy;
    const ny = dx;
    const centre = i === Math.round((count - 1) / 2);
    const w0 = (centre ? 26 : 16) * width;
    const w1 = (centre ? 120 : 76) * width;
    const o = (centre ? 0.75 : 0.5) * (0.75 + 0.25 * noise2D(`${seed}o`, f * 0.02, i));
    const p = [
      [from.x + nx * w0, from.y + ny * w0],
      [from.x + dx * length + nx * w1, from.y + dy * length + ny * w1],
      [from.x + dx * length - nx * w1, from.y + dy * length - ny * w1],
      [from.x - nx * w0, from.y - ny * w0],
    ];
    return { pts: p.map((q) => q.join(",")).join(" "), o };
  });
  const a0 = (angle * Math.PI) / 180;
  // blur only where it can be seen: the sac's box when clipped, else the canvas
  const region = useClip
    ? (() => {
        const { cx, cy, r, aspect } = sac!.shape;
        return { x: cx - r - 60, y: cy - r * aspect - 60, width: 2 * r + 120, height: 2 * r * aspect + 120 };
      })()
    : { x: -200, y: -200, width: 1480, height: 2320 };
  return (
    <WombLayer depth={depth} blend={blend}>
      <defs>
        {useClip && <SacClip id={`${id}-clip`} sac={sac!} />}
        <linearGradient
          id={`${id}-g`}
          gradientUnits="userSpaceOnUse"
          x1={from.x}
          y1={from.y}
          x2={from.x + Math.cos(a0) * length}
          y2={from.y + Math.sin(a0) * length}
        >
          <stop offset="0" stopColor={color} stopOpacity={0.42 * intensity} />
          <stop offset="0.55" stopColor={color} stopOpacity={0.16 * intensity} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <filter id={`${id}-b`} filterUnits="userSpaceOnUse" {...region}>
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g clipPath={useClip ? `url(#${id}-clip)` : undefined}>
        <g filter={`url(#${id}-b)`}>
          {rays.map((r, i) => (
            <polygon key={i} points={r.pts} fill={`url(#${id}-g)`} opacity={r.o} />
          ))}
        </g>
      </g>
    </WombLayer>
  );
};
