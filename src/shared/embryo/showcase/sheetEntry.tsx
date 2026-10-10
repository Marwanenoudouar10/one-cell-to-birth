import React from "react";
import { Composition, registerRoot } from "remotion";
import { FPS, HEIGHT, WIDTH } from "../../../theme/layout";
import { Sheet, SheetProps } from "./Sheet";

// npx remotion still src/shared/embryo/showcase/sheetEntry.tsx EmbryoSheet out/embryo-sheet.png --frame=0
// --props='{"weeks":[6],"cols":1}' for one big embryo, '"scene3":true' to sit week 6 where Scene3 does.
const defaults: SheetProps = { weeks: [3, 3.5, 4, 4.5, 5, 6, 7, 8], cols: 2 };

registerRoot(() => (
  <Composition id="EmbryoSheet" component={Sheet} durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={defaults} />
));
