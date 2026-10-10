import React from "react";
import { noise2D } from "@remotion/noise";
import { YolkSac, YolkStalk, sacEdge } from "../../../shared/embryo";
import { Pt, add, mul, sub } from "./geometry";
import { Ring, ringAlpha, ringRadius } from "./motion";
import { EmbryoRig } from "./rig";

// Scene3's yolk sac on its stalk (src/scenes/Scene3/YolkSac.tsx). The art is
// the embryo kit's copy of it (same gradients, vessels and sagging cord), so it
// can sit where C05 left it (big, under the disc) and drift out to Scene3's
// spot (806, 902, r 42) as the embryo grows. The motion is Scene3's: a slow
// noise drift, a living sway in the cord, and a small outward nudge from each
// passing pulse ring. `alive` = 0 at the hand-offs (still, like C05 and C07).
type Props = { frame: number; rig: EmbryoRig; glow: number; heart: Pt; rs: Ring[]; alive: number };

export const yolkAt = ({ frame, rig, heart, rs, alive }: Omit<Props, "glow">) => {
  const y = rig.yolk;
  const p0 = {
    x: y.x + noise2D("s3yx", frame * 0.01, 0) * 6 * alive,
    y: y.y + noise2D("s3yy", 0, frame * 0.01) * 8 * alive,
  };
  const away = sub(p0, heart);
  const dist = Math.hypot(away.x, away.y) || 1;
  let push = 0;
  for (const r of rs) push += 5 * r.strength * ringAlpha(r) * Math.exp(-((dist - ringRadius(r)) ** 2) / (2 * 30 * 30));
  return { ...add(p0, mul(away, push / dist)), r: y.r, stalk: y.stalk };
};

export const Yolk: React.FC<Props> = (p) => {
  const y = yolkAt(p);
  const from = p.rig.a.yolkStalk;
  const sway = noise2D("s3stalk", p.frame * 0.015, 4) * 12 * p.alive;
  return (
    <g>
      {y.stalk > 0 && <YolkStalk from={from} to={sacEdge(y, from)} scale={y.stalk} glow={p.glow} sway={sway} />}
      <YolkSac x={y.x} y={y.y} r={y.r} glow={p.glow} id="c06" />
    </g>
  );
};
