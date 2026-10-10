// Near arm: the embryo kit's limb recipe (same geometry, fills and soft root fade as
// src/shared/embryo/Limb.tsx). Through the fade from C07 it draws the kit's own hand
// plate (C07's END paddle); then our hero <Hand> takes over (`mix` 0 -> 1), with its own
// contact shadows. Limb-local coords: origin = root on the flank.
import React from "react";
import { C } from "../../../theme/colors";
import { limbGeo } from "../../../shared/embryo/Limb";
import { ramp } from "../../../shared/embryo/math";
import { Limb as LimbStage } from "../../../shared/embryo/stage";
import { Hand, HandState } from "./Hand";

type Local = { c: { x: number; y: number }; ang: number; r: number };
type Props = { L: LimbStage; uid: string; paddle: number; hand: HandState; local: Local; mix: number };

export const Arm: React.FC<Props> = ({ L, uid, paddle, hand, local, mix }) => {
  const id = `${uid}-arm`;
  const g = limbGeo(L, paddle);
  const fade = 0.425 * 54;
  const big = L.len * 2 + 60;
  const r = local.r;
  const kit = 1 - mix;
  const palmK = 1 - 0.28 * (1 - L.web) * L.digits;
  const plate = `rotate(${g.endDir} ${g.palm.x} ${g.palm.y})`;
  const ours = `translate(${local.c.x} ${local.c.y}) rotate(${local.ang})`;
  return (
    <g transform={`scale(${L.grow})`}>
      <defs>
        <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={fade} y2={0}>
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#fff" stopOpacity={1} />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={-big} y={-big} width={big * 2} height={big * 2}>
          <rect x={-big} y={-big} width={big * 2} height={big * 2} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        {/* contact shadow on the body under the arm and hand */}
        <g transform={`translate(1.5 ${L.width * 0.35})`} opacity={0.4} filter={`url(#${uid}-budsh)`}>
          <path d={g.body} fill={C.womb} />
          {kit > 0.01 && <ellipse cx={g.palm.x} cy={g.palm.y} rx={g.palmR * palmK} ry={g.palmR * 0.82 * palmK} transform={plate} fill={C.womb} opacity={kit} />}
          {mix > 0.01 && <ellipse cx={0.45 * r} cy={0} rx={r * 1.55} ry={r * 1.05} transform={ours} fill={C.womb} opacity={mix} />}
        </g>
        {/* the hand lifts off the body: deeper soft shadow down-right of it */}
        {mix > 0.01 && (
          <ellipse
            cx={0.55 * r}
            cy={0}
            rx={r * 1.7}
            ry={r * 1.15}
            transform={`translate(${local.c.x + 2.5} ${local.c.y + 3.5}) rotate(${local.ang})`}
            fill={C.wombDeep}
            opacity={0.35 * mix}
            filter={`url(#${uid}-halo)`}
          />
        )}
        <path d={g.body} fill={`url(#${uid}-bud)`} />
        {kit > 0.01 && (
          <g opacity={kit}>
            {/* the kit's plate: soft crease where it meets the stalk, then the plate */}
            <ellipse cx={g.palm.x} cy={g.palm.y} rx={g.palmR * palmK * 1.12} ry={g.palmR * 0.9 * palmK} transform={plate} fill={C.womb} opacity={0.22 * ramp(paddle, 0.3, 1)} filter={`url(#${uid}-budsh)`} />
            <ellipse cx={g.palm.x} cy={g.palm.y} rx={g.palmR * palmK} ry={g.palmR * 0.82 * palmK} transform={plate} fill={`url(#${uid}-bud)`} />
          </g>
        )}
        {mix > 0.01 && (
          <g opacity={mix}>
            {/* soft crease where the hand meets the forearm */}
            <ellipse cx={-0.25 * r} cy={0} rx={r * 0.86} ry={r * 0.8} transform={ours} fill={C.womb} opacity={0.2 * ramp(paddle, 0.3, 1)} filter={`url(#${uid}-budsh)`} />
            <g transform={`${ours} scale(${r})`}>
              <Hand {...hand} />
            </g>
          </g>
        )}
        <path d={g.hi} fill={`url(#${uid}-soft)`} opacity={0.75} />
      </g>
    </g>
  );
};
