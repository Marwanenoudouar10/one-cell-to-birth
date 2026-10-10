import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import { CaptionShade } from "../../../shared/womb";
import { Backdrop } from "./grip/Backdrop";
import { HandWorld } from "./grip/HandWorld";
import { LungWorld } from "./lungs/LungWorld";
import { T } from "./timeline";
import { CaptionScrim, Flash, flashAmount } from "./womb/BirthLight";
import { labourAt } from "./womb/labour";
import { WombWorld } from "./womb/WombWorld";

// C16 "Hello, world" (W40 -> birth -> newborn). Reuses the teaser's Scene5
// (week forty, birth light, the grip, hello) with labour waves and a new
// first-breath lungs insert:
//   womb (head-down, full term) -> labour waves -> walls part, gold-white flash
//   -> two liquid-filled lung trees take their first breaths, one heart glow,
//   the first cry as light -> a finger in the palm, the grip, a gold speck.
export const C16: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = flashAmount(frame);
  // Caption shadow: the womb's dark band hands over to the warm multiply
  // scrim the moment the birth light switches on (as in Scene5), gives a
  // little at the flash peak and settles to the room's resting level.
  const on = tween(frame, T.bloom - 4, T.bloom + 12, [0, 1], EASE.out);
  const settle = tween(frame, T.flashPeak, T.flashOut, [0, 1], EASE.inOut);
  const scrim = on * (0.92 - 0.12 * settle) * (1 - 0.4 * flash);

  return (
    <AbsoluteFill>
      {frame <= T.swap && <WombWorld frame={frame} />}
      {frame >= T.flashPeak && <Backdrop frame={frame} />}
      {frame >= T.handIn && <HandWorld frame={frame} />}
      {frame >= T.flashPeak && frame <= T.lungsOut && <LungWorld frame={frame} />}
      <Flash frame={frame} />
      {/* the tracker band darkens a touch while a labour wave lights the outer folds */}
      <CaptionShade strength={0.75 * (1 - on)} top={0.6 * Math.min(1, labourAt(frame, 760))} />
      <CaptionScrim strength={scrim} />
    </AbsoluteFill>
  );
};
