import React from "react";
import { C } from "../../../theme/colors";
import { Pt } from "./geometry";
import { RING_LIFE, Ring, ringAlpha, ringRadius } from "./motion";

// Copied from src/scenes/Scene3/Rings.tsx. Added for C06: HeartHalo glows while
// the tube fills (`fill`), and `vis` fades both out under C07 (rule 5).
type RingProps = { heart: Pt; rs: Ring[]; sacD: string; glow: number; first: number; vis: number };

// One pulse ring per lub (and a fainter twin per dub): a thin bright crest
// with a short soft wake behind it, radiating through the fluid behind the
// embryo and clipped to the membrane.
export const PulseRings: React.FC<RingProps> = ({ heart, rs, sacD, glow, first, vis }) => {
  // The first beat throws a warm bloom that spreads out with its ring.
  const bloomR = 170 + 260 * (1 - first);
  return (
    <g opacity={vis}>
      <defs>
        <clipPath id="c06-rings-ring-clip">
          <path d={sacD} />
        </clipPath>
        <radialGradient id="c06-rings-flash" gradientUnits="userSpaceOnUse" cx={heart.x} cy={heart.y} r={bloomR}>
          <stop offset="0" stopColor={C.heart} stopOpacity={0.7} />
          <stop offset="0.35" stopColor={C.rose} stopOpacity={0.32} />
          <stop offset="0.75" stopColor={C.rose} stopOpacity={0.08} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
        {rs.map((r, i) => {
          const R = ringRadius(r);
          const life = r.age / RING_LIFE;
          // the very first lub launches a thicker, brighter wave
          const band = (28 + 46 * life) * (r.first ? 1.7 : 1);
          const edge = (7 + 5 * life) * (r.first ? 1.9 : 1);
          const a = Math.min(1, ringAlpha(r) * r.strength * 0.85);
          const o = (px: number) => Math.max(0, Math.min(1, 1 - px / R));
          return (
            <radialGradient key={i} id={`c06-rings-ring-${i}`} gradientUnits="userSpaceOnUse" cx={heart.x} cy={heart.y} r={R}>
              <stop offset={o(band)} stopColor={C.heart} stopOpacity={0} />
              <stop offset={o(band * 0.4)} stopColor={C.heart} stopOpacity={a * 0.22} />
              <stop offset={o(edge)} stopColor={C.rose} stopOpacity={a * 0.85} />
              <stop offset={o(edge * 0.4)} stopColor={C.peach} stopOpacity={a} />
              <stop offset="1" stopColor={C.rose} stopOpacity={0} />
            </radialGradient>
          );
        })}
      </defs>
      <g clipPath="url(#c06-rings-ring-clip)">
        <circle cx={heart.x} cy={heart.y} r={bloomR} fill="url(#c06-rings-flash)" opacity={0.85 * first * Math.min(1, glow)} />
        {rs.map((r, i) => (
          <circle key={i} cx={heart.x} cy={heart.y} r={ringRadius(r)} fill={`url(#c06-rings-ring-${i})`} />
        ))}
      </g>
    </g>
  );
};

// Light blooming out of the heart, over the embryo (screen-blended layer).
// Kept soft in the very centre so the heart itself stays a saturated red
// instead of washing out to pink-white.
type HaloProps = { heart: Pt; glow: number; pulse: number; ignite: number; hold: number; first: number; fill: number; vis: number; flare: number };

export const HeartHalo: React.FC<HaloProps> = ({
  heart,
  glow,
  pulse,
  ignite,
  hold,
  first,
  fill,
  vis,
  flare,
}) => {
  const R = 150 * (1 + 0.4 * glow);
  const fr = 34 * (1 + 0.4 * first);
  return (
    <g opacity={vis}>
      <defs>
        <radialGradient id="c06-rings-halo-g" gradientUnits="userSpaceOnUse" cx={heart.x} cy={heart.y} r={R}>
          <stop offset="0" stopColor={C.heart} stopOpacity={0.3} />
          <stop offset="0.22" stopColor={C.heart} stopOpacity={0.55} />
          <stop offset="0.5" stopColor={C.heart} stopOpacity={0.2} />
          <stop offset="1" stopColor={C.heart} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c06-rings-flare" gradientUnits="userSpaceOnUse" cx={heart.x} cy={heart.y} r={fr}>
          <stop offset="0" stopColor={C.text} stopOpacity={0.9} />
          <stop offset="0.3" stopColor={C.rose} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.heart} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={heart.x} cy={heart.y} r={R} fill="url(#c06-rings-halo-g)" opacity={Math.min(1, 0.55 * fill * (1 - 0.6 * ignite) + 0.3 * ignite + 0.4 * hold + 0.7 * glow)} />
      <circle cx={heart.x} cy={heart.y} r={fr} fill="url(#c06-rings-flare)" opacity={flare * Math.min(1, pulse) * (0.22 + 0.45 * first)} />
    </g>
  );
};
