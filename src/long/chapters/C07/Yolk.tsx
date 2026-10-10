import React from "react";
import { noise2D } from "@remotion/noise";
import { YolkSac, YolkStalk, sacEdge } from "../../../shared/embryo";
import { Rig, yolkAt } from "./rig";
import { Ring, ringAlpha, ringRadius } from "./world/beat";
import { Pt } from "./world/geometry";

// The kit's yolk sac on its stalk, as C06 draws it (src/long/chapters/C06/Yolk.tsx):
// pushed outward a little by each passing pulse ring, the stalk swaying on C06's clock
// (`sway` 0 = still, as at both hand-offs). Base position: rig.ts yolkAt.
type Props = { f: number; rig: Rig; glow: number; heart: Pt; rs: Ring[]; sway: number };

export const Yolk: React.FC<Props> = ({ f, rig, glow, heart, rs, sway }) => {
  const y = yolkAt(f, rig);
  const ax = y.x - heart.x;
  const ay = y.y - heart.y;
  const dist = Math.hypot(ax, ay) || 1;
  let push = 0;
  for (const r of rs) push += 5 * r.strength * ringAlpha(r) * Math.exp(-((dist - ringRadius(r)) ** 2) / (2 * 30 * 30));
  const p = { x: y.x + (ax / dist) * push, y: y.y + (ay / dist) * push, r: y.r };
  const from = rig.a.stalk;
  const sw = noise2D("s3stalk", (f + 240) * 0.015, 4) * 12 * sway;
  return (
    <g>
      {y.stalk > 0 && <YolkStalk from={from} to={sacEdge(p, from)} scale={y.stalk} glow={glow} sway={sw} />}
      <YolkSac x={p.x} y={p.y} r={p.r} glow={glow} id="c07" />
    </g>
  );
};
