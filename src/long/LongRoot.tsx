// Remotion root with just the "Long" composition (see entry.ts).
import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, WIDTH } from "../theme/layout";
import { LONG_TOTAL } from "./chapters";
import { LongFilm } from "./LongFilm";

export const LongRoot: React.FC = () => (
  <Composition id="Long" component={LongFilm} durationInFrames={LONG_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
);
