// C10 "Hands of its own" (W13 -> W17), 10.5 s incl. the 0.5 s fade-in from C09 and the
// 0.5 s focus pull into C11.
//   > Week fifteen: it sucks its thumb.
//   > Week seventeen: fingerprints, set for life, different even from an identical twin's.
//   0-0.5    START = C09's END (whole week-12 fetus, zoom 1.93), on C09's clock: match cut
//   0.5-2.3  silent X-ray: shafts warm cartilage-blue -> bone-white from mid-shaft outward,
//            skull plates grow as islands in a soft membrane; column, ribs, collarbone
//   2.07-2.9 "Week fifteen": the camera glides onto the face (zoom 3.2)
//   3.4-4.7  "sucks its thumb": thumb at the lips on "sucks", cheek-swell sucks, one on "thumb"
//   4.7-5.9  "Week seventeen": the hand opens, the camera dives into the middle fingertip
//   6.0-7.5  "fingerprints, set for life": ridges ripple from 3 start points, lock on "life"
//   8.2-9.7  "different ... twin's": a second fingertip slides in, ripples, locks as a double loop
//   END      two glowing fingertips side by side (C11 focus-pulls back to the whole fetus)
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
