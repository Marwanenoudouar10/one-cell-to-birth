import React from "react";
import { interpolateColors } from "remotion";
import { C } from "../../../theme/colors";
import { C05_END } from "./beats";
import { EmbryoRig } from "./rig";
import { TUBE_LINE, tubeOutline, tubePoint } from "./tubeShape";

// The single, looped heart TUBE (no chambers), drawn over the kit's cardiac
// bulge so it reads as a tube: dim and unlit at the start (C05's hand-off),
// warm light flows in from the inflow end, then on every beat a squeeze runs
// along it from inflow to outflow, pinching the tube as it goes.
// Clipped to the embryo's silhouette: it is only ever seen through the skin.
type Props = {
  rig: EmbryoRig;
  fill: number; // 0..1 warm light flowing in
  ignite: number; // 0 dormant .. 1 lit
  pulse: number;
  glow: number;
  hold: number;
  squeeze: { u: number; a: number } | null;
  grow: number; // 0 = exactly C05's dormant tube (our frame 0) .. 1 = full widths, no drop
  swell: number; // 0 .. 1: the loop fattens into the kit's heart bulge as it hands over
};

const BodyClip: React.FC<{ rig: EmbryoRig }> = ({ rig }) => (
  <clipPath id="c06-tube-body">
    <path d={rig.body.outline} transform={rig.toWorld} />
    {[...rig.body.belly, ...rig.body.blobs].map((e, i) => (
      <ellipse key={i} rx={e.rx * 0.97} ry={e.ry * 0.97} transform={`${rig.toWorld} translate(${e.x} ${e.y}) rotate(${e.rot})`} />
    ))}
  </clipPath>
);

export const HeartTube: React.FC<Props> = ({ rig, fill, ignite, pulse, glow, hold, squeeze, grow, swell }) => {
  const { a, k, bulge, heartRot } = rig;
  // C05's dormant tube sits at the heart anchor + drop, 1.4x the kit bulge; the drop
  // settles to the anchor as the disc curls (the bulge forms round the anchor)
  const T = C05_END.tube;
  const s = k * Math.max(0.72, bulge) * (1 + 0.12 * Math.min(1.4, pulse) - 0.05 * hold) * 0.95 * T.grow * (1 - 0.12 * swell);
  const at = { x: a.heart.x + T.drop.x * (1 - grow), y: a.heart.y + T.drop.y * (1 - grow) };
  const beat = Math.min(1, pulse);
  // the light flowing in is already warm heart-red; the kit's bulge only ignites on the first beat
  // (vivid C.heart once full: at phone size the tube must read as red light, not rose)
  const tint = interpolateColors(Math.min(1, (0.78 + 0.22 * ignite) * (0.9 + 0.1 * beat)), [0, 1], [C.womb, C.heart]);
  const core = interpolateColors(beat * ignite, [0, 1], [tint, C.peach]);
  const lines = Math.max(0, 1 - 2.5 * swell); // strokes go first, so only the red mass swells
  const d = tubeOutline(squeeze, grow, swell);
  // dormant colours: exactly C05's at grow 0; as the disc curls they warm to a dim
  // rose, so the unlit loop under the head reads as a tube, not a dark opening
  const warm = 0.5 * grow;
  const dim0 = interpolateColors(warm, [0, 1], [C.womb, C.rose]);
  const dorm = interpolateColors(0.55 - 0.45 * warm, [0, 1], [C.womb, C.wombDeep]);
  const dim1 = interpolateColors(warm, [0, 1], [C.wombDeep, C.womb]);
  // the bright front of the warm light pouring in (only while it flows)
  const front = tubePoint(fill);
  const frontA = fill > 0.001 && fill < 0.999 ? Math.min(1, fill / 0.08) * Math.min(1, (1 - fill) / 0.15) : 0;
  const B = 0.22; // squeeze highlight length (fraction of the tube)
  const band = (len: number) => ({
    pathLength: 1,
    strokeDasharray: `${len} 3`,
    strokeDashoffset: len - (squeeze?.u ?? 0) * (1 + len),
    fill: "none",
    strokeLinecap: "round" as const,
  });
  return (
    <g clipPath="url(#c06-tube-body)">
      <defs>
        <BodyClip rig={rig} />
      </defs>
      <g transform={`translate(${at.x} ${at.y}) rotate(${heartRot}) scale(${s})`}>
        <defs>
          <filter id="c06-tube-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="c06-tube-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.9" />
          </filter>
          <filter id="c06-tube-dormant" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={T.blur} />
          </filter>
          <radialGradient id="c06-tube-dim" gradientUnits="userSpaceOnUse" cx={-10} cy={-12} r={52}>
            <stop offset="0" stopColor={dim0} />
            <stop offset="0.55" stopColor={dorm} />
            <stop offset="1" stopColor={dim1} />
          </radialGradient>
          <radialGradient id="c06-tube-lit" gradientUnits="userSpaceOnUse" cx={-6} cy={-6} r={44}>
            <stop offset="0" stopColor={core} />
            <stop offset="0.3" stopColor={tint} />
            <stop offset="0.75" stopColor={tint} />
            <stop offset="1" stopColor={interpolateColors(0.35, [0, 1], [tint, C.wombDeep])} />
          </radialGradient>
          <mask id="c06-tube-fill" maskUnits="userSpaceOnUse" x={-80} y={-80} width={160} height={160}>
            <path d={TUBE_LINE} pathLength={1} strokeDasharray={`${fill} 3`} fill="none" stroke="#fff" strokeWidth={34} strokeLinecap="round" />
          </mask>
          <radialGradient id="c06-tube-front" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={C.text} stopOpacity={0.95} />
            <stop offset="0.3" stopColor={C.peach} stopOpacity={0.7} />
            <stop offset="1" stopColor={C.heart} stopOpacity={0} />
          </radialGradient>
          <clipPath id="c06-tube-clip">
            <path d={d} />
          </clipPath>
        </defs>
        {/* dormant tube, exactly as C05 leaves it: an unlit wine-dark loop seen
            through the skin, lit faintly from the upper left */}
        <g filter="url(#c06-tube-dormant)" opacity={1 - 0.4 * ignite}>
          <path d={d} fill="url(#c06-tube-dim)" opacity={0.85} />
          <path d={TUBE_LINE} fill="none" stroke={C.wombDeep} strokeOpacity={0.55 * (1 - 0.6 * grow)} strokeWidth={3.2} strokeLinecap="round" transform="translate(0.8 1.4)" />
          <path d={TUBE_LINE} pathLength={1} strokeDasharray="0.55 3" strokeDashoffset={-0.2} fill="none" stroke={C.rose} strokeOpacity={0.55} strokeWidth={1.8} strokeLinecap="round" transform="translate(-1.8 -2.4)" />
        </g>
        {/* warm light flows in from the inflow end */}
        {fill > 0.001 && (
          <g mask="url(#c06-tube-fill)">
            <path d={d} fill={C.heart} opacity={0.55 + 0.45 * glow} filter="url(#c06-tube-glow)" transform="scale(1.15)" />
            <path d={d} fill="url(#c06-tube-lit)" opacity={0.92 + 0.08 * ignite} filter="url(#c06-tube-soft)" />
            {/* a darker same-hue edge keeps the loop crisp against the skin */}
            <path d={d} fill="none" stroke={C.wombDeep} strokeOpacity={0.4 * lines} strokeWidth={1.1} />
            <path d={TUBE_LINE} fill="none" stroke={core} strokeOpacity={(0.3 + 0.4 * ignite) * lines} strokeWidth={3} strokeLinecap="round" transform="translate(-1.6 -2.4)" />
            {/* glossy highlight on the lit side (key light upper-left) */}
            <path d={TUBE_LINE} pathLength={1} strokeDasharray="0.5 3" strokeDashoffset={-0.28} fill="none" stroke={C.text} strokeOpacity={(0.25 + 0.25 * Math.min(1, pulse)) * lines} strokeWidth={1.6} strokeLinecap="round" transform="translate(-2.6 -3.4)" />
          </g>
        )}
        {frontA > 0.01 && <circle cx={front.x} cy={front.y} r={17} fill="url(#c06-tube-front)" opacity={frontA} />}
        {/* the squeeze: a warm bright band racing inflow -> outflow inside the tube */}
        {squeeze && (
          <g opacity={Math.min(1, squeeze.a)}>
            <path d={TUBE_LINE} {...band(B)} stroke={C.rose} strokeOpacity={0.6} strokeWidth={24} filter="url(#c06-tube-glow)" />
            <g clipPath="url(#c06-tube-clip)">
              <path d={TUBE_LINE} {...band(B * 0.6)} stroke={C.peach} strokeOpacity={0.75} strokeWidth={20} filter="url(#c06-tube-soft)" />
              <path d={TUBE_LINE} {...band(B * 0.35)} stroke={C.text} strokeOpacity={0.45 * lines} strokeWidth={3} transform="translate(-1 -1.5)" />
            </g>
          </g>
        )}
      </g>
    </g>
  );
};
