import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { EASE } from "./lib/ease";
import { focusPull } from "./lib/focusPull";
import { Soundtrack } from "./audio/Soundtrack";
import { Background } from "./overlays/Background";
import { Captions } from "./overlays/Captions";
import { Grain } from "./overlays/Grain";
import { WeekTracker } from "./overlays/WeekTracker";
import { SCENE_COMPONENTS } from "./scenes";
import { SCENES, TRANSITION } from "./theme/timing";

// The full 30s film: shared background, the 5 scenes crossfading, then the
// global overlays (tracker, captions, grain) and the soundtrack.
export const Main: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <TransitionSeries>
      {SCENES.map((s, i) => {
        const Scene = SCENE_COMPONENTS[s.id];
        return (
          <React.Fragment key={s.id}>
            <TransitionSeries.Sequence durationInFrames={s.duration}>
              <Scene />
            </TransitionSeries.Sequence>
            {i < SCENES.length - 1 && (
              <TransitionSeries.Transition
                // Scene1 -> Scene2 is a designed match cut (same zygote), so a
                // plain fade. Later cuts change subject, so pull focus.
                presentation={i === 0 ? focusPull({ blur: 0, zoom: 0 }) : focusPull({ blur: 18, zoom: 0.04 })}
                timing={linearTiming({ durationInFrames: TRANSITION, easing: i === 0 ? undefined : EASE.inOut })}
              />
            )}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
    <WeekTracker />
    <Captions />
    <Grain />
    <Soundtrack />
  </AbsoluteFill>
);
