// C10 "Hands of its own" (W13 -> W17, 10.5 s incl. the 0.5 s fade-in).
// START: C09's END (week-12 fetus in the sac, mid look). A silent X-ray shows
// the bones warming to bone-white and the skull plates growing as islands;
// the thumb meets the lips at week 15; the camera pushes into one fingertip,
// whose ridges ripple outward from three start points and lock into a whorl;
// the twin's fingertip slides in and locks into a different pattern.
// END: two glowing fingertips side by side (C11 focus-pulls back out).
// Timing: beats.ts only. No audio here (cues are reported to the orchestrator).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { WombShot } from "./womb/WombShot";
import { wombTimeline } from "./womb/timeline";
import { MacroShot } from "./macro/MacroShot";

export const C10: React.FC = () => {
  const f = useCurrentFrame();
  const womb = wombTimeline(f);
  return (
    <AbsoluteFill>
      <WombShot t={womb} />
      <MacroShot womb={womb} />
    </AbsoluteFill>
  );
};
