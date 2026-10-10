// <SoundWaves from dir progress />: concentric tapered arcs travelling from a
// source OUTSIDE the womb into it ("the baby can hear your voice"). Arcs are
// crisp and bright outside the sac and turn soft and muffled inside it.
//   from      {x,y} world px of the source (may be off-screen, e.g. {x:-80,y:380})
//   dir       degrees, direction of travel (e.g. 35 = toward lower right)
//   progress  0..1 the wave train: 0 = first arc just born, 1 = last arc gone
//   count     arcs in the train (default 5)
//   spacing   px between arcs (default 66)
//   length    px an arc travels before fading out (default 1000)
//   spread    half-angle of each arc in degrees (default 30)
//   width     arc thickness px (default 14)
//   color     default C.gold (warm voice); C.peach is softer
//   sac       {cx,cy,r,aspect?} to muffle inside; omitted = the parent
//             <AmnioticSac> if rendered as its child, else no muffling
//   opacity, depth, seed
// Best as a CHILD of <AmnioticSac> placed before your baby layer: arcs then
// pass behind the baby and under the membrane line, clipped to the live sac.
// Make the sac react: ripples={soundRipples({from,dir,start,end}, sacShape)}
// and drive progress={soundProgress(frame, start, end)} (linear).
import React from "react";
import { C } from "../../theme/colors";
import { WombLayer } from "./Camera";
import { Pt, SacShape, crescent, useUid } from "./geom";
import { useSac } from "./sacContext";
import { arcFade, arcRadii, trainDefaults, voice } from "./sound";

export type SoundWavesProps = {
  from: Pt;
  dir: number;
  progress: number;
  count?: number;
  spacing?: number;
  length?: number;
  spread?: number;
  width?: number;
  color?: string;
  sac?: SacShape;
  opacity?: number;
  depth?: number;
  seed?: string;
};

export const SoundWaves: React.FC<SoundWavesProps> = (p) => {
  const id = useUid("snd");
  const ctx = useSac();
  const { length, seed } = trainDefaults(p);
  const spread = p.spread ?? 30;
  const width = p.width ?? 14;
  const color = p.color ?? C.gold;
  if (p.progress <= 0 || p.progress >= 1) return null;
  const arcs = arcRadii(p, p.progress)
    .map((rk, k) => ({ rk, k, a: arcFade(rk, length) * voice(seed, k) }))
    .filter((a) => a.a > 0.01);
  if (arcs.length === 0) return null;
  const shape = p.sac ?? ctx?.shape;
  const sacD = ctx && !p.sac ? ctx.d : shape ? ellipseD(shape) : null;
  const draw = (muffled: boolean) =>
    arcs.map(({ rk, k, a }) => {
      const w = width * (0.75 + 0.45 * voice(seed, k + 9)) * (1 - 0.35 * (rk / length));
      const a0 = p.dir - spread;
      const a1 = p.dir + spread;
      return (
        <g key={k} opacity={a * (muffled ? 0.8 : 1)}>
          <path d={crescent(p.from, rk, a0, a1, w * 2.8)} fill={color} opacity={0.22} filter={`url(#${id}-${muffled ? "mb" : "gb"})`} />
          <path d={crescent(p.from, rk, a0, a1, w)} fill={muffled ? C.peach : color} opacity={muffled ? 0.6 : 0.9} filter={muffled ? `url(#${id}-ms)` : undefined} />
          {!muffled && <path d={crescent(p.from, rk - w * 0.18, a0 + 4, a1 - 4, w * 0.32)} fill={C.text} opacity={0.55} />}
        </g>
      );
    });
  return (
    <WombLayer depth={p.depth ?? 1} opacity={p.opacity ?? 1}>
      <defs>
        <filter id={`${id}-gb`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
        <filter id={`${id}-mb`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={18} />
        </filter>
        <filter id={`${id}-ms`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={2.5} />
        </filter>
        {sacD && (
          <>
            <clipPath id={`${id}-in`}>
              <path d={sacD} />
            </clipPath>
            <clipPath id={`${id}-out`}>
              <path d={`M-4000,-4000H5000V6000H-4000Z ${sacD}`} clipRule="evenodd" />
            </clipPath>
          </>
        )}
      </defs>
      {sacD ? (
        <>
          <g clipPath={`url(#${id}-out)`}>{draw(false)}</g>
          <g clipPath={`url(#${id}-in)`}>{draw(true)}</g>
        </>
      ) : (
        draw(false)
      )}
    </WombLayer>
  );
};

const ellipseD = (s: SacShape) => {
  const rx = s.r;
  const ry = s.r * (s.aspect ?? 1);
  return `M${s.cx - rx},${s.cy} a${rx},${ry} 0 1 0 ${2 * rx},0 a${rx},${ry} 0 1 0 ${-2 * rx},0Z`;
};
