import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "./overlays/Background";
import { Captions } from "./overlays/Captions";
import { Grain } from "./overlays/Grain";
import { WeekTracker } from "./overlays/WeekTracker";
import { SCENE_START, SceneId } from "./theme/timing";

// One scene on its own, but with the global overlays shifted to the right
// moment, so it looks exactly like it will inside the full film.
export const ScenePreview: React.FC<{ id: SceneId; Scene: React.FC }> = ({ id, Scene }) => {
  const start = SCENE_START[id];
  return (
    <AbsoluteFill>
      <Sequence from={-start}>
        <Background />
      </Sequence>
      <Scene />
      <Sequence from={-start}>
        <WeekTracker />
        <Captions />
      </Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
