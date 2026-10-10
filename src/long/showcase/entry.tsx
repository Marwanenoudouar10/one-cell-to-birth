// Showcase / QA entry, cheap bands of the long film for every frame:
//   "LongTrackerQA"  top 1080x220 band (background + week tracker + size chip)
//   "LongCaptionsQA" caption band y 1180..1700 (background + captions), to check paging,
//                    the no-stacked-text rule and the end title
//   npx remotion render src/long/showcase/entry.tsx LongTrackerQA out/long-tracker.mp4 --scale=0.5
//   npx remotion render src/long/showcase/entry.tsx LongCaptionsQA out/long-captions.mp4 --scale=0.5
import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { FPS, WIDTH } from "../../theme/layout";
import { LONG_TOTAL } from "../chapters";
import { LONG_LINES } from "../data/lines";
import { BackgroundLong } from "../overlays/BackgroundLong";
import { CaptionsLong } from "../overlays/CaptionsLong";
import { WeekTrackerLong } from "../overlays/WeekTrackerLong";

const TOP = 100;
const H = 220;
const CAP_TOP = 1180;
const CAP_H = 520;

const Band: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
    <div style={{ position: "absolute", left: 0, top: -TOP, width: WIDTH, height: 1920 }}>
      <BackgroundLong totalFrames={LONG_TOTAL} />
      <WeekTrackerLong />
    </div>
  </AbsoluteFill>
);

const CaptionBand: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
    <div style={{ position: "absolute", left: 0, top: -CAP_TOP, width: WIDTH, height: 1920 }}>
      <BackgroundLong totalFrames={LONG_TOTAL} />
      {/* caption zone y 1300..1560, for reference */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, height: 260, boxShadow: "inset 0 0 0 2px #ffffff22" }} />
      <CaptionsLong lines={LONG_LINES} />
    </div>
  </AbsoluteFill>
);

registerRoot(() => (
  <>
    <Composition id="LongTrackerQA" component={Band} durationInFrames={LONG_TOTAL} fps={FPS} width={WIDTH} height={H} />
    <Composition
      id="LongCaptionsQA"
      component={CaptionBand}
      durationInFrames={LONG_TOTAL}
      fps={FPS}
      width={WIDTH}
      height={CAP_H}
    />
  </>
));
