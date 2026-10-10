// Showcase: edge cases (frames 360-419 of WombShowcase).
//   360-389  late look, camera zoom 1.4 onto the placenta, first big beat + kick
//   390-419  part="back"/"front" split with art between, standalone Placenta
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AmnioticSac, Camera, CaptionShade, Cord, FluidSpecks, Placenta, WOMB_LOOKS, WombBackdrop, WombLayer, heartbeatRipples, placentaPort } from "..";
import { StandIn, belly, heartPt } from "./StandIn";

export const ZoomTest: React.FC = () => {
  const f = useCurrentFrame();
  const L = WOMB_LOOKS.late;
  const pose = { x: 560, y: 900, s: 1.95, rot: 168 };
  const port = placentaPort(L.sac, L.placenta.at, L.placenta.size);
  const ripples = [
    ...heartbeatRipples(f, { ...heartPt(pose), start: 0, bpm: 140 }),
    { x: 540 - 300, y: 850 + 330, t: 8, kind: "kick" as const, strength: 1.4 },
  ];
  return (
    <Camera zoom={1.4} x={port.x - 120} y={port.y + 120}>
      <WombBackdrop {...L.backdrop} />
      <AmnioticSac {...L.sac} ripples={ripples}>
        <Placenta {...L.placenta} />
        <Cord from={belly(pose)} width={L.cordWidth} slack={0.35} side={-1} />
        <WombLayer>
          <StandIn pose={pose} id="sc-zoom" />
        </WombLayer>
      </AmnioticSac>
      <CaptionShade mode="multiply" top={0.8} />
    </Camera>
  );
};

export const SplitTest: React.FC = () => {
  const L = WOMB_LOOKS.early;
  const pose = { x: 520, y: 880, s: 0.75, rot: 8 };
  return (
    <Camera>
      <WombBackdrop {...L.backdrop} parallax={0} />
      <AmnioticSac {...L.sac} part="back" />
      <FluidSpecks seed="split" count={40} />
      <WombLayer>
        <StandIn pose={pose} id="sc-split" />
      </WombLayer>
      <AmnioticSac {...L.sac} part="front" />
      {/* standalone placenta + cord on an imaginary second sac, no context */}
      <AbsoluteFill style={{ transform: "translate(0px, 0px)" }}>
        <Placenta cx={540} cy={1700} r={260} at={-90} size={0.8} />
        <Cord from={{ x: 700, y: 1500 }} to={placentaPort({ cx: 540, cy: 1700, r: 260 }, -90, 0.8)} width={10} />
      </AbsoluteFill>
      <FluidSpecks cx={540} cy={1700} r={260} seed="standalone" count={30} />
    </Camera>
  );
};
