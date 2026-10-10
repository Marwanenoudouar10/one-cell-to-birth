// C15 "Her voice" (W37 -> W39). Head-down and cramped, the baby hears two
// voices: her mother's warm rose-gold arcs roll in from her side and the face
// takes on a gentle glow as it settles; a stranger's cooler cyan arcs come
// from the other side and get only a small stir, no glow; her arcs return and
// the baby settles, calm. Ends framed like Scene5's START for C16.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { heartbeat } from "../../../lib/ease";
import { Fetus } from "../../../shared/fetus";
import { AmnioticSac, Camera, CaptionShade, CordShape, FluidSpecks, LightShafts, Placenta, WombBackdrop, WombLayer, placentaPort } from "../../../shared/womb";
import { FaceGlow } from "./Glow";
import { babyAt, cameraAt, earGlow, faceGlow, settle2, voiceRipples } from "./motion";
import { BABY, BACK, C14_END, KIT_CLOCK, LOOK, MUM1, MUM2, SAC, SEEDS, STRANGER, kit } from "./shot";
import { VoiceWaves } from "./Waves";

const RIPPLES = voiceRipples();
const PORT = placentaPort(SAC, LOOK.placenta.at, LOOK.placenta.size);

export const C15: React.FC = () => {
  const f = useCurrentFrame();
  const b = babyAt(f);
  const cam = cameraAt(f);
  const glow = faceGlow(f);
  const ear = earGlow(f);
  // C14's cord, in the fetus cord slot (under the head and arm), same seed + clock
  const cord = (
    <CordShape from={b.a.navel} to={{ x: PORT.x - BABY.x, y: PORT.y - BABY.y }} {...C14_END.cord} width={LOOK.cordWidth} seed={SEEDS.cord} frame={kit(f)} />
  );
  const head = { ...b.w(b.a.headCenter), r: b.a.headRadius * 2.1 };
  return (
    <AbsoluteFill>
      {/* kit components run on C14's clock (see shot.ts) */}
      <Sequence from={-KIT_CLOCK} layout="none">
        <Camera zoom={cam.zoom} y={cam.y} seed={SEEDS.cam}>
          <WombBackdrop {...BACK} seed={SEEDS.backdrop} />
          <AmnioticSac {...SAC} seed={SEEDS.sac} ripples={RIPPLES}>
            <LightShafts {...LOOK.shafts} seed={SEEDS.shafts} />
            <FluidSpecks seed={SEEDS.far} count={22} />
            <VoiceWaves train={MUM1} frame={f} />
            <VoiceWaves train={STRANGER} frame={f} />
            <VoiceWaves train={MUM2} frame={f} />
            <Placenta {...LOOK.placenta} />
            <WombLayer>
              <g transform={`translate(${BABY.x} ${BABY.y})`}>
                <Fetus week={b.week} size={b.size} pose={b.pose} heartbeat={heartbeat(kit(f), 140)} bloom={0.7 * glow + 0.1 * settle2(f)} cord={cord} uid="c15b" />
              </g>
            </WombLayer>
            <WombLayer blend="screen">
              <FaceGlow b={b} glow={glow} ear={ear} />
            </WombLayer>
            <VoiceWaves train={MUM1} frame={f} part="wash" focus={head} />
            <VoiceWaves train={STRANGER} frame={f} part="wash" />
            <VoiceWaves train={MUM2} frame={f} part="wash" focus={head} />
            <FluidSpecks seed={SEEDS.near} layer="near" count={9} />
          </AmnioticSac>
          <FluidSpecks layer="lens" count={4} seed={SEEDS.lens} />
          <CaptionShade mode="multiply" />
        </Camera>
      </Sequence>
    </AbsoluteFill>
  );
};
