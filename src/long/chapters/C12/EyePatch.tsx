// A feathered skin patch over the kit's eye, so the macro eye can take over
// at close range. It re-paints exactly what the kit paints there (the head's
// radial skin gradient, rose tint, inner edge glow, cheek blush and brow
// light, same params as src/shared/fetus Defs/Fetus/Face), so fading it in
// is invisible except where the kit's thick lid line disappears.
// Renders in rig space (inside the kit's own `fr.css` transform).
import React from "react";
import { C } from "../../../theme/colors";
import { FetusGeom, OutFrameLike } from "./kitGeo";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Props = { geo: FetusGeom; fr: OutFrameLike; opacity: number; headXf: string };

export const EyePatch: React.FC<Props> = ({ geo, fr, opacity, headXf }) => {
  if (opacity <= 0.002) return null;
  const { g, lm, p } = geo;
  const V = (x: number, y: number, k: number) => {
    const v = fr.vecToRig({ x, y });
    return { x: v.x * k, y: v.y * k };
  };
  const hc = geo.headO;
  const H = 250 * geo.headS;
  const c = { x: hc.x + V(-0.1, -0.16, H).x, y: hc.y + V(-0.1, -0.16, H).y };
  const fo = { x: hc.x + V(-0.18, -0.26, H).x, y: hc.y + V(-0.18, -0.26, H).y };
  const smile = Math.max(0, p.expression);
  const { x: ex, y: ey } = lm.eye;
  const big = { x: hc.x - 600, y: hc.y - 600, width: 1200, height: 1200 };
  return (
    <g opacity={opacity}>
      <defs>
        <radialGradient id="c12-headG" gradientUnits="userSpaceOnUse" cx={c.x} cy={c.y} r={0.8 * H} fx={fo.x} fy={fo.y}>
          <stop offset={0} stopColor={C.skin} />
          <stop offset={0.32} stopColor={C.skin} />
          <stop offset={0.72} stopColor={C.peach} />
          <stop offset={1} stopColor={C.skinShade} />
        </radialGradient>
        <radialGradient id="c12-blush">
          <stop offset={0} stopColor={C.rose} stopOpacity={0.5} />
          <stop offset={1} stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c12-feather">
          <stop offset={0} stopColor="white" />
          <stop offset={0.62} stopColor="white" />
          <stop offset={1} stopColor="black" />
        </radialGradient>
        <filter id="c12-glow9" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={9} />
        </filter>
        <clipPath id="c12-headClip">
          <path d={geo.head} />
        </clipPath>
        <mask id="c12-patchM" maskUnits="userSpaceOnUse" {...big}>
          <rect {...big} fill="black" />
          <g transform={headXf}>
            <ellipse cx={ex - 5} cy={ey + 0.5} rx={37} ry={31} fill="url(#c12-feather)" />
          </g>
        </mask>
      </defs>
      <g clipPath="url(#c12-headClip)" mask="url(#c12-patchM)">
        <path d={geo.head} fill="url(#c12-headG)" />
        <path d={geo.head} fill={C.rose} opacity={g.pink * 0.85} />
        <path d={geo.head} fill="none" stroke={C.rose} strokeWidth={30} filter="url(#c12-glow9)" opacity={0.18 + 0.32 * g.translucency} />
        <g transform={headXf}>
          <ellipse cx={lm.cheek.x - 6} cy={lm.cheek.y - 3 * smile} rx={30 + 8 * g.fat} ry={18 + 6 * g.fat} fill="url(#c12-blush)"
            opacity={0.5 + 0.5 * g.fat + 0.3 * smile} />
          <ellipse cx={ex + 10} cy={ey - 24} rx={30} ry={12} fill={C.skin} opacity={0.5} filter="url(#c12-glow9)" />
        </g>
      </g>
    </g>
  );
};

// soft brow twitch (random face movement): the brow light lifts for a moment
// and a faint forehead fold appears above it. Head-local, on top of the kit.
export const BrowTwitch: React.FC<{ eye: { x: number; y: number }; amt: number }> = ({ eye, amt }) => {
  if (amt <= 0.01) return null;
  const { x: ex, y: ey } = eye;
  return (
    <g opacity={amt}>
      <ellipse cx={ex + 9} cy={ey - 27} rx={24} ry={9} fill={C.skin} opacity={0.55} filter="url(#c12-soft3)" />
      <path d={`M${ex - 8},${lerp(ey - 32, ey - 35, amt)} Q${ex + 6},${ey - 39} ${ex + 20},${ey - 33}`} fill="none" stroke={C.skinShade}
        strokeOpacity={0.55} strokeWidth={2.4} strokeLinecap="round" filter="url(#c12-soft1)" />
    </g>
  );
};
