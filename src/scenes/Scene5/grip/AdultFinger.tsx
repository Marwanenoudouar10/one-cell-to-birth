import React from "react";
import { C } from "../../../theme/colors";
import { smoothOpen } from "../geometry";
import { AY, fist, fistLines, indexFinger, KNUCKLE, nail, wrinkles } from "./adultShapes";

const BIG = { x: -1400, y: -900, width: 3800, height: 2600 };

const Paths: React.FC<{ ds: string[]; fill: string }> = ({ ds, fill }) => (
  <>
    {ds.map((d, i) => (
      <path key={i} d={d} fill={fill} />
    ))}
  </>
);

// The grown-up's hand, seen from the back: the index finger (nail facing us)
// offered to the baby, the other fingers curled into a loose fist at the
// right edge. Lit warm from above; sinks into shadow toward the frame edge.
export const AdultFinger: React.FC<{ tipX: number }> = ({ tipX: t }) => {
  const index = indexFinger(t);
  const back = fist(t);
  const n = nail(t);
  return (
    <g>
      <defs>
        <clipPath id="s5-afClip">
          <path d={index} />
        </clipPath>
        <clipPath id="s5-fistClip">
          {back.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <linearGradient id="s5-afShade" gradientUnits="userSpaceOnUse" x1={0} y1={AY - 84} x2={0} y2={AY + 84}>
          <stop offset="0" stopColor={C.skin} />
          <stop offset="0.24" stopColor={C.skin} />
          <stop offset="0.52" stopColor={C.peach} />
          <stop offset="0.82" stopColor={C.skinShade} />
          <stop offset="1" stopColor={C.womb} />
        </linearGradient>
        <linearGradient id="s5-fistShade" gradientUnits="userSpaceOnUse" x1={0} y1={AY + 60} x2={0} y2={AY + 440}>
          <stop offset="0" stopColor={C.peach} />
          <stop offset="0.35" stopColor={C.skinShade} />
          <stop offset="1" stopColor={C.wombDeep} />
        </linearGradient>
        <linearGradient id="s5-afDepth" gradientUnits="userSpaceOnUse" x1={t + 680} y1={0} x2={t + 1200} y2={0}>
          <stop offset="0" stopColor={C.wombDeep} stopOpacity={0} />
          <stop offset="1" stopColor={C.wombDeep} stopOpacity={0.75} />
        </linearGradient>
        <linearGradient id="s5-nailBed" gradientUnits="userSpaceOnUse" x1={t + 10} y1={0} x2={t + 130} y2={0}>
          <stop offset="0" stopColor={C.peach} />
          <stop offset="0.5" stopColor={C.skin} />
          <stop offset="1" stopColor={C.rose} />
        </linearGradient>
      </defs>

      {/* soft shadow of the whole hand on the baby's palm / the room */}
      <g opacity={0.45} transform="translate(10 26)" filter="url(#s5-blur18)">
        <Paths ds={[index, ...back]} fill={C.wombDeep} />
      </g>

      {/* curled fingers + back of the hand, a step further back in shadow */}
      <g clipPath="url(#s5-fistClip)">
        <rect {...BIG} fill={C.peach} />
        <g transform="translate(0 6)">
          <Paths ds={back} fill="url(#s5-fistShade)" />
        </g>
        <ellipse cx={t + KNUCKLE[0]} cy={KNUCKLE[1]} rx={70} ry={34} fill={C.text} opacity={0.3} filter="url(#s5-blur10)" />
        {fistLines(t).map((d, i) =>
          i === 0 ? (
            <path key={i} d={d} fill="none" stroke={C.wombDeep} strokeWidth={10} strokeLinecap="round" opacity={0.55} filter="url(#s5-blur6)" />
          ) : (
            <path key={i} d={d} fill="none" stroke={C.skinShade} strokeWidth={3.5} strokeLinecap="round" opacity={0.7} />
          ),
        )}
        {/* crevice where the curled fingers tuck under the index */}
        <path d={indexFinger(t)} fill="none" stroke={C.wombDeep} strokeWidth={22} opacity={0.5} transform="translate(0 6)" filter="url(#s5-blur10)" />
        <rect {...BIG} fill={C.wombDeep} opacity={0.12} />
        <rect {...BIG} fill="url(#s5-afDepth)" />
      </g>

      {/* the index finger */}
      <g transform="translate(10 18)" opacity={0.5} filter="url(#s5-blur10)">
        <path d={index} fill={C.wombDeep} />
      </g>
      <g clipPath="url(#s5-afClip)">
        <rect {...BIG} fill={C.gold} />
        <rect {...BIG} fill={C.text} opacity={0.45} />
        <g transform="translate(0 7)">
          <path d={index} fill="url(#s5-afShade)" />
        </g>
        {/* warm bounce light along the underside */}
        <path d={index} fill="none" stroke={C.rose} strokeOpacity={0.4} strokeWidth={26} transform="translate(0 7)" filter="url(#s5-blur6)" />
        {/* soft specular along the top of the finger */}
        <path
          d={smoothOpen([[t + 150, AY - 50], [t + 330, AY - 54], [t + 600, AY - 60]])}
          fill="none"
          stroke={C.text}
          strokeOpacity={0.32}
          strokeWidth={14}
          strokeLinecap="round"
          filter="url(#s5-blur6)"
        />
        <ellipse cx={t + 470} cy={AY - 6} rx={60} ry={48} fill={C.skinShade} opacity={0.22} filter="url(#s5-blur10)" />
        {wrinkles(t).map((w, i) => (
          <path key={i} d={w.d} fill="none" stroke={C.skinShade} strokeWidth={w.w} strokeLinecap="round" opacity={w.o} />
        ))}
        {/* nail */}
        <path d={n.plate} fill={C.skinShade} opacity={0.5} transform="translate(2 4)" filter="url(#s5-blur6)" />
        <path d={n.plate} fill="url(#s5-nailBed)" />
        <path d={n.plate} fill={C.rose} opacity={0.16} />
        <path d={n.freeEdge} fill={C.text} opacity={0.72} />
        <path d={n.lunula} fill={C.text} opacity={0.3} />
        <path d={n.plate} fill="none" stroke={C.skinShade} strokeWidth={3} opacity={0.6} />
        <path d={n.cuticle} fill="none" stroke={C.peach} strokeWidth={7} strokeLinecap="round" opacity={0.9} />
        <path d={n.cuticle} fill="none" stroke={C.skinShade} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} transform="translate(3 0)" />
        <path d={n.shine} fill="none" stroke={C.text} strokeWidth={8} strokeLinecap="round" opacity={0.7} style={{ filter: "blur(1.5px)" }} />
        <rect {...BIG} fill="url(#s5-afDepth)" />
      </g>
    </g>
  );
};
