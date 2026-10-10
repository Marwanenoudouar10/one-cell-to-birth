// Showcase: the three preset looks (early / mid / late), each a short idle shot.
import React from "react";
import { useCurrentFrame } from "remotion";
import { AmnioticSac, Camera, CaptionShade, Cord, FluidSpecks, LightShafts, Placenta, WOMB_LOOKS, WombBackdrop, WombLayer, heartbeatRipples } from "..";
import { Caption } from "./Caption";
import { Pose, StandIn, belly, heartPt } from "./StandIn";

const POSES: Record<keyof typeof WOMB_LOOKS, Pose> = {
  early: { x: 520, y: 880, s: 0.75, rot: 8 },
  mid: { x: 500, y: 870, s: 1.25, rot: 4 },
  late: { x: 560, y: 900, s: 1.95, rot: 168 },
};

const TEXT = {
  early: "Week eight: a tiny world.",
  mid: "Week sixteen: room to move.",
  late: "Week thirty-six: it gets cosy.",
};

export const Look: React.FC<{ look: keyof typeof WOMB_LOOKS }> = ({ look }) => {
  const f = useCurrentFrame();
  const L = WOMB_LOOKS[look];
  const pose = POSES[look];
  const ripples = heartbeatRipples(f, { ...heartPt(pose), start: 4, bpm: 150, strength: 0.55, boostFirst: false });
  return (
    <Camera zoom={1 + f * 0.0006}>
      <WombBackdrop {...L.backdrop} />
      <AmnioticSac {...L.sac} ripples={ripples}>
        <LightShafts {...L.shafts} />
        <FluidSpecks seed={`${look}far`} />
        <Placenta {...L.placenta} />
        <Cord from={belly(pose)} width={L.cordWidth} slack={look === "late" ? 0.35 : 0.55} side={look === "late" ? -1 : 1} />
        <WombLayer>
          <StandIn pose={pose} id={`sc-${look}`} />
        </WombLayer>
        <FluidSpecks seed={`${look}near`} layer="near" count={10} />
      </AmnioticSac>
      <FluidSpecks layer="lens" count={5} seed={`${look}lens`} />
      <CaptionShade mode={look === "late" ? "multiply" : "dark"} />
      <Caption text={TEXT[look]} at={0} />
    </Camera>
  );
};
