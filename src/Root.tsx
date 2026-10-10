import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { ScenePreview } from "./ScenePreview";
import { SCENE_COMPONENTS } from "./scenes";
import { FPS, HEIGHT, WIDTH } from "./theme/layout";
import { SCENES, TOTAL_FRAMES } from "./theme/timing";
import { LONG_TOTAL } from "./long/chapters";
import { LongFilm } from "./long/LongFilm";

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {SCENES.map((s) => (
      <Composition
        key={s.id}
        id={s.id}
        component={() => <ScenePreview id={s.id} Scene={SCENE_COMPONENTS[s.id]} />}
        durationInFrames={s.duration}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    ))}
    <Composition id="Long" component={LongFilm} durationInFrames={LONG_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
