// C11 "The first kick she feels" (W18 -> W20, 9.5 s, enters by a focus pull).
// Reuses the teaser's Scene4 ideas (weekTwenty spring-morph, the kick) on the
// shared kits: fetus kit 18 -> 20, womb kit "mid" look.
//   0.0-1.35  focus pulls back from C10's fingertips to the whole fetus
//   0.45      W18: lanugo glint along the outline + vernix sheen
//   1.95      W19: one slow, low sound ring rolls in; ear glows, tiny startle 2.3
//   3.0-4.1   "Around week twenty,": spring-morph to week 20, sac grows, camera
//             pulls back; a measuring line runs crown -> bottom, then on to the heel
//   4.1-6.1   the fetus stretches
//   6.55      "A flutter...": bubble ripples across the wall (first time it moves)
//   7.6-8.5   "then, a kick.": tuck, kick, rose + gold rings, small flash, 3 px shake
//   9.0-9.5   END: settles into a gentle float
// All beats live in beats.ts; the timing maths in timeline.ts / staging.ts.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import {
  AmnioticSac,
  Camera,
  CaptionShade,
  FluidSpecks,
  LightShafts,
  Placenta,
  SoundWaves,
  WOMB_LOOKS,
  WombBackdrop,
  WombLayer,
  soundProgress,
} from "../../../shared/womb";
import { SAC_C } from "./timeline";
import { RIPPLES, WAVE, WAVE_END, WAVE_START, camera, effects, state } from "./staging";
import { Baby } from "./Baby";
import { Flutter } from "./Flutter";

const L = WOMB_LOOKS.mid;
// keep the sound ring out of the week-tracker band (y 100-290) and the captions (y 1300-1560)
const RING_MASK = "linear-gradient(180deg, transparent 0px, transparent 300px, black 440px, black 1130px, transparent 1290px)";

export const C11: React.FC = () => {
  const f = useCurrentFrame();
  const c = state(f);
  const fx = effects(f, c);
  const cam = camera(f);
  return (
    <AbsoluteFill>
      <Camera zoom={cam.zoom} x={cam.x} y={cam.y} shake={cam.shake} seed="c11-cam">
        <WombBackdrop {...L.backdrop} cx={SAC_C.x} cy={SAC_C.y} r={c.sacR + 40} seed="c11-bd" />
        <AbsoluteFill>
          <AmnioticSac {...L.sac} cx={SAC_C.x} cy={SAC_C.y} r={c.sacR} ripples={RIPPLES} seed="c11-sac">
            <LightShafts {...L.shafts} seed="c11-shafts" />
            <FluidSpecks seed="c11-far" />
            <AbsoluteFill style={{ maskImage: RING_MASK, WebkitMaskImage: RING_MASK }}>
              <SoundWaves {...WAVE} progress={soundProgress(f, WAVE_START, WAVE_END)} />
            </AbsoluteFill>
            <Placenta {...L.placenta} />
            <Flutter f={f} wall={fx.wall} />
            <WombLayer>
              <Baby c={c} fx={fx} f={f} />
            </WombLayer>
            <FluidSpecks seed="c11-near" layer="near" count={10} />
          </AmnioticSac>
        </AbsoluteFill>
        <FluidSpecks layer="lens" count={5} seed="c11-lens" />
        <AbsoluteFill style={{ background: C.gold, opacity: 0.05 * fx.flash, mixBlendMode: "screen" }} />
        <CaptionShade top={Math.max(0.5, fx.capShade)} />
        {fx.capShade > 0.01 && <CaptionShade strength={fx.capShade} top={fx.capShade} />}
      </Camera>
    </AbsoluteFill>
  );
};
