import React from "react";
import { Composition, registerRoot } from "remotion";
import { FPS, HEIGHT, WIDTH } from "../../../theme/layout";
import { MORPH_FRAMES, Morph } from "./Morph";

// npx remotion render src/shared/embryo/showcase/morphEntry.tsx EmbryoMorph out/embryo-morph.mp4 --scale=0.5 --concurrency=3
registerRoot(() => <Composition id="EmbryoMorph" component={Morph} durationInFrames={MORPH_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />);
