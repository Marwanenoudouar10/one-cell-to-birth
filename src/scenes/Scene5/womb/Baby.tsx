import React from "react";
import { C } from "../../../theme/colors";
import { circle } from "../geometry";
import * as S from "./babyShapes";
import { Cord, Placenta } from "./Cord";

const BIG = { x: -600, y: -600, width: 2400, height: 3200 };

const Fill: React.FC<{ shapes: string[]; fill: string }> = ({ shapes, fill }) => (
  <>
    {shapes.map((d, i) => (
      <path key={i} d={d} fill={fill} />
    ))}
  </>
);

// One body part: crisp rim crescent on the back edge, warm skin gradient,
// inner glow along the silhouette, shading and optional birth-light rim.
const Part: React.FC<{ id: string; shapes: string[]; tone?: number; glow: number; shadows?: string[] }> = ({
  id,
  shapes,
  tone = 0,
  glow,
  shadows,
}) => (
  <g>
    <defs>
      <clipPath id={`s5-c-${id}`}>
        {shapes.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </clipPath>
      <mask id={`s5-m-${id}`} maskUnits="userSpaceOnUse" {...BIG}>
        <rect {...BIG} fill="white" />
        <g filter="url(#s5-wblur14)">
          <Fill shapes={shapes} fill="black" />
        </g>
      </mask>
    </defs>
    <g clipPath={`url(#s5-c-${id})`}>
      <rect {...BIG} fill={C.rose} />
      <g transform="translate(9 -5)">
        <Fill shapes={shapes} fill="url(#s5-skin)" />
      </g>
      {shadows && (
        <g transform="translate(-12 16)" filter="url(#s5-wblur10)" opacity={0.55}>
          <Fill shapes={shadows} fill={C.skinShade} />
        </g>
      )}
      <rect {...BIG} fill="url(#s5-shade)" />
      {tone > 0 && <rect {...BIG} fill={C.womb} opacity={tone} />}
      <rect {...BIG} fill={C.rose} opacity={0.55} mask={`url(#s5-m-${id})`} />
      {glow > 0 && <rect {...BIG} fill="url(#s5-birthRim)" opacity={glow} />}
    </g>
  </g>
);

const Face: React.FC = () => {
  const [ex, ey] = S.EAR;
  const [nx, ny] = S.NOSTRIL;
  const [cx, cy] = S.CHEEK;
  return (
    <g>
      <circle cx={cx} cy={cy} r={60} fill="url(#s5-blush)" />
      <path d={S.BROW} fill="none" stroke={C.skinShade} strokeOpacity={0.45} strokeWidth={5} strokeLinecap="round" />
      <path d={S.LID} fill="none" stroke={C.text} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
      <path d={S.EYE} fill="none" stroke={C.wombDeep} strokeOpacity={0.75} strokeWidth={5.5} strokeLinecap="round" />
      <path d={S.MOUTH} fill="none" stroke={C.womb} strokeOpacity={0.7} strokeWidth={5} strokeLinecap="round" />
      <circle cx={nx} cy={ny} r={4.5} fill={C.womb} opacity={0.55} />
      <g transform={`translate(${ex} ${ey}) rotate(20)`}>
        <ellipse cx={0} cy={0} rx={28} ry={41} fill={C.skinShade} opacity={0.6} />
        <ellipse cx={-6} cy={-2} rx={19} ry={31} fill={C.skin} opacity={0.85} />
        <path d="M-2,-22 C10,-14 10,12 -2,20" fill="none" stroke={C.skinShade} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
      </g>
    </g>
  );
};

export type BabyPose = { dx: number; dy: number; rot: number; scale: number; glow: number; womb: number };

// The full-term baby, curled head-down and cramped inside the sac.
export const Baby: React.FC<{ pose: BabyPose; frame: number }> = ({ pose, frame }) => {
  const shin = [...S.NEAR_SHIN, ...S.TOES.map(([x, y, r]) => circle(x, y, r))];
  const all = [...S.BODY, ...S.NEAR_THIGH, ...shin, ...S.FAR_LEG];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
      <defs>
        <filter id="s5-wblur14" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="s5-wblur10" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <radialGradient id="s5-skin" gradientUnits="userSpaceOnUse" cx={610} cy={700} r={640}>
          <stop offset="0" stopColor={C.skin} />
          <stop offset="0.45" stopColor={C.skin} />
          <stop offset="0.78" stopColor={C.peach} />
          <stop offset="1" stopColor={C.skinShade} />
        </radialGradient>
        <linearGradient id="s5-shade" gradientUnits="userSpaceOnUse" x1={650} y1={620} x2={220} y2={1200}>
          <stop offset="0" stopColor={C.skinShade} stopOpacity={0} />
          <stop offset="0.55" stopColor={C.skinShade} stopOpacity={0.2} />
          <stop offset="1" stopColor={C.womb} stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id="s5-birthRim" gradientUnits="userSpaceOnUse" x1={0} y1={1250} x2={0} y2={880}>
          <stop offset="0" stopColor={C.text} stopOpacity={1} />
          <stop offset="0.3" stopColor={C.gold} stopOpacity={0.7} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </linearGradient>
        <radialGradient id="s5-placenta">
          <stop offset="0" stopColor={C.peach} />
          <stop offset="0.45" stopColor={C.rose} />
          <stop offset="1" stopColor={C.womb} />
        </radialGradient>
        <radialGradient id="s5-blush">
          <stop offset="0" stopColor={C.rose} stopOpacity={0.45} />
          <stop offset="1" stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* drawn mirrored: faces right with the placenta on the upper-right wall,
          matching Scene4's fetus for the crossfade (gradients are pre-mirrored
          so the light still comes from the upper left) */}
      <g transform="translate(1080 0) scale(-1 1)">
      <g
        transform={`translate(${pose.dx} ${pose.dy}) translate(560 860) rotate(${pose.rot}) scale(${pose.scale}) translate(-560 -860)`}
      >
        <g opacity={0.5} filter="url(#s5-wblur14)">
          <Fill shapes={all} fill={C.rose} />
        </g>
        <g opacity={pose.womb}>
          <Placenta />
        </g>
        <Part id="far" shapes={S.FAR_LEG} tone={0.22} glow={pose.glow * 0.5} />
        <Part id="body" shapes={S.BODY} glow={pose.glow} shadows={[...S.NEAR_THIGH, ...shin, ...S.NEAR_ARM]} />
        <Face />
        <g opacity={pose.womb}>
          <Cord frame={frame} />
        </g>
        <Part id="shin" shapes={shin} glow={pose.glow * 0.6} shadows={S.NEAR_THIGH} />
        <Part id="thigh" shapes={S.NEAR_THIGH} glow={pose.glow * 0.7} shadows={S.NEAR_ARM} />
        <g transform={`rotate(${Math.sin(frame * 0.045) * 2.2} 660 906)`}>
          <Part id="arm" shapes={S.NEAR_ARM} glow={pose.glow} />
          {S.FIST_LINES.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={C.skinShade} strokeWidth={3.5} strokeLinecap="round" opacity={0.55} />
          ))}
        </g>
        <circle cx={S.KNEE_HI[0]} cy={S.KNEE_HI[1]} r={30} fill="url(#s5-blush)" opacity={0.5} />
      </g>
      </g>
    </svg>
  );
};
