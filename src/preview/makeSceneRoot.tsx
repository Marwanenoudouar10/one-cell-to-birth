import React from "react";
import { Composition } from "remotion";
import { ScenePreview } from "../ScenePreview";
import { FPS, HEIGHT, WIDTH } from "../theme/layout";
import { SCENES, SceneId } from "../theme/timing";

// A Remotion root holding just one scene, so a broken file in another scene
// can never break this scene's renders.
export const makeSceneRoot = (id: SceneId, Scene: React.FC): React.FC => {
  const duration = SCENES.find((s) => s.id === id)!.duration;
  const Comp = () => <ScenePreview id={id} Scene={Scene} />;
  return () => (
    <Composition id={id} component={Comp} durationInFrames={duration} fps={FPS} width={WIDTH} height={HEIGHT} />
  );
};
