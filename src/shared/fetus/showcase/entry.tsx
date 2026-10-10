// Showcase entry (review renders only):
//   npx remotion render src/shared/fetus/showcase/entry.tsx FetusShowcase out/fetus-morph.mp4 --scale=0.5 --props='{"mode":"morph"}'
//   npx remotion still  src/shared/fetus/showcase/entry.tsx FetusShowcase out/fetus-sheet.png --props='{"mode":"sheet"}'
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Showcase } from "./Showcase";

const Root: React.FC = () => (
  <Composition
    id="FetusShowcase"
    component={Showcase}
    durationInFrames={180}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{ mode: "morph", week: 20, anchors: false }}
  />
);

registerRoot(Root);
