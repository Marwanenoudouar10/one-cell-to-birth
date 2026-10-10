// C00 "The question" (intro hook, counter hidden, 8.5 s; C01 follows by a hard cut).
// "Have you ever wondered how you began? Long before your first breath, you were
// a single cell, smaller than a grain of salt."
//   the film's end image (a newborn's hand gripping a finger, one gold speck in
//   the palm) -> push in, plunge into the speck (light streaks, the room drains
//   away) -> the speck resolves into the gold zygote (Scene1's END look) -> a
//   grain of salt three times its size slides in beside it -> time rewinds: the
//   gold drains out, the egg glides to C01's opening spot as the tube walls and
//   corona fade in. The last frame is Scene1's / C01's frame 0.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import { CaptionShade } from "../../../shared/womb";
import { CellPulse } from "./CellPulse";
import { Bloom, Streaks, Wake } from "./dive/DiveFx";
import { CaptionScrim } from "./grip/CaptionScrim";
import { diveAt } from "./grip/handCam";
import { HandWorld } from "./grip/HandWorld";
import { Speck } from "./grip/Speck";
import { SaltShot } from "./salt/SaltShot";
import { breathAt } from "./s1/Egg";
import { EggStack } from "./s1/EggStack";
import { T, breathAmpAt, clockAt, eggBlurAt, eggXfAt, storyAt, worldAt } from "./timeline";

const bump = (f: number, c: number, w: number) => Math.exp(-((f - c) ** 2) / (2 * w * w));

export const C00: React.FC = () => {
  const f = useCurrentFrame();
  const clock = clockAt(f);
  const egg = eggXfAt(f);
  const world = worldAt(f);
  const cellOn = tween(f, T.cellIn, T.through + 8, [0, 1], EASE.out);
  // the warm room's caption scrim retires during the plunge (the room and the
  // flash fade out of the caption zone themselves); the dark world keeps a soft
  // band until C01's own caption shade has faded in
  const scrim = 0.85 * (1 - Math.min(1, diveAt(f) * 1.8));
  const shade = tween(f, T.dive + 6, T.through, [0, 0.55], EASE.inOut) * (1 - world);

  return (
    <AbsoluteFill>
      <HandWorld frame={f} />
      <Speck frame={f} />
      <Wake frame={f} />
      {f >= T.cellIn && (
        <AbsoluteFill style={{ opacity: cellOn }}>
          <EggStack
            clock={clock}
            story={storyAt(f)}
            x={egg.x}
            y={egg.y}
            z={egg.z}
            breath={breathAt(clock, breathAmpAt(f))}
            blur={eggBlurAt(f)}
            glow={0.6 * bump(f, T.single + 3, 5) + 0.5 * (1 - cellOn)}
            world={world}
          >
            <SaltShot frame={f} />
          </EggStack>
        </AbsoluteFill>
      )}
      <CellPulse frame={f} />
      <Bloom frame={f} />
      <Streaks frame={f} />
      <CaptionScrim strength={scrim} />
      <CaptionShade strength={shade} />
    </AbsoluteFill>
  );
};
