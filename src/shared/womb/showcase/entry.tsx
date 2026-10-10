// Womb kit showcase entry (one Composition "WombShowcase", 360 frames):
//   0-59 early look, 60-119 mid look, 120-179 late look, 180-359 6 s demo,
//   360-419 edge-case tests (see Tests.tsx).
// npx remotion still  src/shared/womb/showcase/entry.tsx WombShowcase out/womb-mid.png --frame=90
// npx remotion render src/shared/womb/showcase/entry.tsx WombShowcase out/womb-demo.mp4 --frames=180-359 --scale=0.5
import React from "react";
import { AbsoluteFill, Composition, Series, registerRoot } from "remotion";
import { Grain } from "../../../overlays/Grain";
import { FPS, HEIGHT, WIDTH } from "../../../theme/layout";
import { C } from "../../../theme/colors";
import { DEMO_LEN, Demo } from "./Demo";
import { Look } from "./Looks";
import { SplitTest, ZoomTest } from "./Tests";

const Showcase: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg0 }}>
    <Series>
      <Series.Sequence durationInFrames={60}>
        <Look look="early" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={60}>
        <Look look="mid" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={60}>
        <Look look="late" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={DEMO_LEN}>
        <Demo />
      </Series.Sequence>
      <Series.Sequence durationInFrames={30}>
        <ZoomTest />
      </Series.Sequence>
      <Series.Sequence durationInFrames={30}>
        <SplitTest />
      </Series.Sequence>
    </Series>
    <Grain />
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <Composition id="WombShowcase" component={Showcase} durationInFrames={180 + DEMO_LEN + 60} fps={FPS} width={WIDTH} height={HEIGHT} />
);

registerRoot(Root);
