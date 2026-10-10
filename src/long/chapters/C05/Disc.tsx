import React from "react";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { BEATS as B } from "./beats";
import { DiscGeo } from "./geo";
import { BAND_FILLS, DiscDefs, LAYER_DIM, LAYER_LIGHT, mix } from "./DiscDefs";
import { SideCells } from "./SideCells";
import { Surface } from "./Surface";
import { View } from "./view";

// The hand-drawn germ disc: soft halo, side-wall bands (endo, meso, ecto) and
// the dorsal face under the kit's rim-light filter, then the cells of the side
// cut, the surface details and the per-layer glow (light-up sweep + dimming
// of the layers that are not speaking).

const ONSET = [B.endoGlow, B.mesoGlow, B.ectoGlow];
const CLIPS: [string, string, string] = ["c05-clip-b0", "c05-clip-b1", "c05-clip-b2"];
const DIM_K = [0.55, 0.62, 0.86]; // how far each silent layer sinks (ecto is the brightest)

type Props = { v: View; g: DiscGeo; f: number; glow: [number, number, number]; phase: number; opacity: number };

export const Disc: React.FC<Props> = ({ v, g, f, glow, phase, opacity }) => {
  if (opacity <= 0.001) return null;
  const sweeps = ONSET.map((t) => ({
    x: tween(f, t - 2, t + 22, [v.cx - v.A - 160, v.cx + v.A + 160], EASE.inOut),
    o: tween(f, t - 2, t + 4, [0, 1]) * tween(f, t + 14, t + 22, [1, 0]),
  }));
  return (
    <g opacity={opacity} style={{ isolation: "isolate" }}>
      <DiscDefs v={v} />
      <defs>
        <clipPath id="c05-clip-top">
          <path d={g.top} />
        </clipPath>
        {g.bands.map((d, k) => (
          <clipPath key={k} id={CLIPS[k]}>
            <path d={d} />
          </clipPath>
        ))}
        {sweeps.map((s, k) => (
          <linearGradient key={k} id={`c05-sweep-${k}`} gradientUnits="userSpaceOnUse" x1={s.x - 150} y1={0} x2={s.x + 150} y2={0}>
            <stop offset="0" stopColor={C.text} stopOpacity={0} />
            <stop offset="0.5" stopColor={C.text} stopOpacity={0.75} />
            <stop offset="1" stopColor={C.text} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {/* translucent glow the disc throws into the fluid */}
      <g filter="url(#c05-halo)" opacity={0.5 + 0.2 * v.side}>
        <path d={g.sil} fill={mix(C.peach, C.cellCyan, 0.6)} />
      </g>
      <g filter="url(#c05-rimfx)">
        {g.bands.map((d, k) => (
          <path key={k} d={d} fill={`url(#${BAND_FILLS[k]})`} />
        ))}
        <path d={g.top} fill="url(#c05-top)" />
      </g>
      <SideCells v={v} f={f} clips={CLIPS} glow={glow} />
      {g.bands.map((d, k) => {
        // layers that are not speaking sink into a darker tone of their OWN hue (multiply)
        const dim = phase * (1 - glow[k]) * DIM_K[k];
        return (
          <g key={k}>
            {glow[k] > 0.01 && <path d={d} fill={LAYER_LIGHT[k]} opacity={0.34 * glow[k]} />}
            {sweeps[k].o > 0.01 && <path d={d} fill={`url(#c05-sweep-${k})`} opacity={sweeps[k].o * glow[k]} />}
            <path d={d} fill={LAYER_DIM[k]} opacity={dim} style={{ mixBlendMode: "multiply" }} />
          </g>
        );
      })}
      {/* hairline where two layers meet: the stack reads crisply in the side cut */}
      <g opacity={0.5 * v.side}>
        {g.bands.slice(0, 2).map((d, k) => (
          <path key={k} d={d} fill="none" stroke={C.text} strokeOpacity={0.22} strokeWidth={1.4} />
        ))}
      </g>
      <g clipPath="url(#c05-clip-top)">
        <Surface v={v} f={f} />
        <path d={g.top} fill={LAYER_DIM[2]} opacity={phase * (1 - glow[2]) * DIM_K[2]} style={{ mixBlendMode: "multiply" }} />
      </g>
    </g>
  );
};
