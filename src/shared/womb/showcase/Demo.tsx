// Showcase: 6 s animated demo of the kit (mid look): heartbeat ripples, a
// kick on the wall with camera thump, a voice's sound waves rolling into the
// womb (and rippling the sac), and a slow camera push.
import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import {
  AmnioticSac,
  Camera,
  CaptionShade,
  Cord,
  FluidSpecks,
  LightShafts,
  Placenta,
  Ripple,
  SoundWaves,
  WOMB_LOOKS,
  WombBackdrop,
  WombLayer,
  heartbeatRipples,
  kickShake,
  soundProgress,
  soundRipples,
} from "..";
import { Caption } from "./Caption";
import { Pose, StandIn, belly, heartPt } from "./StandIn";

export const DEMO_LEN = 180;
const KICK = 36;
const S0 = 64;
const S1 = 168;
const L = WOMB_LOOKS.mid;
const WAVE = { from: { x: -140, y: 250 }, dir: 42, count: 6, spacing: 70, length: 1000 };

export const Demo: React.FC = () => {
  const f = useCurrentFrame();
  const kickAt = { x: L.sac.cx + Math.cos(0.9) * L.sac.r, y: L.sac.cy + Math.sin(0.9) * L.sac.r };
  // the stand-in recoils a touch after its kick
  const recoil = tween(f, KICK - 6, KICK, [0, 1], EASE.out) * (1 - tween(f, KICK + 4, KICK + 30, [0, 1], EASE.inOut));
  const pose: Pose = { x: 500 - 10 * recoil, y: 870, s: 1.25, rot: 4 - 3 * recoil };
  const ripples: Ripple[] = [
    ...heartbeatRipples(f, { ...heartPt(pose), start: 2, bpm: 150, strength: 0.45, boostFirst: false }),
    { ...kickAt, t: KICK, kind: "kick" },
    ...soundRipples({ ...WAVE, start: S0, end: S1, strength: 1 }, L.sac),
  ];
  const push = tween(f, 0, DEMO_LEN - 10, [0, 1], EASE.inOut);
  return (
    <Camera zoom={1 + 0.14 * push} x={540 - 20 * push} y={860 - 30 * push} shake={kickShake(f, KICK, 12)}>
      <WombBackdrop {...L.backdrop} />
      <AmnioticSac {...L.sac} ripples={ripples}>
        <LightShafts {...L.shafts} />
        <FluidSpecks seed="demofar" />
        <SoundWaves {...WAVE} progress={soundProgress(f, S0, S1)} />
        <Placenta {...L.placenta} />
        <Cord from={belly(pose)} width={L.cordWidth} />
        <WombLayer>
          <StandIn pose={pose} id="sc-demo" />
        </WombLayer>
        <FluidSpecks seed="demonear" layer="near" count={10} />
      </AmnioticSac>
      <FluidSpecks layer="lens" count={5} seed="demolens" />
      <CaptionShade top={0.7 * push} />
      <Caption text="Your baby can hear your voice." at={S0 + 14} />
    </Camera>
  );
};
