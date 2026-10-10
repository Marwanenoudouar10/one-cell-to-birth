import React from "react";
import { interpolateColors } from "remotion";
import { C } from "../../theme/colors";
import { Pt } from "./math";

// Scene3's heart tube seen through the skin (copied, ids prefixed with uid):
// a looped outflow lobe over a round ventricle bulge. `pulse` = beat (0..1,
// first beat may exceed 1), `ignite` = 0 dormant .. 1 lit, `hold` = anticipation.
type Props = { p: Pt; pulse: number; ignite: number; hold: number; uid: string; rot?: number };

export const HeartDefs: React.FC<Omit<Props, "p">> = ({ pulse, ignite, uid }) => {
  const beat = Math.min(1, pulse);
  const body = interpolateColors(ignite * (0.8 + 0.2 * beat), [0, 1], [C.womb, C.heart]);
  const core = interpolateColors(beat * ignite * 0.6, [0, 1], [body, C.rose]);
  return (
    <>
      <radialGradient id={`${uid}-heart`} cx="0.42" cy="0.4" r="0.62">
        <stop offset="0" stopColor={core} />
        <stop offset="0.48" stopColor={body} />
        <stop offset="0.72" stopColor={body} stopOpacity={0.72} />
        <stop offset="1" stopColor={body} stopOpacity={0} />
      </radialGradient>
      <radialGradient id={`${uid}-heart-core`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={C.text} stopOpacity={0.9} />
        <stop offset="0.35" stopColor={C.rose} stopOpacity={0.55} />
        <stop offset="1" stopColor={C.heart} stopOpacity={0} />
      </radialGradient>
    </>
  );
};

export const Heart: React.FC<Props> = ({ p, pulse, ignite, hold, uid, rot = -20 }) => {
  const s = 1 + 0.18 * pulse - 0.06 * hold;
  const op = 0.42 + 0.12 * hold + 0.46 * ignite;
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <ellipse cx={-16} cy={-17} rx={19} ry={15} fill={`url(#${uid}-heart)`} opacity={0.75} />
      <ellipse cx={2} cy={4} rx={36} ry={32} fill={`url(#${uid}-heart)`} />
      <ellipse cx={-4} cy={-3} rx={16} ry={13} fill={`url(#${uid}-heart-core)`} opacity={ignite * (0.1 + 0.5 * Math.min(1, pulse))} />
    </g>
  );
};
