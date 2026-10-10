// C12 · The senses wake (W21 -> W27, 13.0 s, enters by focus pull).
// Medium shot of the head: mum's heartbeat rolls in as slow low rings and the
// ear glows; a wobbly tummy rumble makes it startle. The camera glides to an
// extreme close-up of the sealed eye; the lids part, a dark glossy eye with a
// warm catch-light, a dim rose-red glow through the wall; one slow blink.
// Timing: beats.ts only. Layers: World (womb + fetus kits) with the sound
// rings behind the baby and the ear glow / macro eye / rumble in front.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CaptionShade } from "../../../shared/womb";
import { shotAt } from "./camera";
import { EdgeLight, RedGlow, SafeShade, Vignette } from "./Light";
import { MacroEye } from "./MacroEye";
import { Rumble } from "./Rumble";
import { EarGlow, HeartPulse, HeartRings } from "./Sound";
import { World } from "./World";

export const C12: React.FC = () => {
  const f = useCurrentFrame();
  const shot = shotAt(f);
  return (
    <AbsoluteFill>
      <World
        shot={shot}
        behind={
          <>
            <RedGlow shot={shot} />
            <HeartPulse />
            <HeartRings />
          </>
        }
        front={
          <>
            <HeartRings front />
            <EarGlow />
            <MacroEye shot={shot} />
            <Rumble />
          </>
        }
      />
      <EdgeLight shot={shot} />
      <Vignette shot={shot} />
      <SafeShade />
      <CaptionShade top={0.3} strength={0.55} />
    </AbsoluteFill>
  );
};
