import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, tween } from "../../lib/ease";
import { HandWorld } from "./grip/HandWorld";
import { T } from "./timeline";
import { CaptionScrim, Flash, flashAmount } from "./womb/BirthLight";
import { WombWorld } from "./womb/WombWorld";

// Scene5 — "Week forty: one cell has become a whole new human. Hello, world."
// Womb (full-term baby, head down) -> birth light + flash -> newborn's hand
// gripping a grown-up's finger (final frame / thumbnail).
export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = T.flashPeak + 1;
  const flash = flashAmount(frame);
  // The caption shadow is in place the moment the light switches on (the
  // walls start parting right after), holds through the bloom, gives a little
  // at the flash peak (the flash brings its own rose floor) and settles to the
  // hand world's resting level.
  const on = tween(frame, T.bloom - 4, T.bloom + 12, [0, 1], EASE.out);
  const settle = tween(frame, T.flashPeak, T.flashOut, [0, 1], EASE.inOut);
  const scrim = on * (0.92 - 0.12 * settle) * (1 - 0.4 * flash);

  return (
    <AbsoluteFill>
      {frame <= swap && <WombWorld frame={frame} />}
      {frame >= T.flashPeak && <HandWorld frame={frame} />}
      <Flash frame={frame} />
      <CaptionScrim strength={scrim} />
    </AbsoluteFill>
  );
};
