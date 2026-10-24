// C11 "The first kick she feels" (W18 -> W20, 9.5 s, enters by a focus pull).
// Reuses the teaser's Scene4 (weekTwenty spring-morph with its inhale + bloom,
// the kick's tuck -> snap -> springy follow-through, camera punch + kickShake)
// on the shared kits: fetus kit 18 -> 20, womb kit "mid" look.
//   0-1.3     focus pulls back from C10's fingertips to the whole fetus
//   f25       WEEK 18 lands: lanugo glint along the outline + vernix sheen
//   f57-69    WEEK 19: one slow, low sound ring rolls in through the wall; the
//             ear catches it and glows, tiny startle (f69)
//   3.0-3.5   "Around week twenty,": spring-morph to week 20, sac grows, camera
//             pulls back; a ruler runs crown -> bottom, then (gold) on to the heel
//   4.2-6.1   "its mother feels it move for the first time.": the fetus stretches
//   7.04      "A flutter...": the camera has leaned down to the lower-right wall;
//             the foot flicks 4 times and the wall by the toes quivers, glows and
//             breaks into small bubble-like ripples; the womb wall, dead still
//             since C07, stirs and starts to breathe
//   8.07-8.8  "then, a kick.": tuck while the camera pushes in, kick, rose + gold
//             rings, small flash, 3 px shake
//   9.0-9.5   END: the follow-through settles under C12's focus pull; the rings
//             spread out and fade, the camera stays on the kick
// All beats live in beats.ts; the timing maths in timeline.ts / staging.ts.
import React from "react";
import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import { EASE } from "../../../lib/ease";
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
import { R20, SAC_C } from "./timeline";
import { WAVE, WAVE_END, WAVE_START, camera, effects, ripplesAt, state, wall } from "./staging";
import { Baby } from "./Baby";
import { Flutter } from "./Flutter";

const L = WOMB_LOOKS.mid;
// keep the sound ring out of the week-tracker band (y 100-290) and the captions (y 1300-1560)
const RING_MASK = "linear-gradient(180deg, transparent 0px, transparent 300px, black 440px, black 1130px, transparent 1290px)";

// A smooth (smoothstep-ramped) dark band, for the opening close-up where bright
// skin fills the caption and tracker bands: no visible edge where it starts.
const ramp = (y0: number, y1: number, a0: number, a1: number, n = 6) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const a = a0 + (a1 - a0) * t * t * (3 - 2 * t);
    const hex = Math.round(a * 255).toString(16).padStart(2, "0");
    return `${C.bg0}${hex} ${Math.round(y0 + (y1 - y0) * t)}px`;
  }).join(", ");
const CLOSE_SHADE = `linear-gradient(180deg, ${ramp(40, 460, 0.8, 0)}, ${ramp(920, 1320, 0, 0.62)}, ${ramp(1540, 1860, 0.62, 0)})`;

export const C11: React.FC = () => {
  const f = useCurrentFrame();
  const c = state(f);
  const fx = effects(f, c);
  const cam = camera(f);
  const w = wall(f);
  // the lean / push-in for the flutter and kick lifts the sac rim up under the
  // week tracker (y 100-290): deepen the tracker shade with it (camera-tied)
  const rimY = 860 + (SAC_C.y - c.sacR - cam.y) * cam.zoom;
  const topShade = 0.5 + 0.5 * EASE.inOut(Math.max(0, Math.min(1, (320 - rimY) / 90)));
  return (
    <AbsoluteFill>
      <Camera zoom={cam.zoom} x={cam.x} y={cam.y} shake={cam.shake} seed="c11-cam">
        {/* the wall stays dead still (as in C07-C10) until the flutter stirs it */}
        <Freeze frame={w.clock}>
          <WombBackdrop {...L.backdrop} cx={SAC_C.x} cy={SAC_C.y} r={R20 + 40} breathe={w.breathe} seed="c11-bd" />
        </Freeze>
        <AbsoluteFill>
          <AmnioticSac {...L.sac} cx={SAC_C.x} cy={SAC_C.y} r={c.sacR} ripples={ripplesAt(f)} seed="c11-sac">
            <LightShafts {...L.shafts} seed="c11-shafts" />
            <FluidSpecks seed="c11-far" />
            <AbsoluteFill style={{ maskImage: RING_MASK, WebkitMaskImage: RING_MASK }}>
              <SoundWaves {...WAVE} progress={soundProgress(f, WAVE_START, WAVE_END)} />
            </AbsoluteFill>
            <Placenta {...L.placenta} />
            <AbsoluteFill style={{ maskImage: RING_MASK, WebkitMaskImage: RING_MASK, mixBlendMode: "screen" }}>
              <Flutter f={f} />
            </AbsoluteFill>
            <WombLayer>
              <Baby c={c} fx={fx} f={f} />
            </WombLayer>
            <FluidSpecks seed="c11-near" layer="near" count={10} />
          </AmnioticSac>
        </AbsoluteFill>
        <FluidSpecks layer="lens" count={5} seed="c11-lens" />
        <AbsoluteFill style={{ background: C.gold, opacity: 0.05 * fx.flash, mixBlendMode: "screen" }} />
        <CaptionShade top={topShade} />
        <AbsoluteFill style={{ background: CLOSE_SHADE, opacity: fx.capShade }} />
      </Camera>
    </AbsoluteFill>
  );
};
